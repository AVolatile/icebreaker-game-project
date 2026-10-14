import { networkInterfaces } from "node:os";
export function allowedOrigins(env: NodeJS.ProcessEnv = process.env) {
  return [
    ...new Set(
      [env.CLIENT_ORIGIN, ...(env.ALLOWED_ORIGINS ?? "").split(",")]
        .filter((s): s is string => !!s)
        .map((s) => {
          const url = new URL(s.trim());
          if (
            !["http:", "https:"].includes(url.protocol) ||
            url.username ||
            url.password ||
            url.pathname !== "/" ||
            url.search ||
            url.hash ||
            (env.NODE_ENV === "production" && url.protocol !== "https:")
          )
            throw new Error(
              "Allowed client URLs must be exact HTTPS origins in production.",
            );
          return url.origin;
        }),
    ),
  ];
}
export function publicAppOrigin(env: NodeJS.ProcessEnv = process.env) {
  const value = env.PUBLIC_APP_URL ?? env.PUBLIC_JOIN_URL;
  if (!value) {
    if (env.NODE_ENV === "production" && env.REALTIME_ONLY === "true")
      throw new Error(
        "PUBLIC_APP_URL is required for the public realtime service.",
      );
    return null;
  }
  const url = new URL(value);
  if (
    env.NODE_ENV === "production" &&
    env.REALTIME_ONLY === "true" &&
    (url.protocol !== "https:" ||
      /^(localhost$|127\.|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|\[?::1\]?$|\[?f[cd][0-9a-f]{2}:)/i.test(
        url.hostname,
      ))
  )
    throw new Error("PUBLIC_APP_URL must be the public HTTPS frontend origin.");
  return url.origin;
}
export function getPublicJoinUrl(
  code: string,
  request: { host: string; origin?: string },
  port: number,
  env: NodeJS.ProcessEnv = process.env,
) {
  let base = publicAppOrigin(env);
  if (!base) {
    const origin = request.origin ? new URL(request.origin) : null;
    const host = origin?.host ?? request.host;
    const local = /^(localhost|127\.0\.0\.1)(:|$)/.test(host);
    const ip = Object.values(networkInterfaces())
      .flatMap((n) => n ?? [])
      .find((n) => n.family === "IPv4" && !n.internal)?.address;
    base =
      local && ip
        ? `http://${ip}:${port}`
        : `${origin?.protocol ?? "http:"}//${host}`;
  }
  return new URL(`/join?room=${code}`, base).toString();
}
