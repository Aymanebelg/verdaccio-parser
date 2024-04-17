import mongoose from 'mongoose'

const JSONSchema = new mongoose.Schema({
  schema: { type: Object, required: true },
  version: { type: Number, required: true, default: 1 }
}, { timestamps: true })

const JSONSchemadata = mongoose.model('JSONSchemadata', JSONSchema)
export default JSONSchemadata
