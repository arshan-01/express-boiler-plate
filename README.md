# Express Boilerplate - Production-Ready Starter Template

A comprehensive, production-ready Express.js boilerplate with MongoDB, Redis, BullMQ, comprehensive security, API versioning, caching, rate limiting, file handling, monitoring, and more.

## 🚀 Features

### Core Infrastructure
- ✅ **Environment Validation** - Zod schema validation on startup
- ✅ **Logging** - Pino logger with request ID injection
- ✅ **Database Connections** - MongoDB with pooling, Redis singleton
- ✅ **Error Handling** - Global error handler with contextual logging
- ✅ **Security Middleware** - Helmet, CORS, mongo-sanitize, HPP
- ✅ **Request Utilities** - Request ID, async handler, request context
- ✅ **Graceful Shutdown** - Proper cleanup on SIGTERM/SIGINT

### Advanced Features
- ✅ **API Versioning** - Versioned routes with deprecation headers
- ✅ **Rate Limiting** - Redis-backed rate limiting (IP, per-user, feature-based)
- ✅ **Caching Layer** - Redis caching utilities and middleware
- ✅ **Pagination & Filtering** - Built-in pagination, sorting, filtering helpers
- ✅ **File Handling** - File uploads with validation and storage abstraction
- ✅ **Database Migrations** - Migration system and seed scripts
- ✅ **Monitoring & Metrics** - Prometheus metrics endpoint
- ✅ **Security Enhancements** - API key auth, IP whitelisting, CSRF protection
- ✅ **Development Tools** - Debug endpoints, seeding utilities

## 📦 Stack

