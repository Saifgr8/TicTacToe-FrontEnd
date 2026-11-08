import { test } from "node:test";
import assert from "node:assert/strict";
import { availableMoveTypes, canSelectMove } from "./moveSelection.js";
import { specialMoveCost } from "./descriptionHelper.js";

test("move selection respects points, active Twist, and game lock", () => {
  for (const type of availableMoveTypes) {
    const cost = specialMoveCost.get(type);
    assert.equal(canSelectMove(type, cost, specialMoveCost, false, false), true);
    if (cost > 0) assert.equal(canSelectMove(type, cost - 1, specialMoveCost, false, false), false);
    assert.equal(canSelectMove(type, cost, specialMoveCost, false, true), false);
  }
  assert.equal(canSelectMove("TWIST", 10, specialMoveCost, true, false), false);
  assert.equal(canSelectMove("NORMAL", undefined, specialMoveCost, false, false), true);
});
