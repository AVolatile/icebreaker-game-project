const keys = ["VITE_REALTIME_URL", "VITE_PUBLIC_APP_URL"];
for (const key of keys) {
  const value = process.env[key];
  if (!value && process.env.NETLIFY === "true")
    throw new Error(
      `${key} is required on Netlify. Set the public HTTPS origin and rebuild.`,
    );
  if (value) {
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      (process.env.NETLIFY === "true" && url.protocol !== "https:")
    )
      throw new Error(`${key} must be a public HTTPS origin on Netlify.`);
    if (
      url.pathname !== "/" ||
      url.search ||
      url.hash ||
      url.username ||
      url.password
    )
      throw new Error(
        `${key} must contain only an origin, without a path or credentials.`,
      );
  }
}
console.log("Public frontend configuration validated.");
