export function realtimeUrl() {
  const value = import.meta.env.VITE_REALTIME_URL?.trim();
  if (value) {
    const url = new URL(value);
    if (window.location.protocol === "https:" && url.protocol !== "https:")
      throw new Error("The live stage needs a secure connection.");
    return url.origin;
  }
  return window.location.origin;
}
