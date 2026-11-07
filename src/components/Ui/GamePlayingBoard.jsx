import React, { useState, useEffect } from "react";
import { getHighlightCells, getWinCells } from "../utils/cellHelper";

const GamePlayingBoard = ({
  board,
  makeMove,
  threePatterns = [],
  winPattern = [], // patterns coming from backend (optional)
  currentPlayer,
  player1,
  player2,
  localName,
  player1Color,
  player2Color,
  disabled = false,
}) => {
  const [highlighted, setHighlighted] = useState(new Set());

  const [isWinActive, setIsWinActive] = useState(false);

  const winKey = JSON.stringify(winPattern);
  const threeKey = JSON.stringify(threePatterns);

  console.log(winPattern, highlighted);

  useEffect(() => {
    // CASE 1 → Winning move → permanent highlight
    if (winPattern && winPattern.length > 0) {
      const cells = getWinCells(winPattern, board.length); // should return array of "i-j"
      setHighlighted(new Set(cells));
      setIsWinActive(true); // mark permanent win highlight
      return; // do NOT clear highlight
    }

    // CASE 2 → Three-pattern highlight (temporary)
    if (threePatterns && threePatterns.length > 0) {
      const cells = getHighlightCells(threePatterns); // array of "i-j"
      setHighlighted(new Set(cells));
      // make sure this is not treated as a permanent win
      setIsWinActive(false);

      const timer = setTimeout(() => {
        setHighlighted(new Set());
      }, 500);

      return () => clearTimeout(timer);
    }
    if (!isWinActive) setHighlighted(new Set());
  }, [board, winKey, threeKey]);

  const handleClick = (i, j) => {
    // disable clicks after a confirmed win
    if (isWinActive || disabled) return;
    makeMove(i, j);
  };

  return (
    <div
      className="grid gap-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border-4 border-purple-500 dark:border-purple-700"
      style={{
        gridTemplateColumns: `repeat(${board?.length}, 1fr)`,
        gridTemplateRows: `repeat(${board?.length}, 1fr)`,
        maxWidth: "600px",
        maxHeight: "600px",
        width: "100%",
        aspectRatio: "1",
      }}
    >
      {board?.map((row, i) =>
        row.map((cell, j) => {
          const key = `${i}-${j}`;
          const isHighlighted = highlighted.has(key);

          // Decide final class:
          // 1) If this is a confirmed win highlight (isWinActive) -> green
          // 2) Else if it's a temporary highlight (threePatterns) -> use player color logic
          // 3) Else normal/default
          const cellClass = isHighlighted
            ? isWinActive
              ? "bg-green-300 dark:bg-green-700"
              : currentPlayer === (localName || player1)
              ? player2Color
              : currentPlayer === player2
              ? player1Color
              : "bg-gray-200 dark:bg-gray-700 hover:bg-yellow-300 dark:hover:bg-yellow-600"
            : "bg-gray-200 dark:bg-gray-700 hover:bg-yellow-300 dark:hover:bg-yellow-600";

          return (
            <div
              key={key}
              className={`flex items-center justify-center border-2 border-gray-400 dark:border-gray-600 rounded-lg shadow-sm transition-all duration-200 ease-in-out transform ${disabled || isWinActive ? "cursor-not-allowed" : "cursor-pointer hover:scale-105"} ${cellClass}`}
              style={{ fontSize: `${Math.max(52, 72 / board?.length)}px` }}
              onClick={() => handleClick(i, j)}
            >
              {cell}
            </div>
          );
        })
      )}
    </div>
  );
};

export default GamePlayingBoard;
