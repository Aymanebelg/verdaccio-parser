import express from 'express'
import connectDB from './database/db'
import swaggerUi from 'swagger-ui-express'
import * as swaggerDocument from './swagger.json'
import { requestLoggerMw } from './middlwares/requestsLogger'
import { errorHandlerMiddleware, routeNotFoundHandlerMiddleware } from './middlwares/errorHandler'
import config from './config/config'
import dotenv from 'dotenv'
import createLogger from 'dev.linkopus.logger'
import cors from 'cors'
import jsonSchemaRoutes from './routes/jsonSchemaRoutes'

dotenv.config()
const logger = createLogger(module)
const app = express()
app.use(cors())

connectDB().then(() => {
  logger.info('Connected to MongoDB, starting server...')

  app.use(express.json())
  app.use(requestLoggerMw)
  app.use('/schemas', jsonSchemaRoutes)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  app.all('*', routeNotFoundHandlerMiddleware)
  app.use(errorHandlerMiddleware)
  app.listen(config.port, () => { logger.info(`Server running on port ${config.port}`) })
}).catch((error) => {
  logger.error('Failed to connect to MongoDB:', error)
})
