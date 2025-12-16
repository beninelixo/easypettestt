type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: string;
  stack?: string;
}

class Logger {
  private isDev = import.meta.env.DEV;

  private formatLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
      ...(error && {
        error: error.message,
        stack: error.stack,
      }),
    };
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const logEntry = this.formatLogEntry(level, message, context);

    // Console logging in development only
    if (this.isDev) {
      const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      const prefix = `[${level.toUpperCase()}]`;
      
      if (context) {
        console[method](prefix, message, context);
      } else {
        console[method](prefix, message);
      }
    }

    return logEntry;
  }

  debug(message: string, context?: LogContext): LogEntry {
    return this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): LogEntry {
    return this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): LogEntry {
    return this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): LogEntry {
    const logEntry = this.formatLogEntry('error', message, context, error);

    if (this.isDev) {
      console.error('[ERROR]', message, error, context);
    }

    return logEntry;
  }

  // Group related logs
  group(label: string, fn: () => void) {
    if (this.isDev) {
      console.group(label);
      fn();
      console.groupEnd();
    } else {
      fn();
    }
  }

  // Measure performance
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(`${label} completed`, { durationMs: Math.round(duration) });
    };
  }
}

export const logger = new Logger();
