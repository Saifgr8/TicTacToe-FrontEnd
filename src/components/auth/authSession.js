export function hasAuthSession(storage) {
  const isPresent = (value) =>
    Boolean(value && value.trim() && !["null", "undefined"].includes(value.trim()));
  return isPresent(storage.getItem("token")) && isPresent(storage.getItem("username"));
}
