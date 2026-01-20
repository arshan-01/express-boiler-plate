# Backend Express Template

Scalable Node.js/Express starter with MongoDB (Mongoose), Redis, BullMQ, Zod validation, global error/response helpers, and modular routing.

## Stack
- Node.js (ESM) + Express
- MongoDB via Mongoose
- Redis + BullMQ
- Zod validation
- Pino logging

## Setup
1) Install deps  
```bash
npm install
```
2) Copy env and adjust values  
```bash
cp env.example .env
```
3) Start dev server  
```bash
npm run dev
```

## Structure
- `src/config/env.js` – centralized config object (no Zod validation, plain object)
- `src/config/logger.js` – pino logger
- `src/config/mongo.js` – MongoDB connection with pooling
- `src/config/redis.js` – Redis connection (BullMQ compatible)
- `src/utils/` – async handler, AppError, api response
- `src/middlewares/` – error/404 handlers, validator
- `src/modules/` – feature modules
  - `health` – simple health route
  - `user` – sample CRUD list/create with zod schemas
  - `notify` – email & notification queue endpoints
- `src/routes/index.js` – API router mounting modules
- `src/queues/queues.js` – BullMQ queues
- `src/queues/workers.js` – BullMQ workers with concurrency & rate limiting
- `src/services/mailer.js` – Nodemailer transporter + send helper
- `src/services/notification.js` – socket notification dispatcher
- `src/realtime/socket.js` – Socket.io gateway with Redis adapter (multi-instance support)
- `src/app.js` – express app setup
- `src/server.js` – bootstrap: connect DB/redis, start workers & server
- `src/worker.js` – standalone worker process (optional, for separate scaling)

## Example routes
- `GET /api/health` – uptime + timestamp
- `GET /api/users?limit=20&offset=0` – list users
- `POST /api/users` – create user  
  body: `{ "email": "a@b.com", "name": "Jane", "role": "user" }`

## Queues
- Queues: `email`, `notification`.
- Push email jobs:
```js
import { emailQueue } from "./queues/queues.js";
await emailQueue.add("send", { to: "a@b.com", subject: "Hi" });
```
- Push notification jobs (socket dispatch):
```js
import { notificationQueue } from "./queues/queues.js";
await notificationQueue.add("dispatch", { userId: "123", channel: "notification", payload: { msg: "Hello" } });
```

## Email (Nodemailer)
- Configure SMTP in `.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`, `EMAIL_FROM`).
- Use `sendMail` directly or enqueue via `email` queue.

## Realtime Notifications (Socket.io)
- Clients connect to the same host (HTTP server) via Socket.io.
- Provide `userId` in connection query; server joins a room keyed by that user.
- Notifications worker emits to the user room: `io.to(userId).emit(channel, payload)`.
- Example client:
```js
import { io } from "socket.io-client";
const socket = io("http://localhost:4000", { query: { userId: "123" } });
socket.on("notification", (data) => console.log("notification", data));
```

## Scalability Features

### ✅ Production-Ready Architecture

1. **MongoDB Connection Pooling**
   - Configured connection pool (min: 2, max: 10)
   - Automatic retry logic for reads/writes
   - Connection timeout and error handling

2. **Redis for Horizontal Scaling**
   - Socket.io Redis adapter for multi-instance support
   - BullMQ queues work across multiple server instances
   - Shared state via Redis

3. **Worker Scalability**
   - Workers can run in separate processes (`npm run worker`)
   - Configurable concurrency per worker
   - Rate limiting per queue
   - Graceful shutdown handling

4. **Graceful Shutdown**
   - Proper cleanup of HTTP server, Socket.io, workers, Redis, and MongoDB
   - Handles SIGINT/SIGTERM signals
   - Unhandled rejection/exception handling

5. **Modular Structure**
   - Feature-based modules (`src/modules/`)
   - Separation of concerns (controllers, routes, schemas, models)
   - Reusable services and utilities

### Running Workers Separately

For better scalability, run workers in separate processes:

```bash
# Development
npm run worker:dev

# Production
npm run worker
```

This allows you to:
- Scale HTTP servers independently from workers
- Run multiple worker instances for high throughput
- Isolate worker failures from HTTP server

### Horizontal Scaling

1. **Multiple HTTP Instances**: Run multiple `npm start` processes behind a load balancer
2. **Multiple Worker Instances**: Run multiple `npm run worker` processes
3. **Socket.io**: Uses Redis adapter, so sockets work across all instances
4. **Queues**: BullMQ distributes jobs across all worker instances

## Notes
- Global error handler formats Zod, Mongoose validation, cast, and duplicate key errors.
- Responses standardized via `apiResponse`.
- CORS configured via `CORS_ORIGINS` env variable.
- All environment variables loaded via Node.js `--env-file` flag (no dotenv needed).


