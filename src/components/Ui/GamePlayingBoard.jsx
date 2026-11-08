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
  highlightDuration = 500,
}) => {
  const [highlighted, setHighlighted] = useState(new Set());

  const [isWinActive, setIsWinActive] = useState(false);

  const winKey = JSON.stringify(winPattern);
  const threeKey = JSON.stringify(threePatterns);

  useEffect(() => {
    const currentWinPatterns = JSON.parse(winKey);
    const currentThreePatterns = JSON.parse(threeKey);
    // CASE 1 → Winning move → permanent highlight
    if (currentWinPatterns && currentWinPatterns.length > 0) {
      const cells = getWinCells(currentWinPatterns, board.length); // should return array of "i-j"
      setHighlighted(new Set(cells));
      setIsWinActive(true); // mark permanent win highlight
      return; // do NOT clear highlight
    }

    // CASE 2 → Three-pattern highlight (temporary)
    if (currentThreePatterns && currentThreePatterns.length > 0) {
      const cells = getHighlightCells(currentThreePatterns); // array of "i-j"
      setHighlighted(new Set(cells));
      // make sure this is not treated as a permanent win
      setIsWinActive(false);

      const timer = setTimeout(() => {
        setHighlighted(new Set());
      }, highlightDuration);

      return () => clearTimeout(timer);
    }
    setIsWinActive(false);
    setHighlighted(new Set());
  }, [board, winKey, threeKey, highlightDuration]);

  const handleClick = (i, j) => {
    // disable clicks after a confirmed win
    if (isWinActive || disabled) return;
    makeMove(i, j);
  };

  return (
    <div
      aria-label="Game board"
      className="grid gap-1 sm:gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"
      style={{
        containerType: "inline-size",
        gridTemplateColumns: `repeat(${board?.length || 1}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${board?.length || 1}, minmax(0, 1fr))`,
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
            <button
              key={key}
              type="button"
              aria-label={`Row ${i + 1}, column ${j + 1}: ${cell || "empty"}`}
              disabled={disabled || isWinActive}
              className={`min-w-0 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${disabled || isWinActive ? "cursor-not-allowed" : "cursor-pointer"} ${cellClass}`}
              style={{ fontSize: `clamp(0.75rem, ${65 / board.length}cqw, 3.25rem)` }}
              onClick={() => handleClick(i, j)}
            >
              {cell}
            </button>
          );
        })
      )}
    </div>
  );
};

export default GamePlayingBoard;
