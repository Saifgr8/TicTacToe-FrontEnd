import React, { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import GamePlayingBoard from "../components/Ui/GamePlayingBoard";
import GameSpecialMoves from "../components/Ui/GameSpecialMoves";
import PlayerScoreDisplay from "../components/Ui/PlayerScoreDisplay";
import { useLocation, useNavigate } from "react-router-dom";
import { specialMoveCost as sharedSpecialMoveCost } from "../components/utils/descriptionHelper";
import { getCurrentPlayerSymbol } from "../components/utils/sessionSymbols";
import { getGameplayUrl } from "../api/config";

const WebSocketGameBoard = ({
  player1Username,
  player2Username,
  player1Symbol,
  player2Symbol,
  currentPlayer,
}) => {
  const stompClient = useRef(null);
  const [session, setSession] = useState(null);
  const [board, setBoard] = useState([]);
  const [connected, setConnected] = useState(false);
  const [selectedMoveType, setSelectedMoveType] = useState("");
  const [selectedMovePattern, setSelectedMovePattern] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const username = localStorage.getItem("username");
  const currentSymbol = getCurrentPlayerSymbol(
    session,
    session?.player1Username || player1Username,
    session?.player2Username || player2Username
  );
  const previewTwist = Boolean(
    session && session.gameStatus === "ONGOING" &&
    session.currentPlayer === username && !session.twistActive &&
    selectedMoveType === "TWIST"
  );
  const displayedCurrentSymbol = getCurrentPlayerSymbol(
    session,
    session?.player1Username || player1Username,
    session?.player2Username || player2Username,
    previewTwist
  );

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.twistActive) {
      setSelectedMoveType((selected) => selected === "TWIST" ? "NORMAL" : selected);
    }
  }, [session?.twistActive]);

  const moveDescriptions = new Map([
    ["NORMAL", "Standard move to an empty cell."],
    ["EMPTY_CELL", "Clear your opponents cell, stop em from winning."],
    [
      "OVERRIDE",
      "Replace opponent's symbol with your own. Feels like cheating",
    ],
    [
      "DOUBLE_OVERRIDE",
      "Override two opponent symbols in a single turn. Double cheating",
    ],
    [
      "EMPTY_PATTERN",
      "Clear a full row, column, or diagonal pattern. How about making oppoent start from 0?",
    ],
    ["TWIST", "Exchange the symbols for 2 turns. THIS IS CRAZZZYYY"],
  ]);
  const specialMoveCost = new Map([
    ["NORMAL", sharedSpecialMoveCost.get("NORMAL")],
    ["EMPTY_CELL", sharedSpecialMoveCost.get("EMPTY_CELL")],
    ["OVERRIDE", sharedSpecialMoveCost.get("OVERRIDE")],
    ["DOUBLE_OVERRIDE", sharedSpecialMoveCost.get("DOUBLE_OVERRIDE")],
    ["EMPTY_PATTERN", sharedSpecialMoveCost.get("EMPTY_PATTERN")],
    ["TWIST", sharedSpecialMoveCost.get("TWIST")],
  ]);

  const movePatterns = ["ROW", "COLUMN", "LEFT_DIAGONAL", "RIGHT_DIAGONAL"];

  const emptyPatternMoveDescription = new Map([
    ["ROW", "Clear an entire row."],
    ["COLUMN", "Clear an entire column"],
    ["LEFT_DIAGONAL", "Clear an entire Left diagonal"],
    ["RIGHT_DIAGONAL", "Clear an entire right diagonal"],
  ]);

  const createGame = useCallback(() => {
    if (!stompClient.current || !stompClient.current.connected) {
      console.log("❌ Stomp client not connected. Cannot create game.");
      return;
    }
    if (session) {
      console.log("Game session already exists. Not creating a new one.");
      return;
    }
    const createPayLoad = {
      player1Username: player1Username,
      player2Username: player2Username,
      player1Symbol: player1Symbol,
      player2Symbol: player2Symbol,
      startingPlayer: currentPlayer,
      boardSize: 6,
    };
    console.log("creating game with payload: ", createPayLoad);
    stompClient.current.publish({
      destination: "/app/create",
      body: JSON.stringify(createPayLoad),
    });
  }, [
    stompClient,
    session,
    player1Symbol,
    player2Symbol,
    player1Username,
    player2Username,
  ]);

  const makeMove = (rowIndex, colIndex) => {
    if (!stompClient.current || !stompClient.current.connected) {
      console.log("❌ Stomp client not connected. Cannot make move.");
      setErrorMessage("Not connected to game server.");
      return;
    }
    if (!session || session.gameStatus !== "ONGOING") {
      console.log("❌ Game not in progress. Cannot make move.");
      setErrorMessage("Game not in progress.");
      return;
    }
    if (session.currentPlayer !== username) {
      // Ensure it's the current player's turn
      console.log("❌ Not your turn!");
      setErrorMessage("It's not your turn!");
      return;
    }
    if (session.twistActive && selectedMoveType === "TWIST") {
      setSelectedMoveType("NORMAL");
      setErrorMessage("Twist is unavailable while a twist is active.");
      return;
    }
    if (!currentSymbol) {
      setErrorMessage("Could not determine the current player's symbol.");
      return;
    }

    const createMovePayload = {
      sessionId: session.sessionId,
      x: rowIndex,
      y: colIndex,
      symbol: currentSymbol,
      moveType: selectedMoveType ? selectedMoveType : "NORMAL",
      patternType: selectedMovePattern ? selectedMovePattern : "NONE",
      board: board,
    };

    console.log("MAKING MOVCE PAYLAOD:", createMovePayload);
    stompClient.current.publish({
      destination: "/app/move",
      body: JSON.stringify(createMovePayload),
    });

    if (
      selectedMoveType !== "DOUBLE_OVERRIDE" ||
      selectedMoveType !== "TWIST"
    ) {
      setSelectedMoveType("NORMAL");
    }
    setSelectedMovePattern(null);
  };

  useEffect(() => {
    if (
      !player1Username ||
      !player2Username ||
      !player1Symbol ||
      !player2Symbol
    ) {
      console.warn("Missing player data. Redirecting to lobby.");
      navigate("/onlinePVPPage");
      return;
    }

    const socket = new SockJS(
      getGameplayUrl(username)
    );

    const client = new Client({
      webSocketFactory: () => socket,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        console.log("✅ Connected to WebSocket");

        // Subscribe to receive game creation response
        client.subscribe("/topic/session", (message) => {
          const data = JSON.parse(message.body);
          console.log("🎯 Game session created: ", data);
          setSession(data);
          setBoard(data.board);
        });

        // Subscribe to game updates if session already exists
        if (session?.sessionId) {
          const topicPath = `/topic/game/${session.sessionId}`;
          client.subscribe(topicPath, (message) => {
            const gameData = JSON.parse(message.body);
            console.log("🎮 Game update after move: ", gameData);
            setSession(gameData);
            setBoard(gameData.board);
            setErrorMessage("");

          });
        }

        // Subscribe to errors
        client.subscribe("/topic/errors", (message) => {
          setErrorMessage(message.body.message);
        });

        // Trigger game creation only if session doesn't exist
        if (!session) {
          setTimeout(() => {
            createGame();
          }, 1000);
        } else {
          console.log("Game session already exists. Skipping creation.");
        }
      },
      onStompError: (err) => {
        console.error("❌ STOMP error", err);
        setErrorMessage("Connection error. Please try again.");
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [
    player1Username,
    player2Username,
    player1Symbol,
    player2Symbol,
    username,
    session?.sessionId, // triggers re-subscribe if session becomes available
  ]);

  return (
    <div className="flex flex-col items-center p-4 w-full min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
        Tic Tac Twist Game
      </h1>

      {errorMessage && (
        <p role="alert" className="text-red-500 mb-4 font-semibold">{errorMessage}</p>
      )}

      {/* Display current game status */}
      <div className="w-full justify-around items-center flex flex-col">
        {session && (
          <p className="text-xl">
            Current Turn:{" "}
            <span className="font-bold">
              {session.currentPlayer === username
                ? "You"
                : session.currentPlayer}{" "}
              ({displayedCurrentSymbol}{previewTwist && " preview"})
            </span>
          </p>
        )}
        <span className="m-1 p-1">Move Type: {selectedMoveType}</span>
        {session?.doubleOverrideActive && (
          <span>
            Double override turns left: {session.doubleOverrideTurnsLeft + 1}
          </span>
        )}
        {session?.twistActive && (
          <span>
            Twist turns left:{" "}
            {session.currentPlayer === player1Username
              ? `for you: ${session.player1TwistTurnsLeft + 1}`
              : `for you: ${session.player2TwistTurnsLeft + 1 }`}
          </span>
        )}
      </div>

      {/* Player Scores Display */}
      <PlayerScoreDisplay
        player1Username={player1Username}
        player2Username={player2Username}
        player1Points={session?.player1Points}
        player1Symbol={session?.player1Symbol}
        player2Points={session?.player2Points}
        player2Symbol={session?.player2Symbol}
        isTwistActive={session?.twistActive}
        previewTwist={previewTwist}
        player1TwistTurnsLeft={session?.player1TwistTurnsLeft}
        player2TwistTurnsLeft={session?.player2TwistTurnsLeft}
      />

      {/* Game Board and Special Moves */}
      {board.length > 0 && session ? (
        <div className="flex flex-col md:flex-row justify-evenly items-center md:gap-10 w-full max-w-5xl">
          <GamePlayingBoard
            board={board}
            makeMove={makeMove}
            currentSymbol={currentSymbol}
            currentTurnPlayer={session.currentPlayer} // Pass current player for visual cues
            player1Username={player1Username}
            player2Username={player2Username}
            sessionId={session.sessionI}
            moveType={selectedMoveType}
            patternType={selectedMovePattern}
          />
          <GameSpecialMoves
            currentPlayerPoints={
              username === session.player1Username
                ? session.player1Points
                : session.player2Points
            }
            setSelectedMovePattern={setSelectedMovePattern}
            setSelectedMoveType={setSelectedMoveType}
            specialMoveCost={specialMoveCost}
            selectedMoveType={selectedMoveType}
            movePatterns={movePatterns}
            emptyPatternMoveDescription={emptyPatternMoveDescription}
            selectedMovePattern={selectedMovePattern}
            moveDescriptions={moveDescriptions}
            isTwistActive={session.twistActive}
            isDoubleOverrideActive={session.isDoubleOverrideActive} // Pass double override status
          />
        </div>
      ) : (
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-8">
          Waiting for game session to start...
        </p>
      )}

      {/* Game End Status */}
      {session?.gameStatus === "ENDED" && (
        <div className="mt-8 text-center">
          <h2 className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            Game Over!
          </h2>
          {session.winner ? (
            <p className="text-2xl mt-2">
              Winner: <span className="font-extrabold">{session.winner}</span>!
            </p>
          ) : (
            <p className="text-2xl mt-2">It's a Draw!</p>
          )}
          {/* Add a button to restart or go back to lobby */}
          <button
            onClick={() => navigate("/onlinePVPPage")}
            className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Back to Lobby
          </button>
        </div>
      )}
    </div>
  );
};

export default WebSocketGameBoard;
