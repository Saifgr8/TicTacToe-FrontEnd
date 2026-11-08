import React from "react";
import { getPlayerSymbols } from "../utils/sessionSymbols";

const PlayerScoreDisplay = ({
  player1Username,
  player2Username,
  player1Points,
  player1Symbol,
  player2Points,
  player2Symbol,
  player1Color,
  player2Color,
  isTwistActive,
  previewTwist = false,
  compact = false,
}) => {
  const symbols = getPlayerSymbols({
    player1Symbol,
    player2Symbol,
    twistActive: isTwistActive,
  }, previewTwist);

  return (
    <div
      className={`
     w-full max-w-3xl mx-auto p-5
        bg-white dark:bg-slate-900
        text-gray-900 dark:text-white 
        rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700
        ${compact ? "lg:p-4" : ""}`}
    >
      <h2 className={`text-lg font-bold mb-4 text-slate-900 dark:text-white ${compact ? "lg:mb-2" : ""}`}>
        Match scoreboard
      </h2>
      {previewTwist && (
        <p className="mb-3 text-center text-sm">Twist symbol preview</p>
      )}

      <div className={`grid grid-cols-2 gap-3 ${compact ? "" : "lg:grid-cols-1"}`}>
        {/* Player 1 Card */}
        <div
          className={`${player1Color || "bg-slate-700"}
         p-5 rounded-xl shadow-lg border border-indigo-400/30 text-center ${compact ? "lg:p-3" : ""}`}
        >
          <h3 className={`break-words text-xl font-bold text-indigo-200 mb-3 ${compact ? "lg:mb-1 lg:text-base" : ""}`}>
            {player1Username}
          </h3>
          <div className={`space-y-2 ${compact ? "lg:space-y-0" : ""}`}>
            <p className={`text-lg font-medium text-indigo-300 ${compact ? "lg:text-sm" : ""}`}>
              Points:{" "}
              <span className={`text-3xl font-extrabold text-white ${compact ? "lg:text-xl" : ""}`}>
                {player1Points ?? 0}
              </span>
            </p>
            <p className={`text-lg font-medium text-indigo-300 ${compact ? "lg:text-sm" : ""}`}>
              Symbol:{" "}
              <span className={`text-3xl font-extrabold text-white ${compact ? "lg:text-xl" : ""}`}>
                {symbols?.player1}
              </span>
            </p>
          </div>
        </div>

        {/* Player 2 Card */}
        <div
          className={`${player2Color || "bg-slate-700"}
            p-5 rounded-xl shadow-lg border border-indigo-400/30 text-center ${compact ? "lg:p-3" : ""}`}
        >
          <h3 className={`break-words text-xl font-bold text-pink-200 mb-3 ${compact ? "lg:mb-1 lg:text-base" : ""}`}>
            {player2Username}
          </h3>
          <div className={`space-y-2 ${compact ? "lg:space-y-0" : ""}`}>
            <p className={`text-lg font-medium text-pink-300 ${compact ? "lg:text-sm" : ""}`}>
              Points:{" "}
              <span className={`text-3xl font-extrabold text-white ${compact ? "lg:text-xl" : ""}`}>
                {player2Points ?? 0}
              </span>
            </p>
            <p className={`text-lg font-medium text-pink-300 ${compact ? "lg:text-sm" : ""}`}>
              Symbol:{" "}
              <span className={`text-3xl font-extrabold text-white ${compact ? "lg:text-xl" : ""}`}>
                {symbols?.player2}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerScoreDisplay;
