export const moveDescriptions = new Map([
  ["NORMAL", "Standard move to an empty cell."],
  ["EMPTY_CELL", "Clear your opponents cell, stop em from winning."],
  ["OVERRIDE", "Replace opponent's symbol with your own. Feels like cheating"],
  [
    "DOUBLE_OVERRIDE",
    "Override two opponent symbols in a single turn. Double cheating",
  ],
  [
    "EMPTY_PATTERN",
    "Clear a full row, column, or diagonal pattern. How about making oppoent start from 0?",
  ],
  ["TWIST", "Exchange the symbols for 2 turns. THIS IS CRAZZZYYY"],
]);
export const specialMoveCost = new Map([
  ["NORMAL", 0],
  ["EMPTY_CELL", 2],
  ["PATTERN_BOMB", 2],
  ["OVERRIDE", 4],
  ["DOUBLE_OVERRIDE", 5],
  ["TWIST", 3],
]);

export const movePatterns = [
  "ROW",
  "COLUMN",
  "LEFT_DIAGONAL",
  "RIGHT_DIAGONAL",
];

export const emptyPatternMoveDescription = new Map([
  ["ROW", "Clear an entire row."],
  ["COLUMN", "Clear an entire column"],
  ["LEFT_DIAGONAL", "Clear an entire Left diagonal"],
  ["RIGHT_DIAGONAL", "Clear an entire right diagonal"],
]);
