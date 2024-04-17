import type errorBody from '../models/errorBody'
import createLogger from 'dev.linkopus.logger'

export default class ApiError extends Error {
  constructor (public errorBody: errorBody, public module: NodeModule, public path?: string) {
    super()
    if (path) {
      createLogger(undefined, this.path).error(this.log())
    } else {
      createLogger(this.module).error(this.log())
    }
  }

  public log (): string {
    return `${this.errorBody.status} ${this.errorBody.name}: ${this.errorBody.details as string ?? ''}`
  }
}

export const getErrorFilePath = (error: Error): string | undefined => {
  const stack = error.stack
  if (stack) {
    const stackLines = stack.split('\n')
    for (const line of stackLines) {
      const filePathMatch = /\s+at\s(?:.*\()?(.*\.ts|.*\.js):[0-9]+:[0-9]+\)?/.exec(line)
      if (filePathMatch) {
        return filePathMatch[1]
      }
    }
  }
  return undefined
}
