import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { checkAuthentication } from "./checkAuthentication.js";

const originalFetch = globalThis.fetch;
const baseUrl = "https://example.test/api";

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("checks authentication with the stored authorization and supports plain text responses", async () => {
  const controller = new AbortController();
  globalThis.fetch = async (url, options) => {
    assert.equal(url, `${baseUrl}/auth/check`);
    assert.equal(options.headers.Authorization, "test-token");
    assert.equal(options.signal, controller.signal);
    return { ok: true, status: 200 };
  };
  assert.equal(await checkAuthentication("test-token", controller.signal, baseUrl), true);
});

test("treats 401 and 403 as unauthenticated, including when no token is present", async () => {
  for (const status of [401, 403]) {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, `${baseUrl}/auth/check`);
      assert.deepEqual(options.headers, {});
      return { ok: false, status };
    };
    assert.equal(await checkAuthentication(null, undefined, baseUrl), false);
  }
});

test("surfaces server and network errors instead of treating them as unauthenticated", async () => {
  globalThis.fetch = async () => ({ ok: false, status: 503 });
  await assert.rejects(checkAuthentication("token", undefined, baseUrl), /HTTP 503/);
  globalThis.fetch = async () => { throw new Error("Network unavailable"); };
  await assert.rejects(checkAuthentication("token", undefined, baseUrl), /Network unavailable/);
});
