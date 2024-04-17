import { type Document } from 'mongoose'
import type JSONSchema from '../models/JSONSchema'
import JSONSchemadata from '../models/Schemas/JSONSchema'
import ApiError from '../utils/ApiError'
import { ErrorType } from '../utils/messagesTypes'
import StatusCode from '../utils/StatusCode'
import _isEqual from 'lodash/isEqual'

class JsonSchemaModelService {
  /**
   * Creates a new JSON schema.
   * @param {JSONSchema} schemaData - JSON schema data to be created
   * @returns {Promise<Document>} - Created JSON schema document
   * @throws {ApiError} - Throws conflict error if a schema with the same content already exists
   */
  async create (schemaData: JSONSchema): Promise<Document> {
    // Check if a schema with the same content already exists
    const existingSchema = await JSONSchemadata.findOne({
      schema: schemaData.schema
    })
    // Conflict Validation
    if (existingSchema) {
      throw new ApiError({
        name: ErrorType.CONFLICTING_SCHEMA,
        status: StatusCode.BAD_REQUEST,
        details: 'Schema with the same content already exists'
      },
      module)
    }
    return await JSONSchemadata.create(schemaData)
  }

  async findById (id: string): Promise<Document | null> {
    return await JSONSchemadata.findById(id)
  }

  /**
   * Updates a JSON schema by ID.
   * @param {string} id - ID of the JSON schema to update
   * @param {Partial<JSONSchema>} update - Partial JSON schema data for update
   * @returns {Promise<Document | null>} - Updated JSON schema document, or null if not found
   * @throws {ApiError} - Throws error if schema not found, or if there is a conflict with existing schemas
   */
  async update (id: string, update: Partial<JSONSchema>): Promise<Document | null> {
    const existingSchema = await JSONSchemadata.findById(id)
    if (!existingSchema) {
      throw new ApiError({
        name: ErrorType.SCHEMA_NOT_FOUND,
        status: StatusCode.NOT_FOUND,
        details: `Schema not found for ID: ${id}`
      }
      , module)
    }
    // Check if the provided schema conflicts with existing ones
    if (update.schema) {
      // Check if the provided schema is the same as the existing schema
      if (_isEqual(update.schema, existingSchema.schema)) {
        // If the schemas are equal, return that there's nothing to be updated
        throw new ApiError({
          name: ErrorType.NOTHING_TOBE_UPDATED,
          status: StatusCode.BAD_REQUEST,
          details: 'There is nothing to be updated (the same schema)'
        }
        , module)
      }
      // Find any existing schema with the same content but a different ID
      const conflictingSchema = await JSONSchemadata.findOne({
        schema: update.schema,
        _id: { $ne: existingSchema._id } // Exclude the current schema from the search
      })
      // Conflict Validation
      if (conflictingSchema) {
        throw new ApiError({
          name: ErrorType.CONFLICTING_SCHEMA,
          status: StatusCode.BAD_REQUEST,
          details: 'Updating the schema will cause a conflict with an existing schema with the same schema'
        }
        , module)
      }
    }
    // Update the existing schema and increment version if the schema content has changed
    if (update.schema) {
      existingSchema.schema = update.schema
      existingSchema.version += 1 // Increment version
    }
    return await existingSchema.save()
  }

  async delete (id: string): Promise<Document | null> {
    return await JSONSchemadata.findByIdAndDelete(id)
  }

  async getAll (): Promise<Document[]> {
    return await JSONSchemadata.find({})
  }
}
export default new JsonSchemaModelService()
