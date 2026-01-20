export const config = {
   port: process.env.PORT || 8000,
   nodeEnv: process.env.NODE_ENV || "development",

   mongo: {
     uri: process.env.MONGODB_URI,
     dbName: process.env.DATABASE_NAME || "hostel-saas",
   },

   jwt: {
     secret: process.env.JWT_SECRET,
     expiresIn: process.env.JWT_EXPIRES_IN || "7d",
   },

   redis: {
     host: process.env.REDIS_HOST,
     port: Number(process.env.REDIS_PORT),
     password: process.env.REDIS_PASSWORD,
     url: process.env.REDIS_URL,
   },

   smtp: {
     host: process.env.SMTP_HOST,
     port: process.env.SMTP_PORT,
     user: process.env.SMTP_USER,
     pass: process.env.SMTP_PASS,
   },
   emailFrom: process.env.EMAIL_FROM,

   cors: {
     origins: process.env.CORS_ORIGINS
       ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
       : ["http://localhost:3000", "http://localhost:3001"],
  },

  // Add other sections as needed (logging, stripe, etc.)
};