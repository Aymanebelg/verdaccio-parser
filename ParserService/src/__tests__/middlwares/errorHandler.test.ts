import { type Request, type Response, type NextFunction } from 'express'
import ApiError from '../../utils/ApiError'
import StatusCode from '../../utils/StatusCode'
import { errorHandlerMiddleware, handleAsync } from '../../middlwares/errorHandler'

const mockRequest = {} as unknown as Request
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
} as unknown as Response
const mockNext = jest.fn() as NextFunction

describe('errorHandlerMiddleware', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should handle ApiError correctly', () => {
    const testError = new ApiError({ name: 'testError', status: StatusCode.NOT_FOUND }, module, '/src/_tests')

    errorHandlerMiddleware(testError, mockRequest, mockResponse, mockNext)

    expect((mockResponse as any).status).toHaveBeenCalledWith(StatusCode.NOT_FOUND)
    expect(mockResponse.json).toHaveBeenCalledWith({ error: { name: 'testError' } })
  })

  it('should handle non-ApiError errors correctly', () => {
    const testError = new Error('Test error message')

    errorHandlerMiddleware(testError, mockRequest, mockResponse, mockNext)

    expect((mockResponse as any).status).toHaveBeenCalledWith(StatusCode.INTERNAL_SERVER_ERROR)
    expect(mockResponse.json).toHaveBeenCalledWith({ error: { name: 'UNEXPECTED_ERROR', details: 'Test error message' } })
  })

  it('should call next with error if async function throws an error', async () => {
    const asyncFunction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      throw new Error('Test error')
    }

    await expect(asyncFunction(mockRequest, mockResponse, mockNext)).rejects.toThrow('Test error')

    const makeAsync = async (): Promise<void> => { handleAsync(asyncFunction)(mockRequest, mockResponse, mockNext) }
    await makeAsync()

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
  })

  it('should call next with no error if async function executes successfully', async () => {
    const asyncFunction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await Promise.resolve()
    }

    handleAsync(asyncFunction)(mockRequest, mockResponse, mockNext)

    expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error))
  })

  it('should call the provided function with req, res, and next', async () => {
    // Create a mock async function
    const asyncFn = jest.fn().mockResolvedValue(undefined)

    // Call handleAsync with the async function
    const wrappedFn = handleAsync(asyncFn)
    wrappedFn(mockRequest, mockResponse, mockNext)

    // Expect the provided function to be called with req, res, and next
    expect(asyncFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext)
  })
})
