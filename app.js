// app.js
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import router from './src/routes/index.js'
import { swaggerServe, swaggerSetup } from './swagger.js' // Adjust the path as needed
import { ApiError } from './src/utils/apiUtils.js'
import { CORS_ORIGIN } from './src/config/env.config.js'

const app = express()

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true
  })
)

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static('public'))
app.use(cookieParser())

app.use('/api/v1', router) // This should match your API route structure
app.use('/api', swaggerServe, swaggerSetup)

// Error handling middleware
 
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      stack: err.stack
    })
  } else {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      stack: err.stack
    })
  }
})

export { app }
