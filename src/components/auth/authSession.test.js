import { test } from "node:test";
import assert from "node:assert/strict";
import { hasAuthSession } from "./authSession.js";

const storage = (values) => ({ getItem: (key) => values[key] ?? null });

test("requires both a stored token and username", () => {
  assert.equal(hasAuthSession(storage({})), false);
  assert.equal(hasAuthSession(storage({ token: "Bearer token" })), false);
  assert.equal(hasAuthSession(storage({ username: "Alice" })), false);
  assert.equal(hasAuthSession(storage({ token: "Bearer token", username: "Alice" })), true);
});

test("rejects empty or accidentally stringified missing values", () => {
  for (const value of ["", " ", "null", "undefined"]) {
    assert.equal(hasAuthSession(storage({ token: value, username: "Alice" })), false);
    assert.equal(hasAuthSession(storage({ token: "Bearer token", username: value })), false);
  }
});
