import { getApiBaseUrl } from "../config.js";
import { getBackendErrorMessage } from "../errors.js";

const createHttpError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const readResponse = async (res, operation) => {
  let data;
  try {
    data = await res.json();
  } catch (error) {
    if (!res.ok) throw createHttpError(`${operation} (HTTP ${res.status}).`, res.status);
    throw error;
  }
  if (!res.ok) {
    throw createHttpError(
      getBackendErrorMessage(data, `${operation} (HTTP ${res.status}).`),
      res.status
    );
  }
  return data;
};

export const createGameApi = async (data, apiBaseUrl = getApiBaseUrl()) => {
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
  const res = await fetch(`${apiBaseUrl}/match/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
    body: JSON.stringify(payload),
  });
  return readResponse(res, "Could not create game");
};
export const makeMoveApi = async (data, apiBaseUrl = getApiBaseUrl()) => {
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
  const res = await fetch(`${apiBaseUrl}/match/move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
    body: JSON.stringify(payload),
  });
  return readResponse(res, "Could not make move");
};

export const getGameSessionApi = async (sessionId, token, signal, apiBaseUrl = getApiBaseUrl()) => {
  const res = await fetch(
    `${apiBaseUrl}/match/session/${encodeURIComponent(sessionId)}`,
    {
      headers: { Authorization: `${token}` },
      signal,
    }
  );
  if (!res.ok) {
    let data;
    try {
      data = await res.json();
    } catch (error) {
      if (signal?.aborted) throw error;
      throw createHttpError(`Could not retrieve game session (HTTP ${res.status}).`, res.status);
    }
    throw createHttpError(
      getBackendErrorMessage(data, `Could not retrieve game session (HTTP ${res.status}).`),
      res.status
    );
  }
  return res.json();
};
