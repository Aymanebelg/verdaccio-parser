import PdfParserService from '../../services/pdfParseService'
import PdfParse from 'pdf-parse'
import axios from 'axios'
import ApiError from '../../utils/ApiError'
import jsonSchemaModelService from '../../services/jsonSchemaModelService'
jest.mock('axios')
jest.mock('pdf-parse', () => jest.fn())
jest.mock('../../services/jsonSchemaModelService')

describe('PdfParserService', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('parsePDF', () => {
    it('should parse single PDF file correctly', async () => {
      const mockPdfData = {
        text: 'Mocked PDF content'
      }
      const mockFile = {
        originalname: 'mockedFile.pdf',
        buffer: Buffer.from('dummy buffer')
      };

      (PdfParse as jest.Mock).mockResolvedValue(mockPdfData)

      const parsedData = await PdfParserService.parsePDF(mockFile as Express.Multer.File)

      expect(parsedData.fileName).toBe(mockFile.originalname)
      expect(parsedData.text).toBe(mockPdfData.text)
    })

    it('should throw an error if parsing a single PDF file fails', async () => {
      const mockFile = {
        originalname: 'mockedFile.pdf',
        buffer: Buffer.from('dummy buffer')
      };

      (PdfParse as jest.Mock).mockRejectedValue(new Error('Mocked error message'))

      await expect(PdfParserService.parsePDF(mockFile as Express.Multer.File)).rejects.toThrow(ApiError)
    })

    it('should handle empty or undefined file', async () => {
      // Pass an empty file object with undefined properties
      const emptyFile: Express.Multer.File = { originalname: undefined as any, buffer: Buffer.from('') } as unknown as Express.Multer.File
      await expect(PdfParserService.parsePDF(emptyFile)).rejects.toThrow(ApiError)
    })

    it('should handle large PDF file', async () => {
      const largeBuffer = Buffer.alloc(1024 * 1024 * 10)
      const mockFile = {
        originalname: 'largeFile.pdf',
        buffer: largeBuffer
      };

      (PdfParse as jest.Mock).mockResolvedValue({ text: 'Mocked PDF content' })

      const parsedData = await PdfParserService.parsePDF(mockFile as Express.Multer.File)

      expect(parsedData.fileName).toBe(mockFile.originalname)
      expect(parsedData.text).toBeDefined()
    })

    it('should handle invalid PDF file', async () => {
      const mockFile = {
        originalname: 'invalidFile.txt',
        buffer: Buffer.from('dummy buffer')
      };

      (PdfParse as jest.Mock).mockRejectedValue(new Error('Invalid PDF format'))

      await expect(PdfParserService.parsePDF(mockFile as Express.Multer.File)).rejects.toThrow(ApiError)
    })
  })

  describe('handleFileUpload', () => {
    it('should handle file upload and return created records', async () => {
      const mockFiles = [
        { originalname: 'file1.pdf', buffer: Buffer.from('dummy buffer 1') },
        { originalname: 'file2.pdf', buffer: Buffer.from('dummy buffer 2') }
      ]
      const mockParsedData = { text: 'Mocked parsed data' }
      const mockResponseData = { schema: 'Mocked response data' }
      const mockCreatedRecord = { id: 'mockedId', ...mockResponseData };

      (PdfParse as jest.Mock).mockResolvedValue(mockParsedData);
      (axios.post as jest.Mock).mockResolvedValue({ data: { response: { data: JSON.stringify(mockResponseData) } } });
      (jsonSchemaModelService.create as jest.Mock).mockResolvedValue(mockCreatedRecord)

      const createdRecords = await PdfParserService.handleFileUpload(mockFiles as Express.Multer.File[])

      expect(PdfParse).toHaveBeenCalledTimes(mockFiles.length)
      expect((axios as any).post).toHaveBeenCalledTimes(mockFiles.length)
      expect((jsonSchemaModelService as any).create).toHaveBeenCalledTimes(mockFiles.length)

      expect(createdRecords).toHaveLength(mockFiles.length)
      expect(createdRecords[0]).toEqual(mockCreatedRecord)
      expect(createdRecords[1]).toEqual(mockCreatedRecord)
    })

    it('should throw an error if any step fails', async () => {
      const mockFiles = [{ originalname: 'file1.pdf', buffer: Buffer.from('dummy buffer 1') }]
      const errorMessage = 'Mocked error message';

      (PdfParse as jest.Mock).mockRejectedValue(new Error(errorMessage))

      await expect(PdfParserService.handleFileUpload(mockFiles as Express.Multer.File[])).rejects.toThrow(ApiError)
      expect((axios as any).post).not.toHaveBeenCalled()
      expect((jsonSchemaModelService as any).create).not.toHaveBeenCalled()
    })

    it('should handle empty file array gracefully', async () => {
      const mockFiles: Express.Multer.File[] = []

      await expect(PdfParserService.handleFileUpload(mockFiles)).resolves.toEqual([])
      expect(PdfParse).not.toHaveBeenCalled()
      expect((axios as any).post).not.toHaveBeenCalled()
      expect((jsonSchemaModelService as any).create).not.toHaveBeenCalled()
    })
    it('should handle large files correctly', async () => {
      const largeFileBuffer = Buffer.alloc(5 * 1024 * 1024, 'dummy buffer')

      // Mock a large file
      const mockLargeFile = {
        originalname: 'largeFile.pdf',
        buffer: largeFileBuffer
      }
      const mockParsedData = { text: 'Mocked parsed data' }
      const mockResponseData = { schema: 'Mocked response data' }
      const mockCreatedRecord = { id: 'mockedId', ...mockResponseData };
      (PdfParse as jest.Mock).mockResolvedValue(mockParsedData);
      (axios.post as jest.Mock).mockResolvedValue({ data: { response: { data: JSON.stringify(mockResponseData) } } });
      (jsonSchemaModelService.create as jest.Mock).mockResolvedValue(mockCreatedRecord)
      const createdRecords = await PdfParserService.handleFileUpload([mockLargeFile] as Express.Multer.File[])
      expect(PdfParse).toHaveBeenCalledTimes(1)
      expect((axios as any).post).toHaveBeenCalledTimes(1)
      expect((jsonSchemaModelService as any).create).toHaveBeenCalledTimes(1)
      expect(createdRecords).toHaveLength(1)
      expect(createdRecords[0]).toEqual(mockCreatedRecord)
    })
  })
})

