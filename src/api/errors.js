function collectMessages(value) {
  if (typeof value === "string") {
    const message = value.trim();
    return message ? [message] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectMessages);
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectMessages);
  }
  return [];
}

export function getBackendErrorMessage(data, fallback) {
  const messages = collectMessages(
    typeof data === "string" ? data : data?.message
  );
  return messages.length ? [...new Set(messages)].join("; ") : fallback;
}

export function getRequestErrorMessage(error, fallback) {
  if (error?.response) {
    return getBackendErrorMessage(error.response.data, fallback);
  }
  if (error?.request) {
    return "Network error. Please check your internet connection.";
  }
  return error instanceof Error ? error.message : fallback;
}
