import path from 'path'
import winston, { format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const getLabel = (callingModule?: NodeModule): string => {
  if (!callingModule) return ''
  const parts = callingModule.filename.split(path.sep)
  const rootIndex = parts.findIndex(part => part === 'src')
  return rootIndex >= 0 ? parts.slice(rootIndex).join(path.sep) : callingModule.filename
}

const getColor = (level: string): string => {
  switch (level) {
    case 'INFO':
      return '\x1b[32m'
    case 'WARN':
      return '\x1b[33m' // Yellow
    case 'ERROR':
      return '\x1b[31m' // Red
    default:
      return '\x1b[0m' // Reset color
  }
}

const customPrint = format.printf((log): string => {
  return `${getColor(log.level)}${log.level} [${log.timestamp}] [${log.label}] ${log.message}\x1b`
})

const logger = (callingModule?: NodeModule, path?: string): winston.Logger => {
  const label = path ?? getLabel(callingModule)
  return winston.createLogger({
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.label({ label }),
      format(log => {
        log.level = log.level.toUpperCase()
        return log
      })(),
      customPrint
    ),
    transports: [
      new winston.transports.Console(),
      new DailyRotateFile({
        filename: 'logs/ParserMs-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d'
      })
    ]
  })
}

export default logger
