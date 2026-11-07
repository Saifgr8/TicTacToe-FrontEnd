import React from "react";
import Dice from "../Ui/Dice";
import { useState } from "react";
import { motion } from "framer-motion";
import MatchRules from "../Ui/MatchRules";
import MatchMoves from "../Ui/MatchMoves";
import Footer from "../Ui/Footer";
import { useNavigate } from "react-router-dom";

const Offlinepage = () => {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [player1Symbol, setPlayer1Symbol] = useState("");
  const [player2Symbol, setPlayer2Symbol] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [player1Color, setPlayer1Color] = useState("");
  const [player2Color, setPlayer2Color] = useState("");
  const [rulesRead, setRulesRead] = useState(false);
  const [movesRead, setMovesRead] = useState(false);

  const ofMatchRulesIndices = [0, 2, 3, 6, 7, 9];
  const navigate = useNavigate();
  console.log(rulesRead, movesRead);
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-200 via-indigo-700 to-black
    dark:bg-gradient-to-br dark:from-gray-900 dark:via-indigo-900 dark:to-black
     flex flex-col items-center justify-center text-white font-inter "
    >
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center">
        🎲 Tic Tac Roll – Who Goes First & plays what?
      </h1>

      {/* Dice section */}
      <Dice
        player1={player1}
        setPlayer1={setPlayer1}
        player2={player2}
        setPlayer2={setPlayer2}
        player1Symbol={player1Symbol}
        setPlayer1Symbol={setPlayer1Symbol}
        player2Symbol={player2Symbol}
        setPlayer2Symbol={setPlayer2Symbol}
        currentPlayer={currentPlayer}
        setCurrentPlayer={setCurrentPlayer}
        player1Color={player1Color}
        player2Color={player2Color}
        setPlayer1Color={setPlayer1Color}
        setPlayer2Color={setPlayer2Color}
      />

      {/* Game summary */}
      {currentPlayer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-10 bg-gradient-to-br from-blue-300 to-blue-500
          dark:bg-gradient-to-br dark:from-indigo-900 dark:to-purple-900 
          rounded-2xl shadow-2xl w-full  p-6 text-center border border-indigo-500/30"
        >
          <h2 className="text-2xl font-bold mb-4 dark:text-indigo-300 text-blue-500">
            🎮 Match Setup
          </h2>
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div
              className={`${player1Color} p-4 rounded-xl shadow-xl border border-pink-400/30 transform hover:scale-105 transition-transform duration-300`}
            >
              <p className="font-semibold text-indigo-200">{player1}</p>
              <p className="text-3xl font-extrabold text-white mt-1">
                {player1Symbol || "-"}
              </p>
            </div>

            <div
              className={`${player2Color} p-4 rounded-xl shadow-xl border border-pink-400/30 transform hover:scale-105 transition-transform duration-300`}
            >
              <p className="font-semibold text-pink-200">{player2}</p>
              <p className="text-3xl font-extrabold text-white mt-1">
                {player2Symbol || "-"}
              </p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <p className="text-xl m-2 p-2">
              🏁{" "}
              <span className="font-semibold dark:text-green-400 text-green-700">
                {currentPlayer}
              </span>{" "}
              starts first!
            </p>
          </motion.div>
          <p className="m-2 p-2 text-blue-800 dark:text-white">
            Please go over the match and game rules before you proceed to game.
          </p>
          <div className="flex md:flex-row flex-col justify-between items-center gap-3">
            <MatchRules
              valid={ofMatchRulesIndices}
              timeoutForfeit
              setRulesRead={setRulesRead}
            />
            <MatchMoves setMovesRead={setMovesRead} />
          </div>

          <button
            disabled={!movesRead || !rulesRead}
            onClick={() => navigate("/offlineGamePage")}
            className={`text-white  px-4 py-2 rounded transition-all duration-200 cursor-pointer mt-4 ${
              !rulesRead || !movesRead
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {!rulesRead || !movesRead ? "Read rules and moves" : "Begin match"}
          </button>
        </motion.div>
      )}
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Offlinepage;
