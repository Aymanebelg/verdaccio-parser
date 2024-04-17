import { type Request, type Response, type NextFunction } from 'express'
import createLogger from 'dev.linkopus.logger'

const logger = createLogger(module)

export const requestLoggerMw = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now()
  logger.info(`Receiving a ${req.method} request on ${req.originalUrl}`)
  next()
  res.on('finish', () => {
    const elapsedTime = (Date.now() - startTime) / 1000
    logger.info(`${req.method} request on ${req.originalUrl} ended with a status of ${res.statusCode} and a delay of (${elapsedTime.toFixed(3)}s)`)
  })
}
