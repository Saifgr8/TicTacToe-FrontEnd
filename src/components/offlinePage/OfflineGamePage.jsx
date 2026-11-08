import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import PlayerScoreDisplay from "../Ui/PlayerScoreDisplay";
import GamePlayingBoard from "../Ui/GamePlayingBoard";
import GameSpecialMoves from "../Ui/GameSpecialMoves";
import MobilePlayerRow from "../Ui/MobilePlayerRow";
import MobileMovePicker from "../Ui/MobileMovePicker";
import { createGameApi, getGameSessionApi, makeMoveApi } from "../../api/game/gameApi";
import { getBackendErrorMessage } from "../../api/errors";
import {
  moveDescriptions,
  specialMoveCost,
  movePatterns,
  emptyPatternMoveDescription,
} from "../utils/descriptionHelper";
import CountdownTimer from "../Ui/Timer";
import useCountdownTimer from "../Ui/useCountdownTimer";
import { getCurrentPlayerSymbol, getPlayerSymbols } from "../utils/sessionSymbols";
import { getBoardCoordinate } from "../utils/boardCoordinates";

const BOT_POLL_INTERVAL = 400;
const BOT_HIGHLIGHT_DURATION = 500;
const BOT_SPECIAL_REVIEW_DURATION = 2500;

