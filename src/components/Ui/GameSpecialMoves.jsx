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
  disabled = false,
  compact = false,
}) => {
  currentPlayerPoints =
    currentPlayerPoints === undefined ? 0 : currentPlayerPoints;
  return (
    <div
      className={`
        w-full max-w-3xl mx-auto p-5 sm:p-6
        bg-white dark:bg-slate-900
        text-gray-900 dark:text-white 
        rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700
        transition-all duration-300
        ${compact ? "lg:p-4" : ""}
      `}
    >
      {/* Header */}
      <h3 className={`text-2xl font-extrabold mb-6 text-center text-indigo-700 dark:text-indigo-300 tracking-wide ${compact ? "lg:mb-3 lg:text-lg lg:text-left" : ""}`}>
        🎯 Select Your Move Type
      </h3>

      {/* Move Type Buttons */}
      <div className={`flex flex-wrap justify-center gap-4 mb-6 ${compact ? "lg:justify-start lg:gap-2 lg:mb-3" : ""}`}>
        {[
          "NORMAL",
          "TWIST",
          "PATTERN_BOMB",
          "OVERRIDE",
          "DOUBLE_OVERRIDE",
        ].map((type) => {
          const affordable =
            !disabled && currentPlayerPoints >= specialMoveCost.get(type) &&
            !(type === "TWIST" && isTwistActive);

          const isSelected = selectedMoveType === type;

          return (
            <button
              key={type}
              type="button"
              disabled={!affordable}
              aria-pressed={isSelected}
              title={type === "TWIST" && isTwistActive ? "Twist is already active" : undefined}
              onClick={() => affordable && setSelectedMoveType(type)}
              className={`
                px-4 py-2 rounded-xl font-semibold text-sm transition ${compact ? "lg:px-3 lg:py-1.5" : ""}
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                ${
                  affordable
                    ? `bg-gradient-to-r ${
                        isSelected
                          ? "from-indigo-600 to-indigo-700"
                          : "from-slate-600 to-slate-700"
                      } text-white`
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

      {isTwistActive && (
        <p className="mb-4 text-center text-sm text-indigo-700 dark:text-indigo-300">
          Twist is unavailable while a twist is active.
        </p>
      )}

      {/* Empty Pattern Section */}
      {selectedMoveType === "PATTERN_BOMB" && (
        <div
          className={`
            border border-gray-300 dark:border-gray-700 
            rounded-xl p-5 mb-5 bg-gradient-to-br 
            from-blue-50 via-blue-100 to-indigo-100 
            dark:from-gray-800 dark:via-gray-900 dark:to-black 
            shadow-inner transition-all
            ${compact ? "lg:p-2 lg:mb-2" : ""}
          `}
        >
          <h4 className={`text-lg font-bold text-center mb-3 text-indigo-700 dark:text-indigo-300 ${compact ? "lg:mb-2 lg:text-sm" : ""}`}>
            🧩 Empty Pattern Move Set
          </h4>

          <div className={`flex flex-wrap justify-center gap-3 ${compact ? "lg:gap-1" : ""}`}>
            {movePatterns.map((pattern, index) => (
              <button
                key={index}
                type="button"
                disabled={disabled}
                aria-pressed={selectedMovePattern === pattern}
                onClick={() => setSelectedMovePattern(pattern)}
                className={`
                  px-4 py-2 rounded-full font-semibold text-sm shadow-sm transition-all 
                  hover:scale-105 active:scale-95
                  ${compact ? "lg:px-2 lg:py-1 lg:text-xs" : ""}
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
        className={`
          mt-4 px-5 py-3 w-full text-center 
          bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400
          dark:from-amber-800 dark:via-amber-700 dark:to-amber-600 
          text-gray-900 dark:text-white 
          rounded-xl border border-amber-400 dark:border-amber-800 
          shadow-md italic font-semibold
          ${compact ? "lg:mt-2 lg:px-3 lg:py-2 lg:text-sm" : ""}
        `}
      >
        {selectedMoveType === "PATTERN_BOMB"
          ? emptyPatternMoveDescription.get(selectedMovePattern)
          : moveDescriptions.get(selectedMoveType)}
      </div>
    </div>
  );
};

export default GameSpecialMoves;
