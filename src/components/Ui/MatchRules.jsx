import React, { useState } from "react";
import {
  Clock,
  UserX,
  Award,
  Zap,
  ShieldCheck,
  Flag,
  Wifi,
  RefreshCcw,
  Info,
  Maximize2,
} from "lucide-react";

const MatchRules = ({ setRulesRead, valid }) => {
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);

  const rules = [
    {
      icon: <Clock className="w-6 h-6 text-blue-500 dark:text-blue-300" />,
      title: "Turn Time Limit",
      description:
        "Players must complete their turn within 20 seconds. Failure to do so will result in a forfeited turn and potential point deduction.",
    },
    {
      icon: <UserX className="w-6 h-6 text-red-500 dark:text-red-300" />,
      title: "Leaver Penalty",
      description:
        "Leaving a match prematurely will negatively impact your behavior score and may lead to low-priority matchmaking queues.",
    },
    {
      icon: <Award className="w-6 h-6 text-yellow-500 dark:text-yellow-300" />,
      title: "Scoring Points",
      description:
        "Earn 1 point by completing any 3-cell consecutive pattern (row, sub-row, column, sub-column, left diagonal, sub-left-diagonal, right diagonal, or sub-right-diagonal).",
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-500 dark:text-purple-300" />,
      title: "Strategic Special Moves",
      description:
        "Unlock and utilize powerful special moves costing between 3 to 5 points. These moves offer unique strategic advantages to turn the tide.",
    },
    {
      icon: (
        <ShieldCheck className="w-6 h-6 text-green-500 dark:text-green-300" />
      ),
      title: "Fair Play & Sportsmanship",
      description:
        "Maintain a respectful and sportsmanlike conduct. Any form of harassment, abuse, or cheating is strictly prohibited and will be penalized.",
    },
    {
      icon: <Flag className="w-6 h-6 text-gray-500 dark:text-gray-300" />,
      title: "Reporting Misconduct",
      description:
        "If you observe any misconduct or suspicious activity, please use the in-game reporting system to ensure a fair environment for all.",
    },
    {
      icon: (
        <Maximize2 className="w-6 h-6 text-orange-500 dark:text-orange-300" />
      ),
      title: "Evergrowing Board (Draw Scenarios)",
      description:
        "In the event of a draw, the board expands. The game continues until a winning pattern is formed.",
    },
    {
      icon: <RefreshCcw className="w-6 h-6 text-teal-500 dark:text-teal-300" />,
      title: "Match End Conditions",
      description:
        "A match ends when a player forms a full row, column, or diagonal across the board.",
    },
    {
      icon: <Info className="w-6 h-6 text-indigo-500 dark:text-indigo-300" />,
      title: "Rematch & New Game",
      description:
        "After the match, request a rematch or start a new game with another player.",
    },
    {
      icon: <Info className="w-6 h-6 text-indigo-500 dark:text-indigo-300" />,
      title: "Rematch",
      description:
        "After the match, instantly start a rematch. Try to beat them this time, good luck.",
    },
  ];
  const validRules = [];
  for (let i = 0; i < valid.length; i++) {
    validRules[i] = rules[valid[i]];
  }
  const currentRule = validRules[currentRuleIndex];

  return (
    <div
      className="flex flex-col items-center justify-center  p-4 sm:p-6 font-inter 
  bg-gradient-to-b from-gray-100 to-gray-300 
  dark:from-blue-950 dark:to-gray-900 w-full rounded-xl"
    >
      <div
        className="max-w-xl w-full 
    bg-white dark:bg-gray-800 
    rounded-2xl shadow-2xl p-6 sm:p-8 
    border border-gray-300 dark:border-gray-700 
    text-center transition-all duration-300"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white mb-6">
          Match Rule {currentRuleIndex + 1} of {valid.length}
        </h1>

        <div className="flex justify-center mb-4">{currentRule.icon}</div>

        <h2 className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">
          {currentRule.title}
        </h2>

        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-6">
          {currentRule.description}
        </p>

        <div className="flex justify-between gap-4">
          <button
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-all duration-200 disabled:opacity-50"
            onClick={() => setCurrentRuleIndex((prev) => prev - 1)}
            disabled={currentRuleIndex === 0}
          >
            ⬅ Prev
          </button>

          {currentRuleIndex < validRules.length - 1 ? (
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-all duration-200"
              onClick={() => setCurrentRuleIndex((prev) => prev + 1)}
            >
              Next ➡
            </button>
          ) : (
            <button
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded transition-all duration-200"
              onClick={() => {
                setRulesRead(true);
                setCurrentRuleIndex(0);
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

export default MatchRules;
