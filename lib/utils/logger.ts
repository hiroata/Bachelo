/**
 * Development-only logging utility
 * Prevents console statements in production builds
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMessage {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: Date;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, data?: unknown) {
    if (!this.isDevelopment) return;

    const logMessage: LogMessage = {
      level,
      message,
      data,
      timestamp: new Date(),
    };

    switch (level) {
      case 'info':
        console.info(`[${logMessage.timestamp.toISOString()}] INFO: ${message}`, data);
        break;
      case 'warn':
        console.warn(`[${logMessage.timestamp.toISOString()}] WARN: ${message}`, data);
        break;
      case 'error':
        console.error(`[${logMessage.timestamp.toISOString()}] ERROR: ${message}`, data);
        break;
      case 'debug':
        console.debug(`[${logMessage.timestamp.toISOString()}] DEBUG: ${message}`, data);
        break;
    }
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown) {
    this.log('error', message, data);
  }

  debug(message: string, data?: unknown) {
    this.log('debug', message, data);
  }
}

export const logger = new Logger();

// Convenience functions for quick logging
export const logInfo = (message: string, data?: unknown) => logger.info(message, data);
export const logWarn = (message: string, data?: unknown) => logger.warn(message, data);
export const logError = (message: string, data?: unknown) => logger.error(message, data);
export const logDebug = (message: string, data?: unknown) => logger.debug(message, data);