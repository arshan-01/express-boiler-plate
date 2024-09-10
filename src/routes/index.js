// Import all routes here and use them in the app
// routes/index.js
import express from 'express'
import userRoute from './user.route.js'

const router = express.Router()

// Define routes
router.use('/user', userRoute)
// Add other routes here
// router.use('/users', userRoutes);
// router.use('/another', anotherRoutes);

export default router
