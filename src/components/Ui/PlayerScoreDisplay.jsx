import React, { useEffect } from "react";

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
  selectedMoveType,
}) => {

  useEffect(() => {
  console.log("selectedMoveType changed:", selectedMoveType);
}, [selectedMoveType]);

  return (
    <div
      className="
     w-full max-w-3xl mx-auto mb-8 p-6 
        bg-gradient-to-br from-gray-100 via-blue-50 to-blue-300
        dark:from-gray-900 dark:via-gray-800 dark:to-black 
        text-gray-900 dark:text-white 
        rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700"
    >
      <h2 className="text-center text-2xl font-bold mb-6 text-indigo-400 tracking-wide">
        ⚔ Match Scoreboard
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-3">
        {/* Player 1 Card */}
        <div
          className={`${player1Color}
         p-5 rounded-xl shadow-lg border border-indigo-400/30 text-center`}
        >
          <h3 className="text-xl font-bold text-indigo-200 mb-3">
            {player1Username}
          </h3>
          <div className="space-y-2">
            <p className="text-lg font-medium text-indigo-300">
              Points:{" "}
              <span className="text-3xl font-extrabold text-white">
                {player1Points ?? 0}
              </span>
            </p>
            <p className="text-lg font-medium text-indigo-300">
              Symbol:{" "}
              <span className="text-3xl font-extrabold text-white">
                {isTwistActive || selectedMoveType === "TWIST"
                  ? player2Symbol
                  : player1Symbol}
              </span>
            </p>
          </div>
        </div>

        {/* Player 2 Card */}
        <div
          className={`${player2Color}
            p-5 rounded-xl shadow-lg border border-indigo-400/30 text-center`}
        >
          <h3 className="text-xl font-bold text-pink-200 mb-3">
            {player2Username}
          </h3>
          <div className="space-y-2">
            <p className="text-lg font-medium text-pink-300">
              Points:{" "}
              <span className="text-3xl font-extrabold text-white">
                {player2Points ?? 0}
              </span>
            </p>
            <p className="text-lg font-medium text-pink-300">
              Symbol:{" "}
              <span className="text-3xl font-extrabold text-white">
                {isTwistActive || selectedMoveType === "TWIST"
                  ? player1Symbol
                  : player2Symbol}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerScoreDisplay;
