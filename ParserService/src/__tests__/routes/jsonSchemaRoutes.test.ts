import request from 'supertest'
import express, { type Express } from 'express'
import bodyParser from 'body-parser'
import jsonSchemaRoutes from '../../routes/crudJsonSchemaRoutes'
import { ErrorType, SuccessType } from '../../utils/messagesTypes'
import StatusCode from '../../utils/StatusCode'
import jsonSchemaModelService from '../../services/jsonSchemaModelService'
import { errorHandlerMiddleware } from '../../middlwares/errorHandler'
import JSONSchemadata from '../../models/Schemas/JSONSchema'

jest.mock('../../services/jsonSchemaModelService', () => ({
  create: jest.fn(),
  update: jest.fn(),
  getAll: jest.fn(),
  findById: jest.fn(),
  delete: jest.fn()
}))

const app: Express = express()
app.use(bodyParser.json())
app.use(jsonSchemaRoutes)
app.use(errorHandlerMiddleware)

describe('JSON Schema Routes Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new JSON schema via POST', async () => {
    const schemaData = { schema: { type: 'object' } };
    (jsonSchemaModelService.create as jest.Mock).mockResolvedValue(schemaData)
    const response = await request(app).post('/').send(schemaData)
    expect(response.status).toBe(StatusCode.CREATED)
    expect(response.body.message).toBe(SuccessType.SCHEMA_CREATED_SUCCESSFULLY)
  })

  it('should fetch all JSON schemas via GET', async () => {
    const schemaData = [{ schema: { type: 'object' } }];
    (jsonSchemaModelService.getAll as jest.Mock).mockResolvedValue(schemaData)
    const response = await request(app).get('/')
    expect(response.status).toBe(StatusCode.OK)
    expect(response.body).toEqual(schemaData)
  })

  it('should fetch a JSON schema by ID via GET', async () => {
    const schemaData = { _id: 'some_id', schema: { type: 'object' } };
    (jsonSchemaModelService.findById as jest.Mock).mockResolvedValue(schemaData)
    const response = await request(app).get('/some_id')
    expect(response.status).toBe(StatusCode.OK)
    expect(response.body).toEqual(schemaData)
  })

  it('should handle JSON schema not found via GET', async () => {
    (jsonSchemaModelService.findById as jest.Mock).mockResolvedValue(null)
    const response = await request(app).get('/nonexistent_id')
    expect(response.status).toBe(StatusCode.NOT_FOUND)
    expect(response.body).toEqual({
      error: {
        details: 'Schema not found for ID: nonexistent_id',
        name: ErrorType.SCHEMA_NOT_FOUND
      }
    })
  })

  it('should update a JSON schema by ID via PUT', async () => {
    const updatedSchemaData = { schema: { type: 'updated_object' } };
    (jsonSchemaModelService.update as jest.Mock).mockResolvedValue(updatedSchemaData)
    const response = await request(app).put('/some_id').send(updatedSchemaData)
    expect(response.status).toBe(StatusCode.OK)
    expect(response.body).toEqual({ message: SuccessType.SCHEMA_UPDATED_SUCCESSFULLY, data: updatedSchemaData })
  })

  it('should handle JSON schema not found on update via PUT', async () => {
    (jsonSchemaModelService.update as jest.Mock).mockResolvedValue(null)
    const response = await request(app).put('/nonexistent_id').send({ schema: { type: 'updated_object' } })
    expect(response.status).toBe(StatusCode.NOT_FOUND)
    expect(response.body).toEqual({
      error: {
        details: 'Schema not found for ID: nonexistent_id',
        name: ErrorType.SCHEMA_NOT_FOUND
      }
    })
  })

  it('should delete a JSON schema by ID via DELETE', async () => {
    (jsonSchemaModelService.delete as jest.Mock).mockResolvedValue({})
    const response = await request(app).delete('/some_id')
    expect(response.status).toBe(StatusCode.OK)
    expect(response.body).toEqual({ message: SuccessType.SCHEMA_DELETED_SUCCESSFULLY })
  })

  it('should handle JSON schema not found on delete via DELETE', async () => {
    (jsonSchemaModelService.delete as jest.Mock).mockResolvedValue(null)
    const response = await request(app).delete('/nonexistent_id')
    expect(response.status).toBe(StatusCode.NOT_FOUND)
    expect(response.body).toEqual({
      error: {
        details: 'Schema not found for ID: nonexistent_id',
        name: ErrorType.SCHEMA_NOT_FOUND
      }
    })
  })

  describe('Get Skills by Schema ID for ASSESSMENT Ms', () => {
    it('should fetch skills by schema ID via GET', async () => {
      const schemaId = 'schema_id'
      const mockSkills = [
        { name: 'Skill 1', type: 'hard' },
        { name: 'Skill 2', type: 'soft' }
      ]
      const findByIdSpy = jest.spyOn(JSONSchemadata, 'findById')
      findByIdSpy.mockResolvedValueOnce({ schema: { skills: mockSkills } })

      const response = await request(app).get(`/skills/${schemaId}`)

      expect(response.status).toBe(StatusCode.OK)
      expect(response.body).toEqual({ skills: mockSkills })
      findByIdSpy.mockRestore()
    })
    it('should handle schema not found via GET', async () => {
      const schemaId = 'nonexistent_id'
      const findByIdSpy = jest.spyOn(JSONSchemadata, 'findById')
      findByIdSpy.mockResolvedValue(null)

      const response = await request(app).get(`/skills/${schemaId}`)

      expect(response.status).toBe(StatusCode.NOT_FOUND)
      expect(response.body).toEqual({
        error: {
          details: `Schema not found for ID: ${schemaId}`,
          name: ErrorType.SCHEMA_NOT_FOUND
        }
      })
      findByIdSpy.mockRestore()
    })
    it('should fetch skills by schema ID via GET', async () => {
      const schemaWithSkills = {
        _id: 'schema_with_skills_id',
        schema: {
          personal_information: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com'
          },
          education: [
          ],
          skills: [
            { name: 'Skill 1', type: 'hard' },
            { name: 'Skill 2', type: 'soft' }
          ]
        }
      }
      const findByIdSpy = jest.spyOn(JSONSchemadata, 'findById')
      findByIdSpy.mockResolvedValueOnce(schemaWithSkills)

      const response = await request(app).get(`/skills/${schemaWithSkills._id}`)

      expect(response.status).toBe(StatusCode.OK)
      expect(response.body).toEqual({ skills: schemaWithSkills.schema.skills })
    })

    it('should handle schema not found via GET', async () => {
      (JSONSchemadata.findById as jest.Mock).mockResolvedValue(null)

      const response = await request(app).get('/skills/nonexistent_id')

      expect(response.status).toBe(StatusCode.NOT_FOUND)
      expect(response.body).toEqual({
        error: {
          details: 'Schema not found for ID: nonexistent_id',
          name: ErrorType.SCHEMA_NOT_FOUND
        }
      })
    })

    it('should handle schema with no skills via GET', async () => {
      const schemaWithNoSkills = {
        _id: 'schema_with_no_skills_id',
        schema: {
          personal_information: {
            first_name: 'test',
            last_name: 'test',
            email: 'test@example.com'
          }
        }
      };
      (JSONSchemadata.findById as jest.Mock).mockResolvedValue(schemaWithNoSkills)

      const response = await request(app).get(`/skills/${schemaWithNoSkills._id}`)

      expect(response.status).toBe(StatusCode.NOT_FOUND)
      expect(response.body).toEqual({
        error: {
          details: 'Skills not found in the schema',
          name: ErrorType.SKILLS_NOT_FOUND
        }
      })
    })
  })
})
