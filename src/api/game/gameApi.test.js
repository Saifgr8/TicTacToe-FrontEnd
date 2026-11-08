import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import {
  createGameApi as createGameWithBase,
  getGameSessionApi as getSessionWithBase,
  makeMoveApi as makeMoveWithBase,
} from "./gameApi.js";

const apiBaseUrl = "https://example.test/api";
const createGameApi = (data) => createGameWithBase(data, apiBaseUrl);
const makeMoveApi = (data) => makeMoveWithBase(data, apiBaseUrl);
const getGameSessionApi = (sessionId, token, signal) =>
  getSessionWithBase(sessionId, token, signal, apiBaseUrl);

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("getGameSessionApi sends the session ID, authorization, and abort signal", async () => {
  const controller = new AbortController();
  const session = { sessionId: "game/1", botThinking: true };
  globalThis.fetch = async (url, options) => {
    assert.equal(url, `${apiBaseUrl}/match/session/game%2F1`);
    assert.equal(options.headers.Authorization, "Bearer test-token");
    assert.equal(options.signal, controller.signal);
    return { ok: true, json: async () => session };
  };

  assert.deepEqual(
    await getGameSessionApi("game/1", "Bearer test-token", controller.signal),
    session
  );
});

test("getGameSessionApi reports unsuccessful HTTP responses", async () => {
  globalThis.fetch = async () => ({ ok: false, status: 503 });
  await assert.rejects(getGameSessionApi("game", "token"), /HTTP 503/);
  globalThis.fetch = async () => ({
    ok: false,
    status: 400,
    json: async () => ({ message: { session: "Session expired" } }),
  });
  await assert.rejects(getGameSessionApi("game", "token"), /Session expired/);
});

test("game APIs preserve unauthorized HTTP status", async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({ message: "Full authentication is required" }),
  });
  const isUnauthorized = (error) => error.status === 401;
  await assert.rejects(createGameApi({}), isUnauthorized);
  await assert.rejects(makeMoveApi({}), isUnauthorized);
  await assert.rejects(getGameSessionApi("game", "token"), isUnauthorized);
});

test("create and move requests surface HTTP errors", async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 400,
    json: async () => ({ message: "Invalid move" }),
  });
  await assert.rejects(createGameApi({}), /Invalid move/);
  await assert.rejects(makeMoveApi({}), /Invalid move/);
  globalThis.fetch = async () => ({
    ok: false,
    status: 400,
    json: async () => ({ message: { symbol: "Invalid symbol", move: "Invalid move" } }),
  });
  await assert.rejects(makeMoveApi({}), /Invalid symbol; Invalid move/);
  globalThis.fetch = async () => ({
    ok: false,
    status: 503,
    json: async () => ({}),
  });
  await assert.rejects(makeMoveApi({}), /HTTP 503/);
  globalThis.fetch = async () => ({
    ok: false,
    status: 502,
    json: async () => { throw new SyntaxError("Invalid JSON"); },
  });
  await assert.rejects(createGameApi({}), /HTTP 502/);
});

test("create and move requests preserve successful session responses", async () => {
  const session = { sessionId: "game", board: [[null]], twistActive: false };
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, json: async () => session };
  };
  assert.deepEqual(await createGameApi({
    player1Username: "Alice", player2Username: "Bob", player1Symbol: "X",
    player2Symbol: "O", startingPlayer: "Alice", boardSize: 3,
    gameMode: "PVPOFFLINE", token: "token",
  }), session);
  assert.deepEqual(await makeMoveApi({
    sessionId: "game", x: 0, y: 0, symbol: "X", moveType: "TWIST",
    patternType: "NONE", board: [[null]], token: "token",
  }), session);
  assert.equal(requests[0].url, `${apiBaseUrl}/match/create`);
  assert.equal(requests[1].url, `${apiBaseUrl}/match/move`);
  assert.equal(requests[0].options.headers.Authorization, "token");
  assert.equal(JSON.parse(requests[0].options.body).gameMode, "PVPOFFLINE");
  assert.equal(JSON.parse(requests[1].options.body).symbol, "X");
  assert.equal(JSON.parse(requests[1].options.body).moveType, "TWIST");
});
