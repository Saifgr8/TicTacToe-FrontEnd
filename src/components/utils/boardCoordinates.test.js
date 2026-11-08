import { test } from "node:test";
import assert from "node:assert/strict";
import { getBoardCoordinate, getRowLabel } from "./boardCoordinates.js";

test("formats zero-based row and column coordinates", () => {
  assert.equal(getBoardCoordinate(0, 3), "A4");
  assert.equal(getBoardCoordinate(3, 2), "D3");
  assert.equal(getBoardCoordinate(26, 0), "AA1");
  assert.equal(getRowLabel(51), "AZ");
  assert.equal(getRowLabel(52), "BA");
});

test("rejects invalid coordinates", () => {
  for (const [row, column] of [[-1, 0], [0, -1], [null, 0], [0, undefined], [0.5, 0]]) {
    assert.equal(getBoardCoordinate(row, column), null);
  }
});
