const readResponse = async (res, operation) => {
  let data;
  try {
    data = await res.json();
  } catch (error) {
    if (!res.ok) throw new Error(`${operation} (HTTP ${res.status}).`);
    throw error;
  }
  if (!res.ok) {
    throw new Error(data?.message || `${operation} (HTTP ${res.status}).`);
  }
  return data;
};

export const createGameApi = async (data) => {
  const {
    player1Username,
    player2Username,
    player1Symbol,
    player2Symbol,
    startingPlayer,
    boardSize,
    token,
    gameMode,
  } = data;
  const payload = {
    player1Username,
    player2Username,
    player1Symbol,
    player2Symbol,
    startingPlayer,
    boardSize,
    gameMode,
  };
  const res = await fetch("http://localhost:8080/api/match/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
    body: JSON.stringify(payload),
  });
  return readResponse(res, "Could not create game");
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
  return readResponse(res, "Could not make move");
};

export const getGameSessionApi = async (sessionId, token, signal) => {
  const res = await fetch(
    `http://localhost:8080/api/match/session/${encodeURIComponent(sessionId)}`,
    {
      headers: { Authorization: `${token}` },
      signal,
    }
  );
  if (!res.ok) {
    throw new Error(`Could not retrieve game session (HTTP ${res.status}).`);
  }
  return res.json();
};
