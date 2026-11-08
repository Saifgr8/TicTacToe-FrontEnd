export function getRowLabel(index) {
  if (!Number.isInteger(index) || index < 0) return null;
  let value = index + 1;
  let label = "";
  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + value % 26) + label;
    value = Math.floor(value / 26);
  }
  return label;
}

export function getBoardCoordinate(row, column) {
  const label = getRowLabel(row);
  if (!label || !Number.isInteger(column) || column < 0) return null;
  return `${label}${column + 1}`;
}
