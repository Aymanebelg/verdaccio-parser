import request from 'supertest'
import express, { type Express } from 'express'
import bodyParser from 'body-parser'
import jsonSchemaRoutes from '../../routes/jsonSchemaRoutes'
import { errorHandlerMiddleware } from '../../middlwares/errorHandler'
import PdfParserService from '../../services/pdfParseService'

jest.mock('../../services/pdfParseService')
jest.mock('../../services/jsonSchemaModelService')
const app: Express = express()
app.use(bodyParser.json())
app.use(jsonSchemaRoutes)
app.use(errorHandlerMiddleware)

describe('File type', () => {
  it('should return status 400 if file type is invalid', async () => {
    const invalidFile = {
      fieldname: 'file',
      originalname: 'invalid.txt',
      buffer: Buffer.from('invalid file content'),
      mimetype: 'text/plain'
    }

    const response = await request(app)
      .post('/parsePDF')
      .attach('file', invalidFile.buffer, invalidFile.originalname)
      .expect(400)

    expect(response.body.error.name).toBe('INVALID_FILE_TYPE_ERROR')
  })
})

describe('POST /parsePDF', () => {
  it('should return status 400 if no PDF file is uploaded', async () => {
    const response = await request(app)
      .post('/parsePDF')
      .expect(400)
    expect(response.body.error.name).toBe('NO_PDF_FILE_WERE_UPLOADED')
  })
  it('should return status 500 if the uploaded file exceeds the maximum allowed size', async () => {
    const largeFile = {
      fieldname: 'file',
      originalname: 'large.pdf',
      buffer: Buffer.alloc(1024 * 1024 * 10),
      mimetype: 'application/pdf'
    }

    const response = await request(app)
      .post('/parsePDF')
      .attach('file', largeFile.buffer, largeFile.originalname)
    expect(response.status).toBe(500)

    expect(response.body.error).toEqual({ details: 'File too large', name: 'UNEXPECTED_ERROR' })
  })

  it('should return status 200 and created record if PDF file is uploaded and parsed successfully', async () => {
    const mockCreatedRecord = {
      id: 'mockedId',
      fileName: 'mockedFileName',
      text: 'Mocked PDF content'
    };

    (PdfParserService.handleFileUpload as jest.Mock).mockResolvedValue([mockCreatedRecord])

    const response = await request(app)
      .post('/parsePDF')
      .attach('file', Buffer.from('mocked file content'), { filename: 'file1.pdf' })
      .expect(200)

    expect(response.body).toEqual([mockCreatedRecord])
  })

  it('should return status 500 if an error occurs during file parsing or microservice communication', async () => {
    (PdfParserService.handleFileUpload as jest.Mock).mockRejectedValue(new Error('Mocked parsing error'))

    const response = await request(app)
      .post('/parsePDF')
      .attach('files', Buffer.from('mocked file 1 content'), { filename: 'file1.pdf' })
      .expect(500)

    expect(response.body.error.name).toBe('UNEXPECTED_ERROR')
  })
})
describe('POST /parsePDFs', () => {
  it('should return status 200 and parsed data if PDF files are uploaded', async () => {
    const mockParsedDataMultiplePDFs = [
      {
        id: '1',
        fileName: 'file1.pdf',
        text: 'This is a mocked PDF text for file 1'
      },
      {
        id: '2',
        fileName: 'file2.pdf',
        text: 'This is a mocked PDF text for file 2'
      }
    ];

    (PdfParserService.handleFileUpload as jest.Mock).mockResolvedValue(mockParsedDataMultiplePDFs)

    const response = await request(app)
      .post('/parsePDFs')
      .attach('files', Buffer.from('mocked file 1 content'), { filename: 'file1.pdf' })
      .attach('files', Buffer.from('mocked file 2 content'), { filename: 'file2.pdf' })
      .expect(200)

    expect(response.body).toEqual(mockParsedDataMultiplePDFs)
  })

  it('should return status 500 if an error occurs during file parsing or microservice communication', async () => {
    (PdfParserService.handleFileUpload as jest.Mock).mockRejectedValue(new Error('Mocked parsing error'))

    const response = await request(app)
      .post('/parsePDFs')
      .attach('files', Buffer.from('mocked file 1 content'), { filename: 'file1.pdf' })
      .expect(500)

    expect(response.body.error.name).toBe('UNEXPECTED_ERROR')
  })
})
