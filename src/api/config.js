export function resolveApiBaseUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("VITE_API_URL must be set to the backend API URL ending in /api.");
  }

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("VITE_API_URL must be a valid HTTP(S) URL ending in /api.");
  }

  const path = url.pathname.replace(/\/+$/, "");
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username || url.password || url.search || url.hash ||
    !path.endsWith("/api")
  ) {
    throw new Error("VITE_API_URL must be an HTTP(S) URL ending in /api, without credentials, query, or fragment.");
  }

  url.pathname = path;
  return url.href.replace(/\/$/, "");
}

export function getApiBaseUrl() {
  return resolveApiBaseUrl(import.meta.env?.VITE_API_URL);
}

export function resolveGameplayUrl(value, username) {
  const url = new URL(resolveApiBaseUrl(value));
  url.pathname = `${url.pathname.slice(0, -4)}/gameplay`;
  url.searchParams.set("username", username);
  return url.href;
}

export function getGameplayUrl(username) {
  return resolveGameplayUrl(import.meta.env?.VITE_API_URL, username);
}
