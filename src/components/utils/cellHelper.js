// helper function to convert patterns to a set of coordinates
export const getHighlightCells = (patterns) => {
    const cells = new Set();
    patterns.forEach((pattern) => {
      const parts = pattern.split("-");
      const type = parts[0];
      
      if (type === "H") { // Horizontal -> H-row-col1-col2-col3
        const row = parseInt(parts[1]);
        for (let j = 2; j <= 4; j++) cells.add(`${row}-${parts[j]}`);
      } else if (type === "V") { // Vertical -> V-col-row1-row2-row3
        const col = parseInt(parts[1]);
        for (let i = 2; i <= 4; i++) cells.add(`${parts[i]}-${col}`);
      } else if (type === "MD") { // Main diagonal -> MD-index-one-two-three (all same row=col logic)
        for (let k = 2; k <= 4; k++) cells.add(`${parts[k]}-${parts[k]}`);
      } else if (type === "D") { // Diagonal -> D-index-one-two-three
        const startRow = parseInt(parts[1]);
        for (let k = 2; k <= 4; k++) cells.add(`${startRow + (k-2)}-${parts[k]}`);
      } else if (type === "A") { // Anti diagonal -> A-index-three-two-one
        const startRow = parseInt(parts[1]);
        for (let k = 2; k <= 4; k++) {
          cells.add(`${startRow + (k-2)}-${parts[k]}`);
        }
      }
    });
    return cells;
  };

  export function getWinCells(winPatterns, boardSize) {
    const cells = new Set();
  
    winPatterns.forEach(pattern => {
      const [type, num] = pattern.split("-");
      const index = parseInt(num);
  
      if (type === "ROW") {
        for (let col = 0; col < boardSize; col++) {
          cells.add(`${index}-${col}`);
        }
      }
  
      if (type === "COL") {
        for (let row = 0; row < boardSize; row++) {
          cells.add(`${row}-${index}`);
        }
      }
  
      if (type === "MD") {
        for (let k = 0; k < boardSize; k++) {
          cells.add(`${k}-${k}`);
        }
      }
  
      if (type === "AD") {
        for (let k = 0; k < boardSize; k++) {
          cells.add(`${k}-${boardSize - k - 1}`);
        }
      }
    });
  
    return cells;
  }
  
  