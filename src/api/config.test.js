import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveApiBaseUrl, resolveGameplayUrl } from "./config.js";

test("normalizes the API URL and preserves a backend path prefix", () => {
  assert.equal(resolveApiBaseUrl(" https://example.test/service/api/ "), "https://example.test/service/api");
  assert.equal(
    resolveGameplayUrl("https://example.test/service/api/", "a b/c"),
    "https://example.test/service/gameplay?username=a+b%2Fc"
  );
  assert.equal(resolveGameplayUrl("http://localhost:8080/api", "player"), "http://localhost:8080/gameplay?username=player");
});

test("rejects missing and malformed backend configuration", () => {
  for (const value of [undefined, "", "not a url", "ftp://example.test/api", "https://example.test", "https://example.test/api?x=1", "https://example.test/api#x", "https://user:pass@example.test/api"]) {
    assert.throws(() => resolveApiBaseUrl(value), /VITE_API_URL/);
  }
});
