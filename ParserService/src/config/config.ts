import dotenv from 'dotenv'
dotenv.config()

interface Config {
  port: string | number
  mongodbUri: string
  maxUploadedFiles: number
  aiMicroserviceUrl: string

}

const config: Config = {
  port: process.env.PORT ?? 3001,
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/parser',
  maxUploadedFiles: parseInt(process.env.MAX_UPLOADED_FILES ?? '10'),
  aiMicroserviceUrl: process.env.AI_MICROSERVICE_URL ?? 'http://localhost:3001/api/aiService/callCommand'

}

export default config