describe('communicate with IA ms (sendToAIMsAndStore)', () => {
  it('should send parsed data to microservice and return response', async () => {
    const mockParsedData = 'Mocked parsed data'
    const mockResponseData = { schema: 'Mocked response data' };
    (axios.post as jest.Mock).mockResolvedValue({ data: { response: { data: JSON.stringify(mockResponseData) } } })
    const responseData = await PdfParserService.sendToAIMsAndStore(mockParsedData)
    expect(responseData).toEqual(mockResponseData)
  })

  it('should throw an error if communication with microservice fails', async () => {
    const mockParsedData = 'Mocked parsed data';
    (axios.post as jest.Mock).mockRejectedValue(new Error('Mocked error message'))
    await expect(PdfParserService.sendToAIMsAndStore(mockParsedData)).rejects.toThrow(ApiError)
  })
  it('should handle invalid input data', async () => {
    const mockParsedData: any = undefined

    await expect(PdfParserService.sendToAIMsAndStore(mockParsedData as string)).rejects.toThrow(ApiError)
  })

  it('should handle empty response from microservice', async () => {
    const mockParsedData = 'Mocked parsed data';

    (axios.post as jest.Mock).mockResolvedValue({ data: {} })

    await expect(PdfParserService.sendToAIMsAndStore(mockParsedData)).rejects.toThrow(ApiError)
  })

  it('should handle unexpected response format from microservice', async () => {
    const mockParsedData = 'Mocked parsed data';

    (axios.post as jest.Mock).mockResolvedValue({ data: { response: 'Invalid format' } })

    await expect(PdfParserService.sendToAIMsAndStore(mockParsedData)).rejects.toThrow(ApiError)
  })
})
