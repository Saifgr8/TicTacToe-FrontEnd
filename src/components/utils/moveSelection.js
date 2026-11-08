export const availableMoveTypes = [
  "NORMAL",
  "TWIST",
  "PATTERN_BOMB",
  "OVERRIDE",
  "DOUBLE_OVERRIDE",
];

export function canSelectMove(type, points, costs, isTwistActive, disabled) {
  return !disabled && (points ?? 0) >= costs.get(type) &&
    !(type === "TWIST" && isTwistActive);
}
