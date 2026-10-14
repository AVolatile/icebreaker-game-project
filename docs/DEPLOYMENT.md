# Deploying Ruckus

Ruckus is one persistent Node service. Static-only or request-isolated serverless hosting cannot hold the Socket.IO room engine. Choose a WebSocket-capable Node service or container. No specific provider account is required.

## Service settings

- Node: 22 LTS or newer recommended.
- Install/build: `npm ci && npm run build`.
- Start: `npm start`.
- Bind: 0.0.0.0; use the provider’s `PORT`.
- Health path: `/api/health`.
- Instances: one. Rooms and tokens are held in memory.
- HTTPS: terminate TLS on the provider or reverse proxy; forward WebSocket upgrades.
- Set `PUBLIC_JOIN_URL` to the HTTPS public origin. This avoids private/internal addresses in QR codes behind proxies.

Render/Railway/Fly.io are examples of providers offering persistent services; their current plan details must be checked before purchasing. Provider configuration is deliberately kept out of the product.

## Environment

```text
PORT=4310
NODE_ENV=production
PUBLIC_JOIN_URL=https://your-domain.example
# Optional comma-separated extra permitted browser origins:
ALLOWED_ORIGINS=https://another-controller-origin.example
```

The default origin check compares the browser’s origin host to the request Host header. A proxy must preserve that host or the explicit allowlist must include the public origin. Do not allow arbitrary origins.

## Container

A Dockerfile is included. Build and run:

```sh
docker build -t ruckus .
docker run --rm -p 4310:4310 -e PUBLIC_JOIN_URL=http://192.168.1.20:4310 ruckus
```

Set a public HTTPS origin for internet play. The image listens on the runtime `PORT`, default 4310. Use a non-root user and a health check.

## Operational limits

Restart/redeploy clears live rooms. One host can reconnect for five minutes before its unattended session is ended. Ended rooms clean up after one minute; inactive rooms expire after two hours. No personal email, password, permanent score history, analytics, or billing data is stored.

Scaling beyond one process needs a shared room store, synchronized scheduling, distributed rate limits, and a Socket.IO adapter, plus load-balancer configuration. An adapter alone does not persist the game engine. Add that only when real traffic warrants it.

## Launch checklist

1. Build and start the production process.
2. Confirm `/api/health` and the homepage.
3. Create a room and verify the QR resolves to the public origin.
4. Join from a separate device on another network.
5. Complete a trivia and a creative voting round.
6. Refresh the player and host tabs to verify reconnection.
7. Confirm same-origin enforcement and end-room behavior.

A remote video call does not require an integration: share the host screen in the existing call and join on phones or separate tabs.

## Technical references

The implementation follows [Socket.IO server configuration](https://socket.io/docs/v4/server-options/) for origin and payload controls, and [Vite backend integration](https://vite.dev/guide/backend-integration.html) for a frontend served alongside the Node backend.
