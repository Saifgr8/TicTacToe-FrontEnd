import { getApiBaseUrl } from "../config.js";

export async function checkAuthentication(token, signal, apiBaseUrl = getApiBaseUrl()) {
  const headers = token ? { Authorization: token } : {};
  const response = await fetch(`${apiBaseUrl}/auth/check`, { headers, signal });
  if (response.status === 401 || response.status === 403) return false;
  if (!response.ok) {
    throw new Error(`Could not check authentication (HTTP ${response.status}). Please try again.`);
  }
  return true;
}
