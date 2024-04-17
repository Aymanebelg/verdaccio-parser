import { type Request, type Response, Router } from 'express'
import { handleAsync } from '../middlwares/errorHandler'
import StatusCode from '../utils/StatusCode'
import ApiError from '../utils/ApiError'
import { ErrorType } from '../utils/messagesTypes'
import multer from 'multer'
import config from '../config/config'
import PdfParserService from '../services/pdfParseService'

const router = Router()

const storage = multer.memoryStorage()
// Define a file filter function with explicit return type
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  // Check if the uploaded file's mimetype is PDF
  if (file.mimetype === 'application/pdf') {
    // Accept the file
    cb(null, true)
  } else {
    // Reject the file
    cb(new ApiError({
      name: ErrorType.INVALID_FILE_TYPE_ERROR,
      status: StatusCode.BAD_REQUEST,
      details: 'Only PDF files are allowed'
    }, module))
  }
}
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10 // 10MB
  }
})

router.post('/parsePDF', upload.single('file'), handleAsync(async (req: Request, res: Response) => {
  const file = req.file

  if (!file) {
    return res.status(StatusCode.BAD_REQUEST).json({
      error: {
        details: 'No PDF files were uploaded',
        name: ErrorType.NO_PDF_FILE_WERE_UPLOADED
      }
    })
  }

  const createdRecord = await PdfParserService.handleFileUpload([file])
  return res.status(StatusCode.OK).json(createdRecord)
}))

router.post('/parsePDFs', upload.array('files', config.maxUploadedFiles), handleAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] ?? []

  if (!files.length) {
    return res.status(StatusCode.BAD_REQUEST).json({
      error: {
        details: 'No PDF files were uploaded',
        name: ErrorType.NO_PDF_FILE_WERE_UPLOADED
      }
    })
  }
  const createdRecords = await PdfParserService.handleFileUpload(files)
  return res.status(StatusCode.OK).json(createdRecords)
}))

export default router
