import { type Request, type Response, Router } from 'express'
import { handleAsync } from '../middlwares/errorHandler'
import StatusCode from '../utils/StatusCode'
import ApiError from '../utils/ApiError'
import { ErrorType, SuccessType } from '../utils/messagesTypes'
import createLogger from 'dev.linkopus.logger'
import type JSONSchema from '../models/JSONSchema'
import { validateBody } from '../validators/bodyValidatorFunction'
import { jsonValidationSchema } from '../validators/jsonSchemaValidatorFunction'
import jsonSchemaModelService from '../services/jsonSchemaModelService'
import JSONSchemadata from '../models/Schemas/JSONSchema'

const logger = createLogger(module)
const router = Router()

/**
 * POST endpoint to create a JSON schema.
 * Validates request body against a JSON schema validator before creation.
 * @route POST /api/schemas
 * @group JSON Schemas - Operations related to JSON schemas
 * @param {JSONSchema} request.body.required - JSON schema object to be created
 * @returns {JSONSchema} 201 - JSON schema object created successfully
 * @throws {ApiError} 400 - Invalid input error
 */
router.post('/', handleAsync(async (req: Request, res: Response) => {
  const bodyValidationResult = validateBody(req.body, jsonValidationSchema)
  if (bodyValidationResult.length !== 0) {
    throw new ApiError({ name: ErrorType.INVALID_INPUT_ERROR, status: StatusCode.BAD_REQUEST, details: bodyValidationResult }, module)
  }
  const createdSchema = await jsonSchemaModelService.create(req.body as JSONSchema)
  logger.info(`Schema created successfully for id ${createdSchema.id}`)
  res.status(StatusCode.CREATED).json({ message: SuccessType.SCHEMA_CREATED_SUCCESSFULLY, data: createdSchema })
}))

/**
 * PUT endpoint to update a JSON schema by ID.
 * Validates request body against a JSON schema validator before update.
 *
 * @route PUT /api/schemas/{id}
 * @group JSON Schemas - Operations related to JSON schemas
 * @param {string} id.path.required - ID of the JSON schema to update
 * @param {JSONSchema} request.body.required - JSON schema object with updated data
 * @returns {JSONSchema} 200 - Updated JSON schema object
 * @throws {ApiError} 400 - Invalid input error
 * @throws {ApiError} 404 - Schema not found error
 */
router.put('/:id', handleAsync(async (req: Request, res: Response) => {
  const bodyValidationResult = validateBody(req.body, jsonValidationSchema)
  if (bodyValidationResult.length !== 0) {
    throw new ApiError({ name: ErrorType.INVALID_INPUT_ERROR, status: StatusCode.BAD_REQUEST, details: bodyValidationResult }, module)
  }
  const schemaId = req.params.id
  const updatedSchema = await jsonSchemaModelService.update(schemaId, req.body as Partial<JSONSchema>)
  if (!updatedSchema) {
    throw new ApiError({ name: ErrorType.SCHEMA_NOT_FOUND, status: StatusCode.NOT_FOUND, details: `Schema not found for ID: ${req.params.id}` }, module)
  }
  logger.info(`Updated JSON schema by ID: ${schemaId}`)
  res.status(StatusCode.OK).json({ message: SuccessType.SCHEMA_UPDATED_SUCCESSFULLY, data: updatedSchema })
}))

router.get('/', handleAsync(async (req: Request, res: Response) => {
  const schemas = await jsonSchemaModelService.getAll()
  logger.info('Retrieved all schemas.')
  res.status(StatusCode.OK).json(schemas)
}))
router.get('/:id', handleAsync(async (req: Request, res: Response) => {
  const schema = await jsonSchemaModelService.findById(req.params.id)
  if (!schema) {
    throw new ApiError({ name: ErrorType.SCHEMA_NOT_FOUND, status: StatusCode.NOT_FOUND, details: `Schema not found for ID: ${req.params.id}` }, module)
  }
  logger.info(`Retrieved user by id: ${req.params.id}`)
  res.status(StatusCode.OK).json(schema)
}))

router.delete('/:id', handleAsync(async (req: Request, res: Response) => {
  const schemaId = req.params.id
  const deletedSchema = await jsonSchemaModelService.delete(schemaId)

  if (!deletedSchema) {
    res.status(StatusCode.NOT_FOUND).json({
      error: {
        details: `Schema not found for ID: ${schemaId}`,
        name: ErrorType.SCHEMA_NOT_FOUND
      }
    })
  } else {
    logger.info(`Deleted JSON schema by ID: ${schemaId}`)
    res.status(StatusCode.OK).json({ message: SuccessType.SCHEMA_DELETED_SUCCESSFULLY })
  }
}))

// For AssessmentService :
// Define the endpoint to get skills by schema ID
router.get('/skills/:id', handleAsync(async (req: Request, res: Response) => {
  const schemaId = req.params.id
  const schema = await JSONSchemadata.findById(schemaId)
  if (!schema) {
    return res.status(StatusCode.NOT_FOUND).json({
      error: {
        details: `Schema not found for ID: ${schemaId}`,
        name: ErrorType.SCHEMA_NOT_FOUND
      }
    })
  }
  // Extract skills from the schema if it exists, otherwise return a message
  const skills = schema.schema.skills
  if (!skills || skills.length === 0) {
    return res.status(StatusCode.NOT_FOUND).json({
      error: {
        details: 'Skills not found in the schema',
        name: ErrorType.SKILLS_NOT_FOUND
      }
    })
  } return res.status(StatusCode.OK).json({ skills })
}))

export default router
