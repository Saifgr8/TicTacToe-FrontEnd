import React, { useState } from "react";
import {
  Star,
  Slash,
  Undo2,
  PenTool,
  Layers,
  SwitchCamera,
} from "lucide-react";

const MatchMoves = ({ setMovesRead }) => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  const moves = [
    {
      icon: <Star className="w-6 h-6 text-yellow-400 dark:text-yellow-300" />,
      title: "Score a Point",
      cost: "1 Point",
      description:
        "Earn a point by forming any 3-cell pattern — rows, columns, diagonals, or their sub-variants. You earned it, champ! 🏆",
    },
    {
      icon: <Layers className="w-6 h-6 text-pink-500 dark:text-pink-300" />,
      title: "Pattern Bomb",
      cost: "2 Points",
      description:
        "Trigger a pattern-clearing explosion 💥 — wipe out an entire row, column, or diagonal. Boom!",
    },
    {
      icon: (
        <SwitchCamera className="w-6 h-6 text-green-500 dark:text-green-300" />
      ),
      title: "Twist Mode",
      cost: "3 Points",
      description:
        "For 2 turns, you and your opponent swap symbols 🔄. Confuse, distract, and dominate in style!",
    },
    {
      icon: (
        <PenTool className="w-6 h-6 text-purple-500 dark:text-purple-300" />
      ),
      title: "Override",
      cost: "4 Points",
      description:
        "Paint over their move with your own symbol 🎨. Risky but satisfying when used with perfect timing!",
    },
    {
      icon: (
        <PenTool className="w-6 h-6 text-purple-500 dark:text-purple-300" />
      ),
      title: "Override 2x",
      cost: "5 Points",
      description:
        "Loved the override? now do it again & agaain. Paint your way to victory 🎨.",
    },
  ];

  const currentMove = moves[currentMoveIndex];

  return (
    <div
      className="flex flex-col items-center justify-center sm:p-6 font-inter 
  bg-gradient-to-b from-gray-100 to-gray-300 
  dark:from-blue-950 dark:to-gray-900 w-full rounded-xl"
    >
      <div
        className="max-w-xl w-full 
    bg-white dark:bg-gray-800 
    rounded-2xl shadow-2xl p-4 sm:p-4 
    border border-gray-300 dark:border-gray-700 
    text-center transition-all duration-300"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white mb-6">
          Special Move {currentMoveIndex + 1} of {moves.length}
        </h1>

        <div className="flex justify-center mb-4">{currentMove.icon}</div>

        <h2 className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">
          {currentMove.title}
        </h2>

        <div className="text-md text-green-600 dark:text-green-400 mb-3 font-semibold">
          {currentMoveIndex === 0 ? (
            <p>Get: {currentMove.cost}</p>
          ) : (
            <p>Cost: {currentMove.cost}</p>
          )}
        </div>

        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-6">
          {currentMove.description}
        </p>

        <div className="flex justify-between gap-4">
          <button
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-all duration-200 disabled:opacity-50"
            onClick={() => setCurrentMoveIndex((prev) => prev - 1)}
            disabled={currentMoveIndex === 0}
          >
            ⬅ Prev
          </button>

          {currentMoveIndex < moves.length - 1 ? (
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-all duration-200"
              onClick={() => setCurrentMoveIndex((prev) => prev + 1)}
            >
              Next ➡
            </button>
          ) : (
            <button
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded transition-Dall duration-200"
              onClick={() => {
                setMovesRead(true);
                setCurrentMoveIndex(0);
              }}
            >
              ✅ Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchMoves;
