import createLogger from 'dev.linkopus.logger'
import type Joi from 'joi'

const logger = createLogger(module)

export const validateBody = (body: any, validator: Joi.ObjectSchema<any>): string[] => {
  logger.info('Validating request body...')
  const { error } = validator.validate(body, { abortEarly: false })
  if (error) {
    const errorMessages = error.details.map(detail => detail.message)
    return errorMessages
  }
  return []
}
