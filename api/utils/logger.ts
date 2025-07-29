/**
 * Logging utilities for error tracking and debugging
 * Provides structured logging with different levels
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: any;
  error?: any;
}

/**
 * Logger class for structured logging
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel = process.env.LOG_LEVEL || (this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO);

  /**
   * Determines if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel as LogLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Creates a structured log entry
   */
  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data }),
      ...(data?.error && { error: this.serializeError(data.error) }),
      ...(data?.context && { context: data.context })
    };
  }

  /**
   * Serializes error objects for logging
   */
  private serializeError(error: any): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error.cause && { cause: this.serializeError(error.cause) })
      };
    }
    return error;
  }

  /**
   * Outputs log entry to console with appropriate formatting
   */
  private output(logEntry: LogEntry): void {
    if (this.isDevelopment) {
      // Pretty print for development
      const { level, message, timestamp, ...rest } = logEntry;
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
      if (Object.keys(rest).length > 0) {
        console.log(JSON.stringify(rest, null, 2));
      }
    } else {
      // JSON format for production
      console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Log error messages
   */
  error(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const logEntry = this.createLogEntry(LogLevel.ERROR, message, data);
    this.output(logEntry);
  }

  /**
   * Log warning messages
   */
  warn(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const logEntry = this.createLogEntry(LogLevel.WARN, message, data);
    this.output(logEntry);
  }

  /**
   * Log info messages
   */
  info(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const logEntry = this.createLogEntry(LogLevel.INFO, message, data);
    this.output(logEntry);
  }

  /**
   * Log debug messages
   */
  debug(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const logEntry = this.createLogEntry(LogLevel.DEBUG, message, data);
    this.output(logEntry);
  }

  /**
   * Log API requests for debugging
   */
  apiRequest(method: string, path: string, data?: any): void {
    this.info(`API Request: ${method} ${path}`, { 
      method, 
      path, 
      ...(data && { requestData: data })
    });
  }

  /**
   * Log API responses for debugging
   */
  apiResponse(method: string, path: string, statusCode: number, data?: any): void {
    this.info(`API Response: ${method} ${path} - ${statusCode}`, { 
      method, 
      path, 
      statusCode,
      ...(data && { responseData: data })
    });
  }

  /**
   * Log database operations
   */
  database(operation: string, table: string, data?: any): void {
    this.debug(`Database: ${operation} on ${table}`, { 
      operation, 
      table, 
      ...(data && { data })
    });
  }
}

// Export singleton logger instance
export const logger = new Logger();

// Export types for external use
export type { LogEntry };