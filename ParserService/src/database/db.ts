import mongoose from 'mongoose'
import config from '../config/config'

import createLogger from '../utils/Logger'
const logger = createLogger(module)

const connectDB = async (): Promise<void> => {
  logger.info('Connecting to MongoDB ...')
  try {
    await mongoose.connect(config.mongodbUri)
    logger.info('MongoDB connected')
  } catch (error) {
    logger.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

export default connectDB
