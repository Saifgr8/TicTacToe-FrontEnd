import { test } from "node:test";
import assert from "node:assert/strict";
import { getBackendErrorMessage, getRequestErrorMessage } from "./errors.js";

test("formats backend messages, including multiple field validation errors", () => {
  const response = {
    error: "INTERNAL_SERVER_ERROR",
    message: {
      password: "Password must be between 6 and 12 characters",
      email: ["Email is required", "Email must be valid"],
    },
    status: 500,
  };
  assert.equal(
    getBackendErrorMessage(response, "Fallback"),
    "Password must be between 6 and 12 characters; Email is required; Email must be valid"
  );
  assert.equal(getRequestErrorMessage({ response: { data: response } }, "Fallback"), getBackendErrorMessage(response, "Fallback"));
  assert.equal(getBackendErrorMessage({ message: "Invalid credentials" }, "Fallback"), "Invalid credentials");
  assert.equal(getBackendErrorMessage("Server unavailable", "Fallback"), "Server unavailable");
  assert.equal(getBackendErrorMessage({ message: { password: ["Required", "Required"] } }, "Fallback"), "Required");
});

test("uses explicit fallbacks for empty responses and reports network and configuration errors", () => {
  for (const data of [null, {}, { message: {} }, { message: [null, "", 42] }]) {
    assert.equal(getBackendErrorMessage(data, "Fallback"), "Fallback");
  }
  assert.equal(getRequestErrorMessage({ response: { data: {} } }, "Fallback"), "Fallback");
  assert.equal(getRequestErrorMessage({ request: {} }, "Fallback"), "Network error. Please check your internet connection.");
  assert.equal(getRequestErrorMessage(new Error("VITE_API_URL is missing"), "Fallback"), "VITE_API_URL is missing");
});
