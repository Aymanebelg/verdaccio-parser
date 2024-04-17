import PdfParse from 'pdf-parse'
import StatusCode from '../utils/StatusCode'
import { ErrorType } from '../utils/messagesTypes'
import ApiError from '../utils/ApiError'
import axios from 'axios'
import jsonSchemaModelService from './jsonSchemaModelService'
import type JSONSchema from '../models/JSONSchema'
import config from '../config/config'

interface PdfData {
  fileName: string
  text: string
}
class PdfParserService {
  async parsePDF (file: Express.Multer.File): Promise<PdfData> {
    try {
      // Extract text from PDF file
      const pdfData = await PdfParse(file.buffer)
      const text = pdfData.text
      // Return parsed data
      return { fileName: file.originalname, text }
    } catch (error) {
      throw new ApiError({
        name: ErrorType.ERROR_PARSING_PDF_FILE,
        status: StatusCode.INTERNAL_SERVER_ERROR,
        details: `Error parsing PDF file ${file.originalname}: ${(error as Error).message}`
      }, module)
    }
  }

  async sendToAIMsAndStore (parsedData: string): Promise<any> {
    try {
      // Send parsed text to microservice IA
      const response = await axios.post(config.aiMicroserviceUrl, {
        command: 'PARSE_TEXT_CV',
        apiKey: 'parserMS',
        textInput: parsedData
      })
      const responseData = JSON.parse(response.data.response.data as string)
      return responseData
    } catch (error) {
      throw new ApiError({
        name: ErrorType.AI_MICROSERVICE_ERROR,
        status: StatusCode.INTERNAL_SERVER_ERROR,
        details: `Error communicating with microservice: ${(error as Error).message}`
      }, module)
    }
  }

  async handleFileUpload (files: Express.Multer.File[]): Promise<any[]> {
    const responseSchemas: any[] = []
    for (const file of files) {
      const parsedData = await this.parsePDF(file)
      const responseData = await this.sendToAIMsAndStore(parsedData.text)
      responseSchemas.push({ schema: responseData })
    }
    const createdRecords: any[] = []
    for (const responseSchema of responseSchemas) {
      const createdRecord = await jsonSchemaModelService.create(responseSchema as JSONSchema)
      createdRecords.push(createdRecord)
    }
    return createdRecords
  }
}
export default new PdfParserService()
