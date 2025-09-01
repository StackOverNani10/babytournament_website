interface LogContext {
  [key: string]: any;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private static instance: Logger;
  private isDev: boolean;
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };
  private minLevel: LogLevel = 'debug';

  private constructor() {
    this.isDev = import.meta.env.DEV;
    this.minLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'debug';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      formattedMessage += `\nContext: ${JSON.stringify(context, null, this.isDev ? 2 : 0)}`;
    }
    
    return formattedMessage;
  }

  public debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    
    const formattedMessage = this.formatMessage('debug', message, context);
    
    if (this.isDev) {
      console.debug(`%c${formattedMessage}`, 'color: #666666');
    } else {
      // In production, you might want to send this to a logging service
      console.debug(formattedMessage);
    }
  }

  public info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    
    const formattedMessage = this.formatMessage('info', message, context);
    
    if (this.isDev) {
      console.info(`%c${formattedMessage}`, 'color: #2196F3');
    } else {
      console.info(formattedMessage);
    }
  }

  public warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    
    const formattedMessage = this.formatMessage('warn', message, context);
    
    if (this.isDev) {
      console.warn(`%c${formattedMessage}`, 'color: #FF9800');
    } else {
      console.warn(formattedMessage);
      // In production, you might want to send warnings to your error tracking service
    }
  }

  public error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    
    const errorContext = {
      ...context,
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      },
    };
    
    const formattedMessage = this.formatMessage('error', message, errorContext);
    
    if (this.isDev) {
      console.error(`%c${formattedMessage}`, 'color: #F44336');
    } else {
      console.error(formattedMessage);
      // In production, send errors to your error tracking service (e.g., Sentry, LogRocket)
      this.sendToErrorTracking(message, error, errorContext);
    }
  }

  private sendToErrorTracking(
    message: string, 
    error?: Error, 
    context?: LogContext
  ): void {
    // Integrate with your error tracking service here
    // Example with Sentry:
    // if (window.Sentry) {
    //   window.Sentry.captureException(error || new Error(message), {
    //     extra: context,
    //   });
    // }
  }

  // Method to set the log level dynamically
  public setLogLevel(level: LogLevel): void {
    if (this.logLevels.hasOwnProperty(level)) {
      this.minLevel = level;
    } else {
      this.warn(`Invalid log level: ${level}. Using 'debug' as fallback.`);
      this.minLevel = 'debug';
    }
  }
}

// Create a singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: LogContext) => 
    logger.error(message, error, context),
};
