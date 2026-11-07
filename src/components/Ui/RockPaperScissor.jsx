import React, { useState, useEffect, useRef, useCallback } from "react";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";

// Lucide React Icons for RPS
import { BrickWall, ScrollText, Scissors } from "lucide-react";

const RockPaperScissor = ({
  player1Username,
  player2Username,
  setPlayer1Symbol, // Callback to set player 1's symbol in parent
  setPlayer2Symbol, // Callback to set player 2's symbol in parent
  setCurrentPlayer,
  setPlayer1,
  setPlayer2,
  setCurrentPlayerSymbol, 
}) => {
  const stompClient = useRef(null);
  const username = localStorage.getItem("username"); // Current logged-in user

  // Use state for rpsMatchId so that changes to player usernames re-render and re-calculate
  const [rpsMatchId, setRpsMatchId] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // New state to track WebSocket connection status

  const [playerChoice, setPlayerChoice] = useState(null); // 'ROCK', 'PAPER', 'SCISSORS'
  const [opponentChoice, setOpponentChoice] = useState(null); // Opponent's choice
  const [rpsResult, setRpsResult] = useState(null); // 'WIN', 'LOSE', 'DRAW' (from current user's perspective)
  const [winnerUsername, setWinnerUsername] = useState(null); // Username of the actual RPS winner (or "DRAW")
  const [message, setMessage] = useState("Connecting to game server...");
  const [countdown, setCountdown] = useState(3); // Countdown before signaling parent to start main game

  const [showSymbolModal, setShowSymbolModal] = useState(false);

  console.log("Player choice is: " + playerChoice);

  console.log("showSymbolModal:", showSymbolModal);
  console.log("winnerUsername:", winnerUsername);
  console.log("username (my name):", username);

  // Effect to generate rpsMatchId when player usernames are available
  useEffect(() => {
    if (player1Username && player2Username) {
      const sortedUsernames = [player1Username, player2Username].sort();
      setRpsMatchId(`${sortedUsernames[0]}_${sortedUsernames[1]}_rps`);
    }
  }, [player1Username, player2Username]); // Re-run if usernames change

  // WebSocket connection for RPS and subscription to results
  useEffect(() => {
    // Ensure we have necessary data to establish WebSocket connection
    if (!username || !rpsMatchId) {
      // Use rpsMatchId directly from state
      console.warn(
        "Missing username or RPS Match ID. Cannot connect WebSocket for RPS."
      );
      setMessage("Waiting for player data...");
      return;
    }

    const socket = new SockJS(
      `http://localhost:8080/gameplay?username=${encodeURIComponent(username)}`
    ); // Connect to your game WebSocket endpoint
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true); // Set connected status
        setMessage("Make your move!"); // Update message once connected
        console.log("✅ RPS WebSocket Connected");

        // Subscribe to the user-specific RPS result topic.
        client.subscribe(`/user/queue/rps-result`, (message) => {
          const result = JSON.parse(message.body); // Correctly parse message.body
          console.log("🎯 RPS Result Received:", result);

          // IMPORTANT: Check if the received result belongs to the current RPS match
          if (result.matchId !== rpsMatchId) {
            const normalize = (str) =>
              typeof str === "string" ? str.trim().toLowerCase() : "";

            if (normalize(result.rpsMatchId) !== normalize(rpsMatchId)) {
              console.warn(
                "Normalized mismatch:",
                result.rpsMatchId,
                rpsMatchId
              );
              return;
            }
          }

          // Determine which choice is the opponent's based on the usernames in the result
          const opponentsChoice =
            result.player1Username === username
              ? result.player2Choice
              : result.player1Choice;

          // Update state with results
          setPlayerChoice(
            result.player1Username === username
              ? result.player1Choice
              : result.player2Choice
          ); // Set your choice from backend confirmation
          setOpponentChoice(opponentsChoice); // Set opponent's choice
          setRpsResult(result.result); // 'WIN', 'LOSE', 'DRAW' for the current user
          setWinnerUsername(result.winnerUsername); // The actual winner's username (or "DRAW") // Corrected state setter
          setMessage(result.message || "Game Over!"); // Custom message from backend

          // Start a countdown before signaling parent to start the main game
          let navCountdown = 3;
          setCountdown(navCountdown);

          const timer = setInterval(() => {
            navCountdown -= 1;
            setCountdown(navCountdown);
            if (navCountdown === 0) {
              clearInterval(timer); // Stop the interval

              if (result?.winnerUsername !== "DRAW") {
                setShowSymbolModal(true); // Only winner chooses symbol
              }

              if (result.winnerUsername === "DRAW") {
                setMessage("It's a Draw, play again");
                setPlayerChoice(null);
                setShowSymbolModal(false);
                setOpponentChoice(null);
                setWinnerUsername(null);
                setRpsResult(null);
              }

              // The parent will handle setting player1Symbol and player2Symbol based on the winner's choice
              // and then rendering WebSocketGameBoard.
            }
          }, 1000);
        });

        // Subscribe to general error topic (if your backend sends errors this way)
        client.subscribe("/topic/errors", (message) => {
          console.error("❌ RPS Error: ", message.body);
          setMessage(`Error: ${message.body}`);
        });

        client.subscribe("/user/queue/rps-winner", (message) => {
          const data = JSON.parse(message.body);
          console.log("data from winner: " + data);

          const winnerSymbol = data.winnerSymbol;
          const winnername = data.winnerPlayer;
          const looserName = data.looserPlayer;
          const looserSymbol = winnerSymbol == "X" ? "O" : "X";
          setCurrentPlayerSymbol(winnerSymbol);
          setCurrentPlayer(winnername);
          setPlayer1(winnername);
          setPlayer1Symbol(winnerSymbol);
          setPlayer2(looserName);
          setPlayer2Symbol(looserSymbol);
          setShowSymbolModal(false);
        });
      },
      onStompError: (frame) => {
        setIsConnected(false); // Set connected status to false on error
        console.error("❌ STOMP error", frame);
        setMessage("Connection error. Please refresh.");
      },
      onDisconnect: () => {
        setIsConnected(false); // Set connected status to false on disconnect
        console.log("RPS WebSocket Disconnected");
      },
    });

    client.activate(); // Activate the STOMP client
    stompClient.current = client; // Store client instance in ref

    // Cleanup function: deactivate STOMP client when component unmounts
    return () => {
      if (client.connected) {
        client.deactivate();
      }
    };
  }, [
    username,
    rpsMatchId,
    player1Username,
    player2Username,
    setPlayer1Symbol,
    setPlayer2Symbol,
    setCurrentPlayer,
  ]); // Dependencies

  // Function to handle player's RPS choice
  const handleChoice = useCallback(
    (choice) => {
      // Basic validation before sending
      if (!stompClient.current || !stompClient.current.connected) {
        // Check if stompClient is connected
        setMessage("Not connected to game server.");
        return;
      }
      if (playerChoice) {
        // Prevent multiple choices if already made
        setMessage("You've already made your choice!");
        return;
      }
      if (!rpsMatchId) {
        // Use rpsMatchId from state
        setMessage("RPS match not initialized. Please try again.");
        return;
      }

      setPlayerChoice(choice); // Optimistically set local choice
      setMessage(`You chose ${choice}. Waiting for opponent...`);

      // Construct the payload for the backend (DTORPSChoice)
      const rpsPayload = {
        rpsMatchId: rpsMatchId, // The unique ID for this RPS match
        username: username, // The current player's username
        player1: player1Username, // Pass both player usernames
        player2: player2Username,
        choice: choice, // The chosen move: "ROCK", "PAPER", or "SCISSORS"
      };

      console.log("Sending RPS choice:", rpsPayload);
      stompClient.current.publish({
        destination: "/app/rps/choice", // Backend endpoint for RPS choices
        body: JSON.stringify(rpsPayload),
      });
    },
    [
      playerChoice,
      rpsMatchId,
      username,
      player1Username,
      player2Username,
      isConnected,
    ]
  ); // Added isConnected to dependencies'

  const handleWinnerSymbol = (symbol) => {
    console.log("STOMP Client Connected:", stompClient.current?.connected);
    console.log("About to publish to app/rps/winner");

    if (!stompClient.current || !stompClient.current.connected) {
      console.log("Not connected to game server.");
      return;
    }

    if (!rpsMatchId) {
      // Use rpsMatchId from state
      console.log("RPS match not initialized. Please try again.");
      return;
    }
    const looserPlayer =
      username === player1Username ? player2Username : player1Username;
    const createPayload = {
      winnerPlayer: winnerUsername,
      winnerSymbol: symbol,
      looserPlayer: looserPlayer,
    };

    console.log("Sending RPS choice:", createPayload);
    stompClient.current.publish({
      destination: "/app/rps/winner",
      body: JSON.stringify(createPayload),
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-inter p-4">
      <div className="flex justify-center items-center flex-col">
        <h1 className="text-2xl  mb-8 text-purple-400 text-center">
          To keep the game fair, Who plays what & Who plays first will be
          decided by:
        </h1>
        <h1 className="text-4xl font-extrabold mb-8 text-purple-400">
          Rock Paper Scissors!
        </h1>

        <p className="text-xl mb-6 text-gray-300">{message}</p>

        {/* Display choice buttons only if no choice has been made yet and connected */}
        {!playerChoice && isConnected && (
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => handleChoice("ROCK")}
              className="p-4 bg-blue-600 rounded-xl shadow-lg hover:scale-105 transition-all duration-200 flex flex-col items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={playerChoice !== null || !isConnected} // Disable buttons once a choice is made or not connected
            >
              <BrickWall className="w-12 h-12 mb-2" />
              <span className="font-bold">Rock</span>
            </button>
            <button
              onClick={() => handleChoice("PAPER")}
              className="p-4 bg-green-600 rounded-xl shadow-lg hover:scale-105 transition-all duration-200 flex flex-col items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={playerChoice !== null || !isConnected}
            >
              <ScrollText className="w-12 h-12 mb-2" />
              <span className="font-bold">Paper</span>
            </button>
            <button
              onClick={() => handleChoice("SCISSORS")}
              className="p-4 bg-red-600 rounded-xl shadow-lg hover:scale-105 transition-all duration-200 flex flex-col items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={playerChoice !== null || !isConnected}
            >
              <Scissors className="w-12 h-12 mb-2" />
              <span className="font-bold">Scissors</span>
            </button>
          </div>
        )}

        {/* Display player and opponent choices once available */}
        {playerChoice && (
          <div className="text-center mb-6">
            <p className="text-2xl font-semibold">You chose: {playerChoice}</p>
            {opponentChoice && (
              <p className="text-2xl font-semibold mt-2">
                Opponent chose: {opponentChoice}
              </p>
            )}
          </div>
        )}

        {/* Display RPS result and navigation countdown */}
        {rpsResult && (
          <div className="text-center mt-4">
            <h2
              className={`text-3xl font-bold ${
                rpsResult === "WIN"
                  ? "text-green-500"
                  : rpsResult === "LOOSE"
                  ? "text-red-500"
                  : "text-yellow-500"
              }`}
            >
              {rpsResult === "WIN"
                ? "You Win!"
                : rpsResult === "LOOSE"
                ? "You Lose!"
                : "It's a Draw!"}
            </h2>
            {winnerUsername && (
              <p className="text-xl mt-2">
                {winnerUsername === username
                  ? "You choose your symbol and play first!"
                  : winnerUsername === "DRAW"
                  ? "Game was draw, please play again."
                  : `${winnerUsername} is picking their symbol and game will start soon`}
              </p>
            )}
            {countdown > 0 && (
              <p className="text-lg mt-4">Starting game in {countdown}...</p>
            )}
          </div>
        )}

        {/* Display general error messages */}
        {message && message.includes("Error") && (
          <p className="text-red-500 mt-4">{message}</p>
        )}
      </div>
      {showSymbolModal && winnerUsername === username && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white text-black p-8 rounded-2xl shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-4">You won!</h2>
            <p className="mb-4">Choose your symbol to start the game:</p>
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => handleWinnerSymbol("X")}
                className="text-4xl font-bold bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition cursor-pointer"
              >
                X
              </button>
              <button
                onClick={() => handleWinnerSymbol("O")}
                className="text-4xl font-bold bg-teal-500 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition cursor-pointer"
              >
                O
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RockPaperScissor;
