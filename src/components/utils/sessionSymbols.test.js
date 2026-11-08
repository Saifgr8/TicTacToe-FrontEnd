import { test } from "node:test";
import assert from "node:assert/strict";
import { getCurrentPlayerSymbol, getPlayerSymbols } from "./sessionSymbols.js";

test("derives effective symbols from the session's original assignments", () => {
  const session = {
    player1Symbol: "X",
    player2Symbol: "O",
    currentPlayer: "player1",
    twistActive: false,
  };
  assert.deepEqual(getPlayerSymbols(session), { player1: "X", player2: "O" });
  assert.equal(getCurrentPlayerSymbol(session, "player1", "player2"), "X");

  session.twistActive = true;
  session.currentPlayer = "player2";
  assert.deepEqual(getPlayerSymbols(session), { player1: "O", player2: "X" });
  assert.equal(getCurrentPlayerSymbol(session, "player1", "player2"), "X");

  session.currentPlayer = "player1";
  assert.equal(getCurrentPlayerSymbol(session, "player1", "player2"), "O");

  session.twistActive = false;
  assert.equal(getCurrentPlayerSymbol(session, "player1", "player2"), "X");
});

test("does not guess when session symbols or the current player are missing", () => {
  assert.equal(getCurrentPlayerSymbol(null, "player1", "player2"), null);
  assert.equal(
    getCurrentPlayerSymbol(
      { player1Symbol: "X", player2Symbol: "O", currentPlayer: "other" },
      "player1",
      "player2"
    ),
    null
  );
  assert.equal(getPlayerSymbols({ player1Symbol: "X" }), null);
});

test("previews Twist without changing the symbol sent for the move", () => {
  const session = {
    player1Symbol: "X",
    player2Symbol: "O",
    currentPlayer: "player1",
    twistActive: false,
  };
  assert.deepEqual(getPlayerSymbols(session, true), { player1: "O", player2: "X" });
  assert.equal(getCurrentPlayerSymbol(session, "player1", "player2", true), "O");
  assert.equal(getCurrentPlayerSymbol(session, "player1", "player2"), "X");
  assert.deepEqual(getPlayerSymbols(session), { player1: "X", player2: "O" });

  session.twistActive = true;
  assert.deepEqual(getPlayerSymbols(session, true), { player1: "O", player2: "X" });
  session.currentPlayer = "player2";
  assert.equal(getCurrentPlayerSymbol(session, "player1", "player2", true), "X");
  session.twistActive = false;
  assert.equal(getCurrentPlayerSymbol(session, "player1", "player2"), "O");
});
