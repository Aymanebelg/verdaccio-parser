import Joi from 'joi'

// Schema for validating the entire JSON object
export const jsonValidationSchema = Joi.object({
  schema: Joi.object().required()
})
