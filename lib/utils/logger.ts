type LogLevel = "info" | "warn" | "error" | "debug"

interface LogOptions {
  level?: LogLevel
  context?: string
  data?: any
}

class Logger {
  private static formatMessage(message: string, options: LogOptions = {}): string {
    const timestamp = new Date().toISOString()
    const level = options.level?.toUpperCase() || "INFO"
    const context = options.context ? `[${options.context}]` : ""
    return `${timestamp} ${level} ${context} ${message}`
  }

  private static logToConsole(message: string, options: LogOptions = {}) {
    const formattedMessage = this.formatMessage(message, options)
    const data = options.data ? "\nData:" + JSON.stringify(options.data, null, 2) : ""

    switch (options.level) {
      case "error":
        console.error(formattedMessage, data)
        break
      case "warn":
        console.warn(formattedMessage, data)
        break
      case "debug":
        console.debug(formattedMessage, data)
        break
      default:
        console.log(formattedMessage, data)
    }
  }

  static info(message: string, context?: string, data?: any) {
    this.logToConsole(message, { level: "info", context, data })
  }

  static warn(message: string, context?: string, data?: any) {
    this.logToConsole(message, { level: "warn", context, data })
  }

  static error(message: string, context?: string, data?: any) {
    this.logToConsole(message, { level: "error", context, data })
  }

  static debug(message: string, context?: string, data?: any) {
    if (process.env.NODE_ENV === "development") {
      this.logToConsole(message, { level: "debug", context, data })
    }
  }
}

export default Logger

