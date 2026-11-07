export const createGameApi = async (data) => {
  const {
    player1Username,
    player2Username,
    player1Symbol,
    player2Symbol,
    startingPlayer,
    boardSize,
    token,
  } = data;
  const payload = {
    player1Username,
    player2Username,
    player1Symbol,
    player2Symbol,
    startingPlayer,
    boardSize,
  };
  const res = await fetch("http://localhost:8080/api/match/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
};
export const makeMoveApi = async (data) => {
  const { sessionId, x, y, symbol, moveType, patternType, board, token } = data;
  const payload = {
    sessionId,
    x,
    y,
    symbol,
    moveType: moveType || "NORMAL",
    patternType: patternType || "NONE",
    board,
  };
  const res = await fetch("http://localhost:8080/api/match/move", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
};
