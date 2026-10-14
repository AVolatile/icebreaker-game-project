# Deployment

The current public target is a **Netlify frontend + persistent Render Node realtime service**. See [NETLIFY-PRODUCTION.md](NETLIFY-PRODUCTION.md) for exact setup order, environment values, QR/CORS behavior, commands and troubleshooting.

For an optional combined service, `npm run build` builds both sides; `NODE_ENV=production npm start` serves `dist` and Socket.IO on the same `PORT`. Set `PUBLIC_APP_URL` to that service's public HTTPS origin. This alternative is not the Netlify production target.

State remains in memory. Deployments/restarts lose active rooms. One always-on instance is supported; durable state and horizontal scaling remain future work. No public deployment is claimed without provider provisioning and internet/device verification.
