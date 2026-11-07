import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayerScoreDisplay from "../Ui/PlayerScoreDisplay";
import GamePlayingBoard from "../Ui/GamePlayingBoard";
import GameSpecialMoves from "../Ui/GameSpecialMoves";
import { createGameApi, makeMoveApi } from "../../api/game/gameApi";
import {
  moveDescriptions,
  specialMoveCost,
  movePatterns,
  emptyPatternMoveDescription,
} from "../utils/descriptionHelper";
import CountdownTimer from "../Ui/Timer";
import { pre } from "framer-motion/client";
import { time } from "framer-motion";
import { toast } from "react-toastify";

const OfflineGamePage = () => {
  const [player1, setPlayer1] = useState(null);
  const [player1LocalName, setPlayer1LocalName] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [player1Symbol, setPlayer1Symbol] = useState(null);
  const [player2Symbol, setPlayer2Symbol] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentPlayerSymbol, setCurrentPlayerSymbol] = useState(null);
  const [session, setSession] = useState(null);
  const [board, setBoard] = useState([]);
  const [selectedMoveType, setSelectedMoveType] = useState("");
  const [selectedMovePattern, setSelectedMovePattern] = useState("");
  const [turns, setTurns] = useState(0);
  const [gameWinner, setGameWinner] = useState(null);
  const [gameDraw, setGameDraw] = useState(false);
  const [timerKey, setTimerKey] = useState(9);
  const [player1Color, setPlayer1Color] = useState("");
  const [player2Color, setPlayer2Color] = useState("");
  const [player1Points, setPlayer1Points] = useState(0);
  const [player2Points, setPlayer2Points] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  //invalid mode
  //cell occuipoed
  //login error

  useEffect(() => {
    let p1 = localStorage.getItem("player1");
    let p2 = localStorage.getItem("player2");
    let p1Symbol = localStorage.getItem("player1Symbol");
    let p2Symbol = localStorage.getItem("player2Symbol");
    let currentP = localStorage.getItem("currentPlayer");
    let token = localStorage.getItem("token");
    let localName = localStorage.getItem("username");
    let player1C = localStorage.getItem("player1Color");
    let player2C = localStorage.getItem("player2Color");
    setPlayer1(p1);
    setPlayer2(p2);
    setPlayer1Symbol(p1Symbol);
    setPlayer2Symbol(p2Symbol);
    setCurrentPlayer(currentP);
    setPlayer1LocalName(localName);
    setPlayer1Color(player1C);
    setPlayer2Color(player2C);
    if (currentP === p1) {
      setCurrentPlayerSymbol(p1Symbol);
    } else {
      setCurrentPlayerSymbol(p2Symbol);
    }

    createGameApi({
      player1Username: localName,
      player2Username: p2,
      player1Symbol: p1Symbol,
      player2Symbol: p2Symbol,
      startingPlayer: currentP,
      boardSize: 6
       ,
      token,
      gameMode: player2 === "tictacbot" ? "BOTMATCH" : "PVPOFFLINE",
    })
      .then((data) => {
        setSession(data);
        setBoard(data?.board);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      setErrorMessage("");
    }
  }, [errorMessage]);

  useEffect(() => {
    if (!session?.doubleOverrideActive) {
      setSelectedMoveType("NORMAL");
      setSelectedMovePattern("NONE");
    } else {
      setSelectedMoveType("DOUBLE_OVERRIDE");
      setSelectedMovePattern("NONE");
    }
  }, [session]);

  const navigate = useNavigate();
  if (!currentPlayer) {
    navigate("/");
  }

  const makeMove = async (i, j) => {
    if (!session) return;

    const payload = {
      sessionId: session.sessionId,
      x: i,
      y: j,
      symbol: currentPlayerSymbol,
      moveType: selectedMoveType || "NORMAL",
      patternType: selectedMovePattern || "NONE",
      board: board,
      token: localStorage.getItem("token"), // already Bearer <token>
    };
    try {
      const updatedSession = await makeMoveApi(payload);
      console.log(updatedSession);
      if (updatedSession?.error) {
        setErrorMessage(updatedSession?.message);
        return;
      }
      setSession(updatedSession);
      setBoard(updatedSession?.board);
      setTurns((prev) => prev + 1);
      const shouldTwist =
        updatedSession?.twistActive === true || selectedMoveType === "TWIST";

      const normalSymbol =
        updatedSession?.currentPlayer === (player1LocalName || player1)
          ? player1Symbol
          : player2Symbol;

      const twistedSymbol =
        normalSymbol === player1Symbol ? player2Symbol : player1Symbol;

      setCurrentPlayerSymbol(shouldTwist ? twistedSymbol : normalSymbol);

      setPlayer1Points(updatedSession?.player1Points);
      setPlayer2Points(updatedSession?.player2Points);
      if (updatedSession.winner !== null) {
        setGameWinner(updatedSession?.winner);
        return;
      }
      if (updatedSession.gameStatus === "DRAW") {
        setGameDraw(true);
      }
      setTimerKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error making move:", error);
    }
  };

  console.log(selectedMoveType);

  return (
    <div>
      {/*LAPTOP  */}
      <div className="hidden md:flex flex-col md:flex-row items-center justify-center w-full min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter p-4 gap-6">
        {/* LEFT — title and scoreboard */}
        <div className="w-full md:w-1/5 flex flex-col items-center space-y-4 text-center ">
          <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 tracking-wide text-center md:text-left">
            🎮 Tic Tac Twist {board?.length}x
          </h1>

          <div className="w-full">
            <PlayerScoreDisplay
              player1Username={player1}
              player2Username={player2}
              player1Points={session?.player1Points}
              player1Symbol={session?.player1Symbol}
              player2Points={session?.player2Points}
              player2Symbol={session?.player2Symbol}
              isTwistActive={session?.twistActive}
              player1TwistTurnsLeft={session?.player1TwistTurnsLeft}
              player2TwistTurnsLeft={session?.player2TwistTurnsLeft}
              player1Color={player1Color}
              player2Color={player2Color}
              selectedMoveType={selectedMoveType}
            />
          </div>
        </div>

        {/* CENTER — current turn and game board */}
        <div className="w-full md:w-3/5 flex flex-col justify-center items-center space-y-6">
          <div
            className="
        w-5/6 max-w-3xl
        flex flex-col justify-center items-center
        bg-gradient-to-br from-gray-100 via-blue-50 to-blue-300
        dark:from-gray-900 dark:via-gray-800 dark:to-black
        text-gray-900 dark:text-white
        border border-gray-300 dark:border-gray-700
        rounded-2xl shadow-lg p-4 text-center
        transition-all duration-300
      "
          >
            {/* Turns Played */}
            <div className="bg-blue-100/70 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg font-medium mb-2">
              🔁 Turns Played (this board):{" "}
              <span className="font-semibold">{turns}</span>
            </div>

            {/* Current Turn */}
            <div className="flex flex-col items-center mb-3">
              <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                🎯 Current Turn
              </h3>
              <p className="text-lg mt-1">
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {session?.currentPlayer === (player1LocalName || player1)
                    ? player1
                    : player2}
                </span>{" "}
                <span className="text-gray-500 dark:text-gray-400">
                  (
                  {selectedMoveType === "TWIST"
                    ? currentPlayerSymbol === (player1Symbol)
                      ? player2Symbol
                      : player1Symbol
                    : currentPlayerSymbol}
                  )
                </span>
              </p>
            </div>

            {/* Move Type */}
            <div className="bg-indigo-100/60 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 px-4 py-2 rounded-lg mb-3 font-medium">
              🎮 Move Type:{" "}
              <span className="font-semibold text-indigo-900 dark:text-indigo-100">
                {selectedMoveType || "NORMAL"}
              </span>
            </div>
            <span>
              Score a point by completing any row, column, or diagonal of 3
              consecutive cells.
            </span>

            {/* Double Override */}
            {session?.doubleOverrideActive && (
              <div className="bg-yellow-100/70 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-4 py-2 rounded-lg mb-3">
                ⚡ Double Override —{" "}
                <span className="font-bold">
                  {session.doubleOverrideTurnsLeft + 1} turn(s) left
                </span>
              </div>
            )}

            {/* Twist */}
            {session?.twistActive && (
              <div className="bg-pink-100/70 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300 px-4 py-2 rounded-lg mb-3">
                🌀 Twist —{" "}
                <span className="font-bold">
                  For you:{" "}
                  {session.currentPlayer === player1
                    ? session.player1TwistTurns
                    : session.player2TwistTurns}{" "}
                  turn(s) left
                </span>
              </div>
            )}
            {gameWinner && (
              <span className="text-3xl">Winner: {gameWinner}</span>
            )}
          </div>

          {/* Game Board */}
          <div className="flex flex-col md:flex-row justify-center items-center w-full max-w-5xl">
            <GamePlayingBoard
              board={board}
              makeMove={makeMove}
              currentPlayer={session?.currentPlayer}
              threePatterns={session?.threePatterns}
              winPattern={session?.winPattern}
              player1={player1}
              player2={player2}
              localName={player1LocalName}
              player1Color={player1Color}
              player2Color={player2Color}
            />
          </div>
        </div>

        {/* RIGHT — timer and moves */}
        <div className="w-full md:w-1/5 flex flex-col justify-start items-center md:items-end space-y-6">
          <div className="flex justify-center items-start w-full">
            <CountdownTimer
              initialTime={30}
              resetSignal={timerKey}
              onTimeUp={() => {
                console.log("Time up!");
              }}
              gameWinner={gameWinner}
            />
          </div>
          <div className="w-full md:w-auto">
            <GameSpecialMoves
              currentPlayerPoints={
                session?.currentPlayer === player1
                  ? session?.player1Points
                  : session?.player2Points
              }
              setSelectedMovePattern={setSelectedMovePattern}
              setSelectedMoveType={setSelectedMoveType}
              specialMoveCost={specialMoveCost}
              selectedMoveType={selectedMoveType}
              movePatterns={movePatterns}
              emptyPatternMoveDescription={emptyPatternMoveDescription}
              selectedMovePattern={selectedMovePattern}
              moveDescriptions={moveDescriptions}
              isTwistActive={session?.twistActive}
              isDoubleOverrideActive={session?.isDoubleOverrideActive}
            />
          </div>
        </div>
      </div>
      {/* MOBILE SCREEN */}
      <div className="md:hidden flex flex-col md:flex-row items-center justify-center w-full min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter p-4">
        {/* LEFT — title and scoreboard */}
        <div className="w-full md:w-1/5 flex flex-col justify-start items-center md:items-start space-y-4">
          <h1 className="text-2xl md:text-2xl font-bold text-indigo-700 dark:text-indigo-300 tracking-wide text-center md:text-left ">
            🎮 Tic Tac Twist {board?.length}x
          </h1>

          <div className="w-full flex justify-center md:justify-start mt-4">
            <PlayerScoreDisplay
              player1Username={player1}
              player2Username={player2}
              player1Points={session?.player1Points}
              player1Symbol={session?.player1Symbol}
              player2Points={session?.player2Points}
              player2Symbol={session?.player2Symbol}
              isTwistActive={session?.isTwistActive}
              player1TwistTurnsLeft={session?.player1TwistTurnsLeft}
              player2TwistTurnsLeft={session?.player2TwistTurnsLeft}
            />
          </div>
        </div>

        {/* CENTER — current turn and game board */}
        <div className="w-full md:w-3/5 flex flex-col justify-center items-center space-y-6">
          <div
            className="
        w-5/6 max-w-3xl
        flex flex-col justify-center items-center
        bg-gradient-to-br from-gray-100 via-blue-50 to-blue-300
        dark:from-gray-900 dark:via-gray-800 dark:to-black
        text-gray-900 dark:text-white
        border border-gray-300 dark:border-gray-700
        rounded-2xl shadow-lg p-4 text-center
        transition-all duration-300
      "
          >
            {/* Turns Played */}
            <div className="bg-blue-100/70 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg font-medium mb-2">
              🔁 Turns Played (this board):{" "}
              <span className="font-semibold">{turns}</span>
            </div>

            {/* Current Turn */}
            <div className="flex flex-col items-center mb-3">
              <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                🎯 Current Turn
              </h3>
              <p className="text-lg mt-1">
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {session?.currentPlayer === player1 ? player1 : player2}
                </span>{" "}
                <span className="text-gray-500 dark:text-gray-400">
                  ({currentPlayerSymbol})
                </span>
              </p>
            </div>

            {/* Move Type */}
            <div className="bg-indigo-100/60 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 px-4 py-2 rounded-lg mb-3 font-medium">
              🎮 Move Type:{" "}
              <span className="font-semibold text-indigo-900 dark:text-indigo-100">
                {selectedMoveType || "—"}
              </span>
            </div>

            {/* Double Override */}
            {session?.doubleOverrideActive && (
              <div className="bg-yellow-100/70 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-4 py-2 rounded-lg mb-3">
                ⚡ Double Override —{" "}
                <span className="font-bold">
                  {session.doubleOverrideTurnsLeft + 1} turn(s) left
                </span>
              </div>
            )}

            {/* Twist */}
            {session?.twistActive && (
              <div className="bg-pink-100/70 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300 px-4 py-2 rounded-lg mb-3">
                🌀 Twist —{" "}
                <span className="font-bold">
                  For you:{" "}
                  {session.currentPlayer === player1
                    ? session.player1TwistTurnsLeft + 1
                    : session.player2TwistTurnsLeft + 1}{" "}
                  turn(s) left
                </span>
              </div>
            )}
          </div>
          <div className="flex justify-center items-start w-full">
            <CountdownTimer resetSignal={timerKey} initialTime={30} />
          </div>
          {/* Game Board */}
          <div className="flex flex-col md:flex-row justify-center items-center w-full max-w-5xl">
            <GamePlayingBoard
              board={board}
              makeMove={makeMove}
              currentPlayer={session?.currentPlayer}
              threePatterns={session?.threePatterns}
            />
          </div>
        </div>

        {/* RIGHT — timer and moves */}
        <div className="w-full md:w-1/5 flex flex-col justify-start items-center md:items-end space-y-6">
          <div className="w-full md:w-auto">
            <GameSpecialMoves
              currentPlayerPoints={
                player1 === session?.player1Username
                  ? session?.player1Points
                  : session?.player2Points
              }
              setSelectedMovePattern={setSelectedMovePattern}
              setSelectedMoveType={setSelectedMoveType}
              specialMoveCost={specialMoveCost}
              selectedMoveType={selectedMoveType}
              movePatterns={movePatterns}
              emptyPatternMoveDescription={emptyPatternMoveDescription}
              selectedMovePattern={selectedMovePattern}
              moveDescriptions={moveDescriptions}
              isTwistActive={session?.isTwistActive}
              isDoubleOverrideActive={session?.isDoubleOverrideActive}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineGamePage;
