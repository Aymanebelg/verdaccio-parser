import { type NextFunction, type Request, type Response } from 'express'
import createLogger from 'dev.linkopus.logger'
import ApiError, { getErrorFilePath } from '../utils/ApiError'
import { ErrorType } from '../utils/messagesTypes'
import StatusCode from '../utils/StatusCode'

const routeNotFoundHandlerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const err = new ApiError({ status: StatusCode.NOT_FOUND, name: ErrorType.ROUTE_NOT_FOUND, details: `Can't find ${req.originalUrl} on the server!` }, module)
  next(err)
}
export const handleAsync = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

const errorHandlerMiddleware = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  if (error instanceof ApiError) {
    const { status, ...errorBody } = error.errorBody
    res.status(status).json({ error: errorBody })
  } else {
    const errorBody = { status: StatusCode.INTERNAL_SERVER_ERROR, name: ErrorType.UNEXPECTED_ERROR, details: error.message }
    createLogger(undefined, getErrorFilePath(error)).error(`${errorBody.status} ${errorBody.name} ${errorBody.details}`)
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: { name: ErrorType.UNEXPECTED_ERROR, details: error.message } })
  }
}

export { errorHandlerMiddleware, routeNotFoundHandlerMiddleware }
