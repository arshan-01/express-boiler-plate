import mongoose from 'mongoose'
import { DB_NAME } from '../constants/constants.js'
import { MONGODB_URI } from './env.config.js'

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`)
    return (`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
  } catch (error) {
    ('MONGODB connection FAILED ', error)
     
    process.exit(1)
  }
}

export default connectDB
