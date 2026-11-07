import React, { useState, useEffect, useRef } from "react";
import playerServices from "../../api/player/playerServices"; // Ensure this path is correct
import { useLocation, useNavigate } from "react-router-dom"; // Assuming you have react-router-dom installed
import MatchRules from "../Ui/MatchRules"; // Ensure this path is correct
import MatchMoves from "../Ui/MatchMoves";
import gameServices from "../../api/game/gameServices";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";

const OnlinepvpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [player2UsernameInput, setPlayer2UsernameInput] = useState(""); // Input field for player 2
  const [opponent, setOpponent] = useState(null); // The actual opponent object once confirmed
  const [errors, setErrors] = useState("");
  const [rulesRead, setRulesRead] = useState(false); // State for MatchRules read status
  const [movesRead, setMovesRead] = useState(false); // State for MatchMoves read status
  const [opponentReady, setOpponentReady] = useState(false);
  const [youAreReady, setYouAreReady] = useState(false);
  const [inviteStatus, setInviteStatus] = useState("PENDING"); // New state to track invite lifecycle: PENDING, PENDING_INVITE, ACCEPTED
  const [countdown, setCountdown] = useState(null); // Countdown timer state
  const onMatchRulesIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  const stompClientRef = useRef(null); // Ref to hold the STOMP client instance
  const username = localStorage.getItem("username"); // Get current user's username from local storage

  // Effect to handle initial navigation state (who invited whom)
  // This runs once when the component mounts or location.state changes
  useEffect(() => {
    const inviter = location.state?.inviter; // If current user was invited by someone
    const invitee = location.state?.invitee; // If current user invited someone and they accepted

    if (inviter) {
      // If current user is the invitee
      setModalOpen(true); // Open modal to show lobby
      setPlayer2UsernameInput(inviter); // Pre-fill opponent input with inviter's name
      setOpponent({ username: inviter }); // Set opponent object
      setInviteStatus("ACCEPTED"); // As invitee, the invite is considered accepted upon arrival
      console.log(`Navigated as invitee. Inviter: ${inviter}`);
    } else if (invitee) {
      // If current user is the inviter and their invite was accepted (navigated from Homepage)
      setModalOpen(true); // Open modal to show lobby
      setPlayer2UsernameInput(invitee); // Pre-fill opponent input with invitee's name
      setOpponent({ username: invitee }); // Set opponent object
      setInviteStatus("ACCEPTED"); // As inviter, the invite is accepted by the other party
      console.log(`Navigated as inviter. Invitee accepted: ${invitee}`);
    } else {
      // If navigating directly to OnlinepvpPage (e.g., clicking "PLAY Online" button without an invite context)
      setModalOpen(true); // Open the modal to allow user to find/invite an opponent
      console.log("Navigated directly to find an opponent.");
    }
  }, [location.state]); // Re-run if location.state changes

  // Effect for STOMP client connection and subscriptions
  // This sets up the WebSocket connection and listens for lobby-related messages
  useEffect(() => {
    // Ensure username exists before attempting to connect
    if (!username) {
      console.warn("Username not found. Redirecting to login.");
      navigate("/login"); // Redirect to login if no username
      return;
    }

    const socket = new SockJS(
      `http://localhost:8080/gameplay?username=${encodeURIComponent(username)}`
    );
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // Attempt to reconnect every 5 seconds
      onConnect: () => {
        console.log("OnlinepvpPage STOMP Connected");

        // Subscribe to the user's private lobby queue for game state updates
        client.subscribe("/user/queue/lobby", (message) => {
          const payload = JSON.parse(message.body);
          console.log("Lobby Message Received:", payload);

          // Handle different message statuses from the backend
          switch (payload.status) {
            case "INVITE_ACCEPTED": {
              // Wrapped in {} to fix 'no-case-declarations' ESLint error
              // This message confirms the invite is accepted by both sides
              // Determine who the actual accepted opponent is
              const acceptedOpponent =
                payload.by === username ? payload.from : payload.by;
              setInviteStatus("ACCEPTED"); // Update invite status
              setOpponent({ username: acceptedOpponent }); // Set the confirmed opponent
              console.log(`Invite accepted by: ${acceptedOpponent}`);
              break;
            }
            case "YOU_ARE_READY":
              setYouAreReady(true); // Current user is confirmed ready by backend
              console.log("Backend acknowledged you are ready.");
              break;
            case "OPPONENT_READY":
              setOpponentReady(true); // Opponent is confirmed ready by backend
              console.log(`Opponent ${payload.opponent} is ready.`);
              break;
            case "GAME_START":
              // This is the final trigger from the backend that both players are ready
              // and the game should start. This ensures synchronized countdown.
              setYouAreReady(true); // Ensure both are true locally
              setOpponentReady(true);
              console.log("Backend signaled game start!");
              // The countdown will automatically start/continue based on these states
              break;
            default:
              console.log("Unknown lobby status:", payload.status);
          }
        });
      },
      onStompError: (frame) => {
        console.error("Broker error:", frame.headers["message"]);
      },
      debug: (str) => {
        console.log(str);
      },
    });

    client.activate(); // Activate the STOMP client to connect
    stompClientRef.current = client; // Store client in ref for cleanup and other effects

    // Cleanup function: deactivate STOMP client when component unmounts
    return () => {
      if (client.connected) {
        console.log("OnlinepvpPage STOMP Deactivating...");
        client.deactivate();
      }
    };
  }, [username, navigate]); // Dependencies: re-run if username or navigate changes

  // Effect to send "READY" state to the backend
  // This runs when rules/moves are read, opponent is set, invite is accepted, and user isn't already ready
  useEffect(() => {
    if (
      rulesRead &&
      movesRead &&
      opponent &&
      inviteStatus === "ACCEPTED" &&
      !youAreReady
    ) {
      setYouAreReady(true); // Optimistically set local state to prevent re-sending
      console.log("Sending READY message to backend.");
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({
          destination: "/app/lobby/ready", // Endpoint for signaling readiness
          body: JSON.stringify({
            from: username,
            to: opponent.username,
          }),
        });
      }
    }
  }, [rulesRead, movesRead, opponent, inviteStatus, youAreReady, username]); // Dependencies

  // Effect to manage countdown and navigation to game board
  // This runs when both players are ready and countdown hasn't started yet
  useEffect(() => {
    let timer;
    console.log(
      "you are ready and they are ready and timer is: " + youAreReady,
      opponentReady,
      countdown
    );
    // Start countdown only if both are ready and countdown is not already active
    if (youAreReady && opponentReady && countdown === null) {
      console.log(
        "you are ready and they are ready and timer is: " + youAreReady,
        opponentReady,
        countdown
      );
      let timeLeft = 5; // Initial countdown value
      setCountdown(timeLeft); // Set initial countdown state
      console.log("Starting countdown...");

      timer = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft); // Decrement countdown

        if (timeLeft === 0) {
          clearInterval(timer); // Stop the timer
          console.log("Countdown finished. Navigating to game board.");
          // Navigate to the game board with necessary player data
          setModalOpen(false);
          navigate("/gameBoard", {
            state: {
              player1Username: username,
              player2Username: opponent.username,
            },
          });
        }
      }, 1000); // Update every second
    }

    // Cleanup function: clear interval if component unmounts or dependencies change
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [youAreReady, opponentReady, navigate, opponent, username]); // Dependencies

  // Function to fetch opponent data and send game invite
  const getOpponentAndSendInvite = async () => {
    setErrors(""); // Clear previous errors
    const jwt = localStorage.getItem("token"); // Get JWT token for authorization

    if (!jwt) {
      console.error("Not authorized user");
      setErrors("User not authorized. Please log in.");
      return;
    }
    if (!player2UsernameInput.trim()) {
      setErrors("Please enter an opponent's username.");
      return;
    }
    if (player2UsernameInput.trim() === username) {
      setErrors("You cannot play against yourself!");
      return;
    }

    try {
      // Fetch opponent details from the backend
      const responseData = await playerServices.getPlayer(
        player2UsernameInput,
        jwt
      );
      console.log("Opponent lookup response:", responseData);

      if (responseData && responseData.username) {
        setOpponent(responseData); // Set the opponent object
        setErrors(""); // Clear errors if opponent found
        // Send game invite via API
        await gameServices.sendInvite(jwt, responseData.username);
        console.log(
          `Invite sent to ${responseData.username}. Waiting for acceptance...`
        );
        setInviteStatus("PENDING_INVITE"); // Update status to reflect waiting for acceptance
      } else {
        setErrors("Opponent not found or offline. Please check the username.");
        setOpponent(null); // Reset opponent if not found
      }
    } catch (error) {
      console.error("Error fetching opponent or sending invite:", error);
      setErrors(
        error.response?.data?.message ||
          "Failed to fetch opponent or send invite. Please log in again."
      );
      setOpponent(null);
    }
  };

  // Function to toggle modal visibility and reset states
  const toggleModal = () => {
    setModalOpen((prev) => !prev);
    // Reset all relevant states when closing the modal for a clean start next time
    if (modalOpen) {
      setOpponent(null);
      setErrors("");
      setPlayer2UsernameInput("");
      setInviteStatus("PENDING"); // Reset invite status to initial
      setYouAreReady(false);
      setOpponentReady(false);
      setCountdown(null);
      setRulesRead(false);
      setMovesRead(false);
    }
  };

  return (
    <>
      {/* Global styles for the animation and font */}
      <style>
        {`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards; /* Adjusted duration for snappier animation */
        }

        /* Custom scrollbar for MatchRules/MatchMoves */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        /* Dark mode scrollbar */
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #333;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #555;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #777;
        }
        `}
      </style>

      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 font-inter">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 p-8">
          {/* Button - Play With Friend */}
          <button
            type="button"
            onClick={toggleModal}
            className="
      relative group
      px-8 py-4 
      font-bold text-lg text-white 
      rounded-xl shadow-lg 
      bg-gradient-to-r from-blue-600 to-blue-500 
      dark:from-blue-700 dark:to-blue-900
      transition-all duration-300 ease-out 
      hover:scale-110 hover:shadow-2xl
      focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
      overflow-hidden
    "
          >
            <span className="relative z-10">🎮 PLAY With Friend</span>
            {/* Cool animated glow behind */}
            <span
              className="
      absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 
      bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 blur-lg
    "
            ></span>
          </button>

          {/* Button - Random Matchmaking */}
          <button
            onClick={toggleModal}
            className="
      relative group
      px-8 py-4 
      font-bold text-lg text-white 
      rounded-xl shadow-lg 
      bg-gradient-to-r from-green-600 to-emerald-500 
      dark:from-green-700 dark:to-emerald-900
      transition-all duration-300 ease-out 
      hover:scale-110 hover:shadow-2xl
      focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800
      overflow-hidden
    "
          >
            <span className="relative z-10">🌐 Random Matchmaking</span>
            <span
              className="
      absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 
      bg-gradient-to-r from-green-400 via-lime-400 to-green-600 blur-lg
    "
            ></span>
          </button>
        </div>

        {/* Conditional rendering for the modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50 p-4">
            {/* Modal content container with responsive width */}
            <div className="relative bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md md:max-w-2xl lg:max-w-4xl transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scaleIn">
              {/* Close button for the modal */}
              <button
                onClick={toggleModal}
                className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 text-2xl font-bold"
                aria-label="Close modal"
              >
                &times;
              </button>

              {/* Conditional content inside the modal: Search or Rules */}
              <div className="flex flex-col items-center w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="text-2xl font-bold text-white mb-4 flex gap-2 w-full justify-center items-center w-full">
                  <p className="w-2/3 text-center">Will be released soon...</p>
                  <button
                    onClick={() => navigate("/")}
                    type="button"
                    className="px-2 py-1 bg-green-500 text-white text-lg font-medium rounded-md cursor-pointer"
                  >
                    Back
                  </button>
                </div>
                <div className="text-lg text-gray-300 mb-6 text-center w-full">
                  <p>
                    This feautre is under development and testing, please try
                    offline game till we relase it shortly.
                  </p>
                  {/* Status messages based on invite and readiness */}
                  {inviteStatus === "PENDING_INVITE" && (
                    <p className="text-yellow-400 font-semibold mt-2">
                      ⏳ Waiting for {player2UsernameInput} to accept your
                      invite...
                    </p>
                  )}
                  {inviteStatus === "ACCEPTED" &&
                    !youAreReady &&
                    !opponentReady && (
                      <p className="text-blue-400 font-semibold mt-2">
                        ✅ Opponent joined. Read rules and moves to get ready!
                      </p>
                    )}
                  {inviteStatus === "ACCEPTED" &&
                    youAreReady &&
                    !opponentReady && (
                      <p className="text-blue-400 font-semibold mt-2">
                        👀 You are ready. Waiting for{" "}
                        {opponent?.username || "opponent"} to get ready...
                      </p>
                    )}
                  {inviteStatus === "ACCEPTED" &&
                    opponentReady &&
                    !youAreReady && (
                      <p className="text-blue-400 font-semibold mt-2">
                        👀 {opponent?.username || "Opponent"} is ready. Waiting
                        for you to get ready...
                      </p>
                    )}
                  {youAreReady &&
                    opponentReady &&
                    countdown !== null &&
                    countdown > 0 && (
                      <p className="text-green-500 font-bold mt-2">
                        ✅ Both players are ready! Select Symbol in {countdown}{" "}
                        seconds...
                      </p>
                    )}
                  {youAreReady && opponentReady && countdown === 0 && (
                    <p className="text-green-500 font-bold mt-2">
                      Redirecting to game board...
                    </p>
                  )}

                  {/* Player status buttons */}
                  <div className="w-full px-3 py-2 mt-2">
                    {/* Mobile Layout */}
                    <div className="flex md:hidden justify-between items-center gap-2">
                      {/* Player status - compact horizontal */}
                      <div className="flex gap-2 flex-1 min-w-0">
                        <div
                          className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                            youAreReady
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          <span className="truncate">{username}</span>
                          <span>{youAreReady ? "✅" : "⏳"}</span>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                            opponentReady
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <span className="truncate">
                            {opponent?.username || "Opponent"}
                          </span>
                          <span>{opponentReady ? "✅" : "⏳"}</span>
                        </div>
                      </div>

                      {/* Action buttons - compact */}
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setRulesRead(false)}
                          className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-md"
                        >
                          Rules
                        </button>
                        <button
                          type="button"
                          onClick={() => setRulesRead(true)}
                          className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-md"
                        >
                          Moves
                        </button>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex justify-between items-center">
                      {/* Player status */}
                      <div className="flex gap-4">
                        <button
                          className={`px-4 py-2 rounded-xl shadow-sm font-medium ${
                            youAreReady
                              ? "bg-green-600 text-white"
                              : "bg-yellow-400 text-black"
                          }`}
                          type="button"
                        >
                          {username} {youAreReady ? "✅" : "⏳"}
                        </button>
                        <button
                          className={`px-4 py-2 rounded-xl shadow-sm font-medium ${
                            opponentReady
                              ? "bg-green-600 text-white"
                              : "bg-gray-500 text-white"
                          }`}
                          type="button"
                        >
                          {opponent?.username || "Opponent"}{" "}
                          {opponentReady ? "✅" : "⏳"}
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setRulesRead(false)}
                          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg shadow-sm hover:bg-blue-600 transition-colors"
                        >
                          Rules
                        </button>
                        <button
                          type="button"
                          onClick={() => setRulesRead(true)}
                          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg shadow-sm hover:bg-blue-600 transition-colors"
                        >
                          Moves
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MatchRules and MatchMoves components */}
                {!rulesRead && (
                  <div className="w-full max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                    <MatchRules
                      setRulesRead={setRulesRead}
                      valid={onMatchRulesIndices}
                    />{" "}
                    {/* Pass setRulesRead */}
                  </div>
                )}
                {rulesRead &&
                  !movesRead && ( // Show moves only after rules are read
                    <div className="w-full max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                      <MatchMoves setMovesRead={setMovesRead} />{" "}
                      {/* Pass setMovesRead */}
                    </div>
                  )}

                {/* Begin Match / Waiting button */}
                <div className="w-full mt-6">
                  <button
                    className={`w-full p-3 text-white font-bold rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 ${
                      youAreReady && opponentReady
                        ? "bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800 focus:ring-green-300 cursor-pointer"
                        : "bg-gray-500 dark:bg-gray-700 cursor-not-allowed"
                    }`}
                    type="button"
                    disabled={!(youAreReady && opponentReady)} // Disable until both are ready
                  >
                    {youAreReady && opponentReady
                      ? `Select symbol in ${
                          countdown !== null ? countdown : "..."
                        }s` // Show countdown on button
                      : rulesRead && movesRead
                      ? "Waiting for opponent..."
                      : "Read rules & moves first"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OnlinepvpPage;