const OfflineGamePage = () => {
  const [setup] = useState(() => ({
    player1: localStorage.getItem("player1"),
    player1LocalName: localStorage.getItem("username"),
    player2: localStorage.getItem("player2"),
    player1Symbol: localStorage.getItem("player1Symbol"),
    player2Symbol: localStorage.getItem("player2Symbol"),
    startingPlayer: localStorage.getItem("currentPlayer"),
    player1Color: localStorage.getItem("player1Color"),
    player2Color: localStorage.getItem("player2Color"),
    token: localStorage.getItem("token"),
  }));
  const { player1, player1LocalName, player2, player1Color, player2Color, token } = setup;
  const validSetup = Boolean(
    player1 && player1LocalName && player2 && setup.player1Symbol &&
    setup.player2Symbol && setup.startingPlayer
  );
  const [session, setSession] = useState(null);
  const [board, setBoard] = useState([]);
  const [selectedMoveType, setSelectedMoveType] = useState("NORMAL");
  const [selectedMovePattern, setSelectedMovePattern] = useState("NONE");
  const [timerKey, setTimerKey] = useState(0);
  const [gameWinner, setGameWinner] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pollError, setPollError] = useState("");
  const [authenticationRequired, setAuthenticationRequired] = useState(false);
  const [botMove, setBotMove] = useState(null);
  const [botMoveHighlight, setBotMoveHighlight] = useState(null);
  const [reviewingBotMove, setReviewingBotMove] = useState(false);
  const [movePending, setMovePending] = useState(false);
  const gameOverRef = useRef(false);
  const movePendingRef = useRef(false);
  const mountedRef = useRef(false);
  const createRequestRef = useRef(null);
  const lastBotMoveKeyRef = useRef(null);
  const highlightTimerRef = useRef(null);
  const reviewTimerRef = useRef(null);
  const botSpecialPendingRef = useRef(false);
  const p1Name = session?.player1Username || player1LocalName || player1;
  const p2Name = session?.player2Username || player2;
  const currentPlayerSymbol = getCurrentPlayerSymbol(session, p1Name, p2Name);
  const previewTwist = Boolean(
    session && !session.twistActive && !session.botThinking &&
    !session.botError && !pollError && !gameWinner && selectedMoveType === "TWIST"
  );
  const displayedSymbol = getCurrentPlayerSymbol(session, p1Name, p2Name, previewTwist);
  const displayedSymbols = getPlayerSymbols(session, previewTwist);
  const currentPlayerPoints = session?.currentPlayer === p1Name
    ? session?.player1Points
    : session?.currentPlayer === p2Name
    ? session?.player2Points
    : undefined;
  const currentPlayerTwistTurns = session?.currentPlayer === p1Name
    ? session?.player1TwistTurns
    : session?.player2TwistTurns;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(highlightTimerRef.current);
      clearTimeout(reviewTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!validSetup) return;
    let active = true;
    if (!createRequestRef.current) {
      createRequestRef.current = createGameApi({
        player1Username: player1LocalName,
        player2Username: player2,
        player1Symbol: setup.player1Symbol,
        player2Symbol: setup.player2Symbol,
        startingPlayer: setup.startingPlayer,
        boardSize: 6,
        token,
        gameMode: player2 === "tictacbot" ? "BOTMATCH" : "PVPOFFLINE",
      });
    }
    createRequestRef.current.then((data) => {
      if (!active) return;
      if (data?.error) throw new Error(getBackendErrorMessage(data, "Could not create game."));
      if (!Array.isArray(data?.board)) throw new Error("The game server returned an invalid session.");
      setSession(data);
      setBoard(data.board);
      if (data.winner != null) {
        gameOverRef.current = true;
        setGameWinner(data.winner);
      }
    }).catch((error) => {
      if (!active) return;
      if (error.status === 401) setAuthenticationRequired(true);
      else setErrorMessage(error.message || "Could not create game.");
    });
    return () => { active = false; };
  }, [validSetup, setup, player1LocalName, player2, token]);

  const handleTimeUp = useCallback(() => {
    if (gameOverRef.current) return;
    const activePlayer = session?.currentPlayer;
    const winner = activePlayer === p1Name ? player2 : activePlayer === p2Name ? player1 : null;
    if (!winner) {
      setErrorMessage("Could not determine the winner when time ran out.");
      return;
    }
    gameOverRef.current = true;
    setTimedOut(true);
    setGameWinner(winner);
  }, [session?.currentPlayer, p1Name, p2Name, player1, player2]);

  const timeLeft = useCountdownTimer({
    initialTime: 30,
    resetSignal: timerKey,
    onTimeUp: handleTimeUp,
    gameWinner,
    enabled: Boolean(session) && !session?.botThinking && !session?.botError && !pollError && !reviewingBotMove,
  });

  useEffect(() => {
    if (!session?.botThinking || session?.botError || pollError || gameWinner) return;
    const controller = new AbortController();
    let active = true;
    let timer;
    const poll = async () => {
      try {
        const updated = await getGameSessionApi(session.sessionId, token, controller.signal);
        if (!active || gameOverRef.current) return;
        if (updated?.error) throw new Error(getBackendErrorMessage(updated, "Could not retrieve game session."));
        if (!Array.isArray(updated?.board) || typeof updated.botThinking !== "boolean") {
          throw new Error("The game server returned an invalid session.");
        }
        setSession(updated);
        setBoard((previous) => JSON.stringify(previous) === JSON.stringify(updated.board) ? previous : updated.board);
        if (player2 === "tictacbot" && updated.lastMove && updated.lastMovePlayer === player2) {
          const moveKey = JSON.stringify([updated.lastMove, updated.board]);
          if (moveKey !== lastBotMoveKeyRef.current) {
            lastBotMoveKeyRef.current = moveKey;
            setBotMove(updated.lastMove);
            clearTimeout(highlightTimerRef.current);
            const { x, y } = updated.lastMove;
            if (Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && Array.isArray(updated.board[x]) && y < updated.board[x].length) {
              setBotMoveHighlight({ x, y });
              highlightTimerRef.current = setTimeout(() => setBotMoveHighlight(null), BOT_HIGHLIGHT_DURATION);
            } else {
              setBotMoveHighlight(null);
            }
            if (updated.lastMove.moveType && updated.lastMove.moveType !== "NORMAL" && updated.winner == null) {
              botSpecialPendingRef.current = true;
            }
          }
        }
        if (updated.botError) {
          setPollError(`Bot error: ${getBackendErrorMessage({ message: updated.botError }, "Could not make a bot move.")}`);
          return;
        }
        if (updated.winner != null) {
          gameOverRef.current = true;
          setGameWinner(updated.winner);
        }
        if (!updated.botThinking) {
          if (botSpecialPendingRef.current && updated.winner == null) {
            botSpecialPendingRef.current = false;
            clearTimeout(reviewTimerRef.current);
            setReviewingBotMove(true);
            reviewTimerRef.current = setTimeout(() => setReviewingBotMove(false), BOT_SPECIAL_REVIEW_DURATION);
          }
          setTimerKey((previous) => previous + 1);
        }
        else timer = setTimeout(poll, BOT_POLL_INTERVAL);
      } catch (error) {
        if (active && !controller.signal.aborted) {
          if (error.status === 401) setAuthenticationRequired(true);
          else setPollError(error.message || "Could not retrieve game session.");
        }
      }
    };
    timer = setTimeout(poll, BOT_POLL_INTERVAL);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [session?.sessionId, session?.botThinking, session?.botError, pollError, gameWinner, player2, token]);

  useEffect(() => {
    setSelectedMoveType(session?.doubleOverrideActive ? "DOUBLE_OVERRIDE" : "NORMAL");
    setSelectedMovePattern("NONE");
  }, [session]);

  const makeMove = async (x, y) => {
    if (!session || session.botThinking || session.botError || pollError || reviewingBotMove ||
        gameOverRef.current || movePendingRef.current) return;
    if (session.twistActive && selectedMoveType === "TWIST") {
      setSelectedMoveType("NORMAL");
      setErrorMessage("Twist is unavailable while a twist is active.");
      return;
    }
    if (!currentPlayerSymbol) {
      setErrorMessage("Could not determine the current player's symbol.");
      return;
    }
    movePendingRef.current = true;
    setMovePending(true);
    setErrorMessage("");
    try {
      const updated = await makeMoveApi({
        sessionId: session.sessionId,
        x, y,
        symbol: currentPlayerSymbol,
        moveType: selectedMoveType || "NORMAL",
        patternType: selectedMovePattern || "NONE",
        board,
        token,
      });
      if (!mountedRef.current || gameOverRef.current) return;
      if (updated?.error) throw new Error(getBackendErrorMessage(updated, "Could not make move."));
      if (!Array.isArray(updated?.board)) throw new Error("The game server returned an invalid session.");
      setSession(updated);
      setBoard(updated.board);
      setTimerKey((previous) => previous + 1);
      if (updated.winner != null) {
        gameOverRef.current = true;
        setGameWinner(updated.winner);
      }
    } catch (error) {
      if (mountedRef.current && !gameOverRef.current) {
        if (error.status === 401) setAuthenticationRequired(true);
        else setErrorMessage(error.message || "Could not make move.");
      }
    } finally {
      movePendingRef.current = false;
      if (mountedRef.current) setMovePending(false);
    }
  };

  if (!validSetup) return <Navigate to="/offlinePage" replace />;
  if (authenticationRequired) return <Navigate to="/signin" replace state={{ loginRequired: true }} />;
  const disabled = Boolean(!session || gameWinner || movePending || session.botThinking || session.botError || pollError || reviewingBotMove);
  const botCoordinate = botMove && getBoardCoordinate(botMove.x, botMove.y);
  const botMoveMessage = botMove
    ? `${player2} played ${String(botMove.moveType || "NORMAL").replaceAll("_", " ")}${botMove.patternType && botMove.patternType !== "NONE" ? ` (${botMove.patternType.replaceAll("_", " ")})` : ""}${botCoordinate ? ` at ${botCoordinate}` : ""}${botMove.symbol ? ` (${botMove.symbol})` : ""}.`
    : "";
  const botStatus = session?.botError
    ? `Bot error: ${getBackendErrorMessage({ message: session.botError }, "Could not make a bot move.")}`
    : pollError
    ? `Bot update failed: ${pollError}`
    : session?.botThinking && !gameWinner
    ? "Bot is thinking..."
    : botMoveMessage;

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] bg-[#f8f8fc] px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:py-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 lg:mb-3">
          <div className={gameWinner ? "w-full" : ""}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Offline match</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Tic Tac Twist</h1>
          </div>
          {board.length > 0 && <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{board.length} × {board.length} board</span>}
        </div>
        {errorMessage && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {errorMessage} {!session && <Link className="ml-2 underline" to="/offlinePage">Return to setup</Link>}
          </div>
        )}
        {!session && !errorMessage && <p role="status">Creating match...</p>}
        {session && (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:gap-3">
            <div className="order-2 space-y-5 lg:order-1 lg:space-y-3">
              <div className=" w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 lg:rounded-2xl">
                <div>
                  {gameWinner ? (
                    <div role="status" className=" w-full motion-safe:animate-[winner-entrance_600ms_ease-out_both]">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Match complete</p>
                      <div className="mt-1 flex w-full justify-evenly gap-3">
                        <h2 className="break-words text-3xl font-black tracking-tight text-emerald-700 dark:text-emerald-300 lg:text-4xl animate-winner-bounce">{gameWinner} wins!</h2>
                        <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                          Replay
                        </button>
                      </div>
                      {timedOut && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Opponent ran out of time. This result is local to this page.</p>}
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Current turn</p>
                      <h2 className="mt-1 text-lg font-bold lg:text-2xl">{session.currentPlayer === p1Name ? player1 : session.currentPlayer === p2Name ? player2 : session.currentPlayer} <span className="text-indigo-600 dark:text-indigo-400">({displayedSymbol || "—"}{previewTwist && " preview"})</span></h2>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Selected move: <span className={selectedMoveType !== "NORMAL" ? "inline-block rounded-md bg-amber-100 px-2 py-0.5 font-bold text-amber-900 ring-1 ring-amber-400 dark:bg-amber-900 dark:text-amber-100 dark:ring-amber-600" : ""}>{selectedMoveType.replaceAll("_", " ")}{selectedMoveType === "PATTERN_BOMB" && selectedMovePattern !== "NONE" ? ` (${selectedMovePattern.replaceAll("_", " ")})` : ""}</span></p>
                      {(session.twistActive || session.doubleOverrideActive) && (
                        <div aria-label="Active effects" className="mt-3 flex flex-wrap gap-2">
                          {session.twistActive && (
                            <p className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-900 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-100">
                              Twist active · {currentPlayerTwistTurns ?? "—"} turn(s) left for {session.currentPlayer === p1Name ? player1 : session.currentPlayer === p2Name ? player2 : session.currentPlayer}
                            </p>
                          )}
                          {session.doubleOverrideActive && (
                            <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
                              Double override active · {session.doubleOverrideTurnsLeft + 1} turn(s) left
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {!gameWinner && <CountdownTimer timeLeft={timeLeft} compact />}
              </div>
              {botStatus && <p role="status" className={`${!session.botError && !pollError ? "hidden lg:block" : ""} rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100`}>{botStatus}</p>}
              {reviewingBotMove && !gameWinner && !session.botThinking && <p role="status" className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Take a moment to review the bot&apos;s special move. Your timer is paused.</p>}
              {movePending && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Submitting move...</p>}
              <div className="mx-auto w-full max-w-[600px] lg:max-w-[min(600px,max(260px,calc(100dvh-275px)))]">
                <div className="mb-2 lg:hidden">
                  <MobilePlayerRow name={player1} symbol={displayedSymbols?.player1} points={session.player1Points}
                    color={player1Color} active={!gameWinner && session.currentPlayer === p1Name} previewTwist={previewTwist} />
                </div>
                <GamePlayingBoard board={board} makeMove={makeMove} currentPlayer={session.currentPlayer}
                  threePatterns={session.threePatterns} winPattern={session.winPattern}
                  player1={player1} player2={player2} localName={player1LocalName}
                  player1Color={player1Color} player2Color={player2Color} disabled={disabled}
                  highlightDuration={player2 === "tictacbot" ? 1400 : 500} botMoveHighlight={botMoveHighlight} showCoordinates />
                <div className="mt-2 lg:hidden">
                  <MobilePlayerRow name={player2} symbol={displayedSymbols?.player2} points={session.player2Points}
                    color={player2Color} active={!gameWinner && session.currentPlayer === p2Name} previewTwist={previewTwist} />
                  {session.botThinking && !gameWinner && !session.botError && !pollError && (
                    <p role="status" className="mt-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">Bot is thinking...</p>
                  )}
                  {botMoveMessage && (
                    <div className="mt-2 flex items-start gap-2" role="status">
                      <span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${player2Color || "bg-slate-700"}`}>{displayedSymbols?.player2 || "—"}</span>
                      <p className="rounded-2xl rounded-tl-sm bg-slate-200 px-3 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100">{botMoveMessage}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="hidden lg:order-2 lg:flex lg:flex-col lg:gap-3">
            <div className="order-1">
              <PlayerScoreDisplay player1Username={player1} player2Username={player2}
                player1Points={session.player1Points} player1Symbol={session.player1Symbol}
                player2Points={session.player2Points} player2Symbol={session.player2Symbol}
                isTwistActive={session.twistActive} previewTwist={previewTwist}
                player1Color={player1Color} player2Color={player2Color} compact />
            </div>
            {!gameWinner && <div className="order-3">
              <GameSpecialMoves currentPlayerPoints={currentPlayerPoints} setSelectedMovePattern={setSelectedMovePattern}
                setSelectedMoveType={setSelectedMoveType} specialMoveCost={specialMoveCost}
                selectedMoveType={selectedMoveType} movePatterns={movePatterns}
                emptyPatternMoveDescription={emptyPatternMoveDescription} selectedMovePattern={selectedMovePattern}
                moveDescriptions={moveDescriptions} isTwistActive={session.twistActive} disabled={disabled} compact />
            </div>}
            </div>
            {!gameWinner && <MobileMovePicker currentPlayerPoints={currentPlayerPoints} setSelectedMovePattern={setSelectedMovePattern}
              setSelectedMoveType={setSelectedMoveType} specialMoveCost={specialMoveCost}
              selectedMoveType={selectedMoveType} movePatterns={movePatterns}
              emptyPatternMoveDescription={emptyPatternMoveDescription} selectedMovePattern={selectedMovePattern}
              moveDescriptions={moveDescriptions} isTwistActive={session.twistActive} disabled={disabled} />}
          </div>
        )}
      </div>
    </main>
  );
};

export default OfflineGamePage;
