import React from "react";

const GameSpecialMoves = ({
  currentPlayerPoints,
  setSelectedMovePattern,
  setSelectedMoveType,
  specialMoveCost,
  selectedMoveType,
  movePatterns,
  emptyPatternMoveDescription,
  selectedMovePattern,
  moveDescriptions,
  isTwistActive,
}) => {
  currentPlayerPoints =
    currentPlayerPoints === undefined ? 0 : currentPlayerPoints;
  return (
    <div
      className="
        mt-10 w-full max-w-3xl mx-auto p-6 
        bg-gradient-to-br from-indigo-50 via-white to-blue-100
        dark:from-gray-900 dark:via-gray-800 dark:to-black
        text-gray-900 dark:text-white 
        rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700
        transition-all duration-300
      "
    >
      {/* Header */}
      <h3 className="text-2xl font-extrabold mb-6 text-center text-indigo-700 dark:text-indigo-300 tracking-wide">
        🎯 Select Your Move Type
      </h3>

      {/* Move Type Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {[
          "NORMAL",
          "PATTERN_BOMB",
          "TWIST",
          "OVERRIDE",
          "DOUBLE_OVERRIDE",
        ].map((type) => {
          const affordable =
            currentPlayerPoints >= specialMoveCost.get(type) &&
            !(type === "TWIST" && isTwistActive);

          const isSelected = selectedMoveType === type;

          return (
            <button
              key={type}
              onClick={() => affordable && setSelectedMoveType(type)}
              className={`
                px-5 py-2 rounded-2xl font-semibold text-sm sm:text-base transition-all duration-200 transform 
                shadow-md hover:scale-105 active:scale-95 
                ${
                  affordable
                    ? `bg-gradient-to-r ${
                        isSelected
                          ? "from-green-600 to-emerald-500"
                          : "from-green-500 to-green-700"
                      } text-white ring-2 ring-green-300 dark:ring-green-600`
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              {type.replace("_", " ")}{" "}
              <span className="font-light">
                ({specialMoveCost.get(type)} pts)
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty Pattern Section */}
      {selectedMoveType === "PATTERN_BOMB" && (
        <div
          className="
            border border-gray-300 dark:border-gray-700 
            rounded-xl p-5 mb-5 bg-gradient-to-br 
            from-blue-50 via-blue-100 to-indigo-100 
            dark:from-gray-800 dark:via-gray-900 dark:to-black 
            shadow-inner transition-all
          "
        >
          <h4 className="text-lg font-bold text-center mb-3 text-indigo-700 dark:text-indigo-300">
            🧩 Empty Pattern Move Set
          </h4>

          <div className="flex flex-wrap justify-center gap-3">
            {movePatterns.map((pattern, index) => (
              <button
                key={index}
                onClick={() => setSelectedMovePattern(pattern)}
                className={`
                  px-4 py-2 rounded-full font-semibold text-sm shadow-sm transition-all 
                  hover:scale-105 active:scale-95
                  ${
                    selectedMovePattern === pattern
                      ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-green-200 dark:hover:bg-green-600"
                  }
                `}
              >
                {pattern}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Move Description */}
      <div
        className="
          mt-4 px-5 py-3 w-full text-center 
          bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400
          dark:from-amber-800 dark:via-amber-700 dark:to-amber-600 
          text-gray-900 dark:text-white 
          rounded-xl border border-amber-400 dark:border-amber-800 
          shadow-md italic font-semibold
        "
      >
        {selectedMoveType === "PATTERN_BOMB"
          ? emptyPatternMoveDescription.get(selectedMovePattern)
          : moveDescriptions.get(selectedMoveType)}
      </div>
    </div>
  );
};

export default GameSpecialMoves;