- **Runtime**: Node.js (ESM)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Cache/Queue**: Redis (ioredis)
- **Job Queue**: BullMQ
- **Validation**: Zod
- **Logging**: Pino
- **Real-time**: Socket.io with Redis adapter

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp env.example .env
```

Edit `.env` with your configuration:
- MongoDB connection string
- Redis connection details
- JWT secret
- SMTP settings (optional)
- CORS origins

### 3. Run Migrations (Optional)

```bash
npm run migrate
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── config/              # Configuration files
│   ├── env.js           # Validated config object
│   ├── env.schema.js    # Zod environment schema
│   ├── logger.js        # Pino logger with request ID
│   ├── mongo.js         # MongoDB connection
│   └── redis.js         # Redis singleton
├── middlewares/         # Express middlewares
│   ├── apiVersioning.js # API versioning
│   ├── auth.js         # Authentication (API key, IP whitelist, CSRF)
│   ├── errorHandler.js # Global error handler
│   ├── rateLimiter.js  # Rate limiting
│   ├── requestId.js    # Request ID injection
│   ├── security.js     # Security middleware
│   ├── throttle.js     # Per-user throttling & quotas
│   ├── upload.js        # File upload middleware
│   └── validate.js      # Request validation
├── modules/            # Feature modules
│   ├── health/         # Health check endpoint
│   ├── metrics/        # Metrics endpoints
│   └── debug/          # Debug endpoints (dev only)
├── routes/             # Route organization
│   ├── index.js        # Main API router
│   └── v1/             # Version 1 routes
├── utils/              # Utility functions
│   ├── apiResponse.js  # Response helpers
│   ├── appError.js     # Custom error class
│   ├── asyncHandler.js # Async wrapper
│   ├── cache.js        # Caching utilities
│   ├── metrics.js      # Metrics collection
│   ├── pagination.js   # Pagination helpers
│   └── storage.js      # File storage abstraction
├── db/                 # Database utilities
│   ├── migrations/     # Migration system
│   └── seeds/          # Seed scripts
├── queues/             # BullMQ queues
├── services/           # Business logic services
├── realtime/           # Socket.io setup
├── app.js              # Express app configuration
└── server.js           # Server bootstrap
```

## 🔌 API Endpoints

### Health & Monitoring

- `GET /` - Basic health check
- `GET /api/v1/health` - Detailed health check (DB, Redis status)
- `GET /api/v1/metrics/prometheus` - Prometheus metrics
- `GET /api/v1/metrics/json` - JSON metrics
- `GET /api/v1/debug/*` - Debug endpoints (development only)

### API Versioning

The API supports versioning via:
- Path: `/api/v1/users`
- Query parameter: `/api/users?version=1`
- Accept header: `Accept: application/vnd.api+json;version=1`

Default routes (without version) map to v1 for backward compatibility.

## 🔐 Security Features

### Built-in Security

- **Helmet** - Security headers
- **CORS** - Configurable origins
- **mongo-sanitize** - NoSQL injection prevention
- **HPP** - HTTP Parameter Pollution prevention
- **Rate Limiting** - Redis-backed, configurable per route
- **Request ID** - Request tracking and correlation

### Additional Security Middleware

```javascript
import { apiKeyAuth, ipWhitelist, csrfProtection } from "./middlewares/auth.js";

// API Key authentication
app.use("/api/admin", apiKeyAuth(async (key) => {
  // Validate API key
  return await validateApiKey(key);
}));

// IP whitelisting
app.use("/api/internal", ipWhitelist(["127.0.0.1", "10.0.0.0/8"]));

// CSRF protection
app.use(csrfProtection(async (token, req) => {
  // Validate CSRF token
  return await validateCsrfToken(token, req);
}));
```

## 📊 Rate Limiting

### IP-based Rate Limiting

```javascript
import { apiLimiter, authLimiter } from "./middlewares/rateLimiter.js";

app.use("/api", apiLimiter); // 100 requests per 15 minutes
app.use("/api/auth", authLimiter); // 5 requests per 15 minutes
```

### Per-User Rate Limiting

```javascript
import { perUserLimiter } from "./middlewares/throttle.js";

app.use("/api/users", perUserLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
```

### Feature-based Quotas

```javascript
import { featureQuotaLimiter, usageTracker } from "./middlewares/throttle.js";

app.post("/api/upload",
  featureQuotaLimiter("file-uploads", { max: 10, windowMs: 3600000 }),
  usageTracker("file-uploads"),
  uploadSingle("file"),
  handler
);
```

## 💾 Caching

### Cache Utilities

```javascript
import { getCache, setCache, deleteCache, cacheMiddleware } from "./utils/cache.js";

// Manual caching
await setCache("user:123", userData, 3600); // TTL: 1 hour
const user = await getCache("user:123");
await deleteCache("user:123");

// Cache middleware
app.get("/api/users/:id",
  cacheMiddleware({ ttl: 300, keyGenerator: (req) => `user:${req.params.id}` }),
  handler
);
```

## 📄 Pagination & Filtering

```javascript
import { parsePagination, parseSorting, parseFiltering, paginatedResponse } from "./utils/pagination.js";

// In your route handler
const pagination = parsePagination(req.query);
const sort = parseSorting(req.query, ["name", "email", "createdAt"]);
const filter = parseFiltering(req.query, {
  searchFields: ["name", "email"]
});

const [data, total] = await Promise.all([
  User.find(filter).sort(sort).skip(pagination.offset).limit(pagination.limit),
  User.countDocuments(filter)
]);

return paginatedResponse(res, data, total, pagination);
```

## 📤 File Uploads

### Basic Upload

```javascript
import { uploadSingle, fileUploadValidator } from "./middlewares/upload.js";
import { storage } from "./utils/storage.js";

app.post("/api/upload",
  uploadSingle("file", {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png"]
  }),
  fileUploadValidator({
    maxSize: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png"]
  }),
  async (req, res) => {
    const filename = generateFilename(req.file.originalname);
    await storage.save(req.file, filename);
    ok(res, { url: storage.getUrl(filename) }, "File uploaded");
  }
);
```

## 🔄 Database Migrations

### Create Migration

Add to `src/db/migrations/migrations.js`:

```javascript
{
  name: "002-add-user-indexes",
  up: async () => {
    const db = mongoose.connection.db;
    await db.collection("users").createIndex({ email: 1 });
  }
}
```

### Run Migrations

```bash
npm run migrate
```

## 🌱 Database Seeding

### Create Seed

Add to `src/db/seeds/seeds.js`:

```javascript
{
  name: "sample-data",
  run: async () => {
    // Insert seed data
  },
  clear: async () => {
    // Clear seed data
  }
}
```

### Run Seeds

```bash
npm run seed
```

## 📈 Monitoring & Metrics

### Prometheus Metrics

Access metrics at `/api/v1/metrics/prometheus`:

```
http_requests_total{method="GET",status="200",route="/api/users"} 150
http_request_duration_ms_sum{method="GET",route="/api/users"} 4500
http_request_duration_ms_count{method="GET",route="/api/users"} 150
```

### Custom Metrics

```javascript
import { metrics } from "./utils/metrics.js";

// Increment counter
metrics.increment("api_calls", { endpoint: "/users" });

// Set gauge
metrics.setGauge("active_users", 150);

// Record histogram
metrics.recordHistogram("response_time", 250, { endpoint: "/users" });
```

## 🧪 Development Tools

### Debug Endpoints (Development Only)

- `GET /api/v1/debug/info` - Server info (memory, uptime, etc.)
- `GET /api/v1/debug/redis` - Redis connection info
- `GET /api/v1/debug/mongo` - MongoDB connection info

### Scripts

```bash
npm run dev          # Start dev server with watch mode
npm run start        # Start production server
npm run worker       # Start worker process
npm run worker:dev   # Start worker with watch mode
npm run migrate      # Run database migrations
npm run seed         # Seed database
```

## 🔄 Background Jobs

### Using BullMQ

```javascript
import { emailQueue } from "./queues/queues.js";

// Add job
await emailQueue.add("send", {
  to: "user@example.com",
  subject: "Welcome",
  html: "<h1>Welcome!</h1>"
});
```

Workers are automatically started with the server. Run workers separately:

```bash
npm run worker
```

## 📝 Request Validation

### Body Validation

```javascript
import { validateBody } from "./middlewares/validate.js";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1)
});

app.post("/api/users", validateBody(schema), handler);
```

### Query Validation

```javascript
import { validateQuery, querySchemas } from "./middlewares/validate.js";

const schema = querySchemas.pagination.merge(querySchemas.sorting);

app.get("/api/users", validateQuery(schema), handler);
```

## 🎯 Response Helpers

```javascript
import {
  ok, created, noContent, badRequest,
  unauthorized, forbidden, notFound, conflict
} from "./utils/apiResponse.js";

ok(res, data, "Success");
created(res, newUser, "User created");
noContent(res);
badRequest(res, "Invalid input", details);
unauthorized(res, "Authentication required");
forbidden(res, "Access denied");
notFound(res, "Resource not found");
conflict(res, "Email already exists", { email });
```

## 🚀 Production Deployment

### Environment Variables

Ensure all required environment variables are set:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `REDIS_HOST` / `REDIS_URL` - Redis connection
- `NODE_ENV=production` - Production mode

### Scaling

1. **Horizontal Scaling**: Run multiple server instances behind a load balancer
2. **Worker Scaling**: Run multiple worker processes: `npm run worker`
3. **Database**: Use MongoDB replica sets
4. **Cache**: Use Redis cluster for high availability

### Health Checks

Monitor `/api/v1/health` endpoint for service health.

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Zod Documentation](https://zod.dev/)

## 📄 License

MIT

---

**Built with ❤️ for production-ready Express.js applications**
