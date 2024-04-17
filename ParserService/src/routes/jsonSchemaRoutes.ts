import { Router } from 'express'
import crudJsonSchemaRoutes from './crudJsonSchemaRoutes'
import parserRoutes from './parserRoutes'

const JsonSchemaRoutes = Router()

JsonSchemaRoutes.use('/', crudJsonSchemaRoutes)
JsonSchemaRoutes.use('/', parserRoutes)

export default JsonSchemaRoutes
