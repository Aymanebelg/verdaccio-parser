import { type Types } from 'mongoose'

interface JSONSchema {
  _id?: Types.ObjectId
  schema: object
  version?: number
}
export default JSONSchema
