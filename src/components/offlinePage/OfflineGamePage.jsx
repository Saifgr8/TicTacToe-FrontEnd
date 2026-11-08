import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import PlayerScoreDisplay from "../Ui/PlayerScoreDisplay";
import GamePlayingBoard from "../Ui/GamePlayingBoard";
import GameSpecialMoves from "../Ui/GameSpecialMoves";
import { createGameApi, getGameSessionApi, makeMoveApi } from "../../api/game/gameApi";
import {
  moveDescriptions,
  specialMoveCost,
  movePatterns,
  emptyPatternMoveDescription,
} from "../utils/descriptionHelper";
import CountdownTimer from "../Ui/Timer";
import useCountdownTimer from "../Ui/useCountdownTimer";
import { getCurrentPlayerSymbol } from "../utils/sessionSymbols";

const BOT_POLL_INTERVAL = 400;

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
  const [botMove, setBotMove] = useState(null);
  const [movePending, setMovePending] = useState(false);
  const gameOverRef = useRef(false);
  const movePendingRef = useRef(false);
  const mountedRef = useRef(false);
  const createRequestRef = useRef(null);
  const p1Name = session?.player1Username || player1LocalName || player1;
  const p2Name = session?.player2Username || player2;
  const currentPlayerSymbol = getCurrentPlayerSymbol(session, p1Name, p2Name);
  const previewTwist = Boolean(
    session && !session.twistActive && !session.botThinking &&
    !session.botError && !pollError && !gameWinner && selectedMoveType === "TWIST"
  );
  const displayedSymbol = getCurrentPlayerSymbol(session, p1Name, p2Name, previewTwist);
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
    return () => { mountedRef.current = false; };
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
      if (data?.error) throw new Error(data.message || "Could not create game.");
      if (!Array.isArray(data?.board)) throw new Error("The game server returned an invalid session.");
      setSession(data);
      setBoard(data.board);
      if (data.winner != null) {
        gameOverRef.current = true;
        setGameWinner(data.winner);
      }
    }).catch((error) => {
      if (active) setErrorMessage(error.message || "Could not create game.");
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
    enabled: Boolean(session) && !session?.botThinking && !session?.botError && !pollError,
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
        if (updated?.error) throw new Error(updated.message || "Could not retrieve game session.");
        if (!Array.isArray(updated?.board) || typeof updated.botThinking !== "boolean") {
          throw new Error("The game server returned an invalid session.");
        }
        setSession(updated);
        setBoard((previous) => JSON.stringify(previous) === JSON.stringify(updated.board) ? previous : updated.board);
        if (updated.lastMove && updated.lastMovePlayer === player2) setBotMove(updated.lastMove);
        if (updated.botError) {
          setPollError(`Bot error: ${updated.botError}`);
          return;
        }
        if (updated.winner != null) {
          gameOverRef.current = true;
          setGameWinner(updated.winner);
        }
        if (!updated.botThinking) setTimerKey((previous) => previous + 1);
        else timer = setTimeout(poll, BOT_POLL_INTERVAL);
      } catch (error) {
        if (active && !controller.signal.aborted) {
          setPollError(error.message || "Could not retrieve game session.");
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
    if (!session || session.botThinking || session.botError || pollError ||
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
      if (updated?.error) throw new Error(updated.message || "Could not make move.");
      if (!Array.isArray(updated?.board)) throw new Error("The game server returned an invalid session.");
      setSession(updated);
      setBoard(updated.board);
      setBotMove(null);
      setTimerKey((previous) => previous + 1);
      if (updated.winner != null) {
        gameOverRef.current = true;
        setGameWinner(updated.winner);
      }
    } catch (error) {
      if (mountedRef.current && !gameOverRef.current) setErrorMessage(error.message || "Could not make move.");
    } finally {
      movePendingRef.current = false;
      if (mountedRef.current) setMovePending(false);
    }
  };

  if (!validSetup) return <Navigate to="/offlinePage" replace />;
  const disabled = Boolean(!session || gameWinner || movePending || session.botThinking || session.botError || pollError);
  const botStatus = session?.botError
    ? `Bot error: ${session.botError}`
    : pollError
    ? `Bot update failed: ${pollError}`
    : session?.botThinking
    ? "Bot is thinking..."
    : botMove
    ? `${player2} played ${String(botMove.moveType || "NORMAL").replaceAll("_", " ")}${botMove.patternType && botMove.patternType !== "NONE" ? ` (${botMove.patternType.replaceAll("_", " ")})` : ""} at row ${botMove.x + 1}, column ${botMove.y + 1}${botMove.symbol ? ` (${botMove.symbol})` : ""}.`
    : "";

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] bg-[#f8f8fc] px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:py-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 lg:mb-3">
          <div>
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
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:p-3">
                <div>
                  {gameWinner ? (
                    <div role="status">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Match complete</p>
                      <h2 className="mt-1 text-2xl font-bold">{gameWinner} wins!</h2>
                      {timedOut && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Opponent ran out of time. This result is local to this page.</p>}
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Current turn</p>
                      <h2 className="mt-1 text-2xl font-bold">{session.currentPlayer === p1Name ? player1 : session.currentPlayer === p2Name ? player2 : session.currentPlayer} <span className="text-indigo-600 dark:text-indigo-400">({displayedSymbol || "—"}{previewTwist && " preview"})</span></h2>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Move: {selectedMoveType.replaceAll("_", " ")}</p>
                    </>
                  )}
                  {session.doubleOverrideActive && <p className="mt-2 text-sm">Double override: {session.doubleOverrideTurnsLeft + 1} turn(s) left</p>}
                  {session.twistActive && <p className="mt-2 text-sm">Twist: {currentPlayerTwistTurns ?? "—"} turn(s) left for you</p>}
                </div>
                <CountdownTimer timeLeft={timeLeft} />
              </div>
              {botStatus && <p role="status" className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100">{botStatus}</p>}
              {movePending && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Submitting move...</p>}
              <div className="mx-auto w-full max-w-[600px] lg:max-w-[min(600px,max(260px,calc(100dvh-275px)))]">
                <GamePlayingBoard board={board} makeMove={makeMove} currentPlayer={session.currentPlayer}
                  threePatterns={session.threePatterns} winPattern={session.winPattern}
                  player1={player1} player2={player2} localName={player1LocalName}
                  player1Color={player1Color} player2Color={player2Color} disabled={disabled}
                  highlightDuration={player2 === "tictacbot" ? 1400 : 500} />
              </div>
            </div>
            <div className="contents lg:order-2 lg:flex lg:flex-col lg:gap-3">
            <div className="order-1">
              <PlayerScoreDisplay player1Username={player1} player2Username={player2}
                player1Points={session.player1Points} player1Symbol={session.player1Symbol}
                player2Points={session.player2Points} player2Symbol={session.player2Symbol}
                isTwistActive={session.twistActive} previewTwist={previewTwist}
                player1Color={player1Color} player2Color={player2Color} compact />
            </div>
            <div className="order-3">
              <GameSpecialMoves currentPlayerPoints={currentPlayerPoints} setSelectedMovePattern={setSelectedMovePattern}
                setSelectedMoveType={setSelectedMoveType} specialMoveCost={specialMoveCost}
                selectedMoveType={selectedMoveType} movePatterns={movePatterns}
                emptyPatternMoveDescription={emptyPatternMoveDescription} selectedMovePattern={selectedMovePattern}
                moveDescriptions={moveDescriptions} isTwistActive={session.twistActive} disabled={disabled} compact />
            </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default OfflineGamePage;
