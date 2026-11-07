import React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { colors } from "../utils/colors";
import ColorPicker from "./ColorPicker";
import { tr } from "framer-motion/client";

const Dice = ({
  player1,
  setPlayer1,
  player2,
  setPlayer2,
  player1Symbol,
  setPlayer1Symbol,
  player2Symbol,
  setPlayer2Symbol,
  currentPlayer,
  setCurrentPlayer,
  player1Color,
  player2Color,
  setPlayer1Color,
  setPlayer2Color,
}) => {
  const [rolling, setRolling] = useState(false);
  const [roll, setRoll] = useState(null);
  const [result, setResult] = useState("");
  const [winner, setWinner] = useState(null);
  const mode = localStorage.getItem("mode");
  const [open, setOpen] = useState(true);
  const [nameReady, setNameReady] = useState(false);
  const [symbolModal, setSymbolModal] = useState(false);
  const [playerColor, setPlayerColor] = useState("");

  const rollDice = () => {
    console.log("clicked");
    if (rolling) return;
    setRolling(true);
    setResult("");

    // Simulate dice spin
    let randomValue = Math.floor(Math.random() * 20) + 1;

    setTimeout(() => {
      setRolling(false);
      setRoll(randomValue);
      const res = randomValue < 10 ? "❌ You Lost!" : "✅ You Won!";
      setResult(res);

      // Determine winner
      const winnerName = randomValue < 10 ? player2 : player1;
      setWinner(winnerName);

      // Open symbol modal after 1.5 sec
      setTimeout(() => setSymbolModal(true), 1500);
    }, 1500);
  };

  const handleSymbolChoice = (symbol) => {
    let p1Symbol, p2Symbol;

    if (winner === player1) {
      p1Symbol = symbol;
      p2Symbol = symbol === "X" ? "0" : "X";
    } else {
      p2Symbol = symbol;
      p1Symbol = symbol === "X" ? "0" : "X";
    }

    setPlayer1Symbol(p1Symbol);
    setPlayer2Symbol(p2Symbol);
    setCurrentPlayer(winner);
    localStorage.setItem("player1Symbol", p1Symbol);
    localStorage.setItem("player2Symbol", p2Symbol);
    localStorage.setItem("currentPlayer", winner);
    setSymbolModal(false);
  };

  useEffect(() => {
    if (symbolModal && winner === "tictacbot") {
      const timer = setTimeout(() => {
        const botChoice = Math.random() > 0.5 ? "X" : "O";
        const player1Choice = botChoice === "X" ? "O" : "X";
        setPlayer2Symbol(botChoice);
        setPlayer1Symbol(player1Choice);
        setCurrentPlayer(player2);
        localStorage.setItem("currentPlayer", player2);
        localStorage.setItem("player1Symbol", player1Choice);
        localStorage.setItem("player2Symbol", botChoice);
        setSymbolModal(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [symbolModal, winner]);

  console.log(player1Color, player2Color);
  console.log(player1, player2);

  return (
    <div>
      <div
        className="flex flex-col items-center justify-center min-h-screen 
      bg-gradient-to-b from-blue-200 to-blue-300 text-black
      dark:bg-gradient-to-b dark:from-blue-900 dark:to-indigo-950 dark:text-white font-inter rounded-2xl"
      >
        <h3 className="text-xl font-bold mb-2 text-center">
          Hello {player1}, to decide who plays what and first, we play a simple
          game.
        </h3>
        <span className="text-center m-2 p-2">
          <p className="font-bold inline text-xl">{player1}</p> , please roll
          the dice ranging from 1 to 20. if it lands on a number greater than
          10, you win and you deicde what letter to play and play first, if you
          loose then <p className="font-bold inline text-xl">{player2}</p> will
          pick symbol and play first.
        </span>

        {/* Dice cube */}
        <motion.div
          animate={
            rolling
              ? { rotateX: 720, rotateY: 720, rotateZ: 720, scale: [1, 2.5, 1] }
              : {}
          }
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-3xl font-bold rounded-xl shadow-2xl border border-blue-300"
        >
          {roll ? roll : "🎲"}
        </motion.div>

        {/* Result text */}
        {result && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`mt-6 text-2xl font-semibold ${
              roll < 10 ? "text-red-400" : "text-green-400"
            }`}
          >
            {result}
          </motion.p>
        )}

        <button
          onClick={rollDice}
          disabled={rolling || winner}
          className={`mt-8 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 ${
            rolling || winner
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {rolling ? "Rolling..." : "Roll Dice"}
        </button>
      </div>
      {/* Name Input Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6 rounded-2xl shadow-2xl w-96 flex flex-col justify-center items-center">
            {/* TITLE */}
            <h3 className="text-xl font-bold mb-6 text-center">
              {mode === "offlinebot"
                ? "You're playing against"
                : "Enter Player 2 Details"}
            </h3>

            {/* PLAYER 1 DISPLAY (Always You) */}
            <div className="mb-4 w-full">
              <label className="block mb-1 font-semibold text-sm">
                Player 1
              </label>
              <input
                type="text"
                value={localStorage.getItem("username") || "Player 1"}
                disabled
                className={`w-full p-2 rounded-lg border border-gray-300 ${
                  player1Color || "bg-gray-50"
                } cursor-not-allowed text-black`}
              />
            </div>

            {/* PLAYER 2 DISPLAY */}
            <div className="mb-4 w-full">
              <label className="block mb-1 font-semibold text-sm">
                Player 2
              </label>

              {mode === "offlinebot" ? (
                // BOT MODE → DISABLED
                <input
                  type="text"
                  value="tictacbot"
                  disabled
                  className={`w-full p-2 rounded-lg border border-gray-300 ${
                    player2Color || "bg-gray-50"
                  } cursor-not-allowed text-black`}
                />
              ) : (
                // MULTIPLAYER MODE → USER ENTERS NAME
                <input
                  type="text"
                  placeholder="Enter Player 2 Name"
                  onChange={(e) => setPlayer2(e.target.value)}
                  className={`w-full p-2 rounded-lg border border-gray-300 ${
                    player2Color || "bg-gray-50"
                  } text-black`}
                />
              )}
            </div>

            {/* COLOR PICKER */}
            {nameReady && (
              <div className="mb-4 w-full">
                {player1Color === "" || player2Color === "" ? (
                  <label className="block mb-2 font-semibold text-sm">
                    Choose Your Color:{" "}
                    {player1Color === ""
                      ? localStorage.getItem("username")
                      : player2}
                  </label>
                ) : (
                  <label className="block mb-2 font-semibold text-sm">
                    Color selection completed, pelase click on continue.
                  </label>
                )}

                <ColorPicker
                  player1Color={player1Color}
                  player2Color={player2Color}
                  setPlayer1Color={setPlayer1Color}
                  setPlayer2Color={setPlayer2Color}
                  player1={localStorage.getItem("username")}
                  player2={player2}
                />
              </div>
            )}

            {/* BUTTON */}
            {nameReady ? (
              <button
                onClick={() => {
                  localStorage.setItem("player1Color", player1Color);
                  localStorage.setItem("player2Color", player2Color);
                  setOpen(false);
                }}
                className={`p-2 bg-blue-400 rounded-xl shadow-xl transition-transform duration-500 w-1/2 
                  ${
                    player1Color !== "" && player2Color !== ""
                      ? "scale-110"
                      : "scale-75"
                  }`}
              >
                Continue
              </button>
            ) : (
              <button
                disabled={player2 === "" && mode !== "offlinebot"}
                onClick={() => {
                  let p1 = localStorage.getItem("username");
                  const p2 = player2 === "" ? "tictacbot" : player2;

                  setPlayer1(p1);
                  setPlayer2(p2);
                  localStorage.setItem("player1", p1);
                  localStorage.setItem("player2", p2);
                  setNameReady(true);
                }}
                className={`
                  w-full mt-4 py-2 rounded-lg font-semibold text-white 
                  transition-all 
                  ${
                    player2 === "" && mode !== "offlinebot"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }
                `}
              >
                Ok
              </button>
            )}
          </div>
        </div>
      )}

      {/* Symbol Choice Modal */}
      {symbolModal && winner && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/60 animate-fadeIn">
          <div className="bg-gray-900/70 backdrop-blur-xl text-white p-8 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-[22rem] text-center border border-white/10 animate-scaleIn">
            {/* Title */}
            <h3 className="font-extrabold text-lg mb-4 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600">
                🏆 {winner}
              </span>{" "}
              won the dice roll!
              <br />
              <span className="text-gray-300 text-sm">
                {winner === "tictacbot"
                  ? "Choosing its symbol…"
                  : "Please choose your symbol"}
              </span>
            </h3>

            {/* Buttons */}
            <div className="flex justify-center gap-6 mt-4">
              {/* X Button */}
              <button
                disabled={winner === "tictacbot"}
                className={`text-white text-3xl font-bold px-7 py-3 rounded-xl transition-all duration-300 shadow-lg
            ${
              winner === "tictacbot"
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-[0_0_15px_rgba(59,130,246,0.7)]"
            }`}
                onClick={() => handleSymbolChoice("X")}
              >
                X
              </button>

              {/* O Button */}
              <button
                disabled={winner === "tictacbot"}
                className={`text-white text-3xl font-bold px-7 py-3 rounded-xl transition-all duration-300 shadow-lg
            ${
              winner === "tictacbot"
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : "bg-red-600 hover:bg-red-700 hover:shadow-[0_0_15px_rgba(239,68,68,0.7)]"
            }`}
                onClick={() => handleSymbolChoice("O")}
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

export default Dice;
