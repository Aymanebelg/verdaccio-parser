import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import JSONSchemadata from '../../models/Schemas/JSONSchema'
import jsonSchemaModelService from '../../services/jsonSchemaModelService'

const mongoServer = new MongoMemoryServer()
beforeAll(async () => {
  await Promise.resolve(mongoServer.start())
  const mongoUri = await Promise.resolve(mongoServer.getUri())

  await mongoose.connect(mongoUri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})
describe('JSONSchemaService', () => {
  afterEach(async () => {
    await JSONSchemadata.deleteMany({})
  })

  describe('create', () => {
    it('should create a new JSON schema', async () => {
      const schemaData = { schema: { type: 'object' } }
      const createdSchema = await jsonSchemaModelService.create(schemaData)

      expect(createdSchema).toBeDefined()
      expect(createdSchema.schema).toEqual(schemaData.schema)
    })

    it('should throw conflict error if schema already exists', async () => {
      const schemaData = { schema: { type: 'object' } }
      await jsonSchemaModelService.create(schemaData)

      // Attempt to create the same schema again
      await expect(jsonSchemaModelService.create(schemaData)).rejects.toThrow()
    })
  })

  describe('findById', () => {
    it('should find a schema by ID', async () => {
      const schemaData = { schema: { type: 'object' } }
      const createdSchema = await JSONSchemadata.create(schemaData)
      const foundSchema = await jsonSchemaModelService.findById(createdSchema._id.toString())
      expect(foundSchema).not.toBeNull()

      // Check if foundSchema._id is defined and equal to createdSchema._id
      if (foundSchema) {
        expect(foundSchema._id).toEqual(createdSchema._id)
      } else {
        // If foundSchema is null, fail the test with an error message
        fail('findById should find a schema by ID, but no schema was found')
      }
    })

    it('should return null if schema is not found', async () => {
      // Create a new ObjectId
      const validObjectId = new mongoose.Types.ObjectId()

      // Attempt to find a schema with a non-existent ID
      const foundSchema = await jsonSchemaModelService.findById(validObjectId.toString())

      // Check if foundSchema is null
      expect(foundSchema).toBeNull()
    })
  })

  describe('update', () => {
    it('should update a schema by ID', async () => {
      // Create a schema
      const schemaData = { schema: { type: 'object' } }
      const createdSchema = await JSONSchemadata.create(schemaData)

      // Update the schema
      const updatedSchemaData = { schema: { type: 'updated_object' } }
      await jsonSchemaModelService.update(createdSchema._id.toString(), updatedSchemaData)

      // Check if the schema has been updated
      const updatedSchema = await JSONSchemadata.findById(createdSchema._id)
      expect(updatedSchema?.schema).toEqual(updatedSchemaData.schema)
    })

    it('should throw error if schema is not found for update', async () => {
      // Attempt to update a nonexistent schema
      const nonExistentId = 'nonexistent_id'
      const updatedSchemaData = { schema: { type: 'updated_object' } }

      await expect(jsonSchemaModelService.update(nonExistentId, updatedSchemaData)).rejects.toThrow()
    })

    it('should throw error if trying to update to an existing schema', async () => {
      const schemaData1 = { schema: { type: 'object' } }
      const createdSchema1 = await JSONSchemadata.create(schemaData1)
      const schemaData2 = { schema: { type: 'updated_object' } }
      await JSONSchemadata.create(schemaData2)

      await expect(jsonSchemaModelService.update(createdSchema1._id.toString(), schemaData2)).rejects.toThrow()
    })

    it('should update an existing schema with different schema', async () => {
      // Create a schema
      const schemaData = { schema: { type: 'object' } }
      const createdSchema = await JSONSchemadata.create(schemaData)

      // Mock the updated schema data with a different schema
      const updatedSchemaData = { schema: { type: 'updated_object' } }

      // Call the update method
      await jsonSchemaModelService.update(createdSchema._id.toString(), updatedSchemaData)

      // Retrieve the updated schema
      const updatedSchema = await JSONSchemadata.findById(createdSchema._id)

      // Assert that the schema has been updated with the new schema data
      expect(updatedSchema?.schema).toEqual(updatedSchemaData.schema)
    })
  })

  describe('delete', () => {
    it('should delete a schema by ID', async () => {
      // Create a schema
      const schemaData = { schema: { type: 'object' } }
      const createdSchema = await JSONSchemadata.create(schemaData)

      // Delete the schema
      await jsonSchemaModelService.delete(createdSchema._id.toString())

      // Check if the schema has been deleted
      const foundSchema = await JSONSchemadata.findById(createdSchema._id)
      expect(foundSchema).toBeNull()
    })

    it('should throw error if schema is not found for delete', async () => {
      // Attempt to delete a nonexistent schema
      const nonExistentId = 'nonexistent_id'
      await expect(jsonSchemaModelService.delete(nonExistentId)).rejects.toThrow()
    })
  })

  describe('getAll', () => {
    it('should get all schemas', async () => {
      // Create some schemas
      const schemaData1 = { schema: { type: 'object' } }
      const schemaData2 = { schema: { type: 'array' } }
      await JSONSchemadata.create(schemaData1)
      await JSONSchemadata.create(schemaData2)

      // Get all schemas
      const allSchemas = await jsonSchemaModelService.getAll()

      // Check if all schemas are retrieved
      expect(allSchemas).toHaveLength(2)
    })
  })
})
