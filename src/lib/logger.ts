import pino from 'pino';
import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Configure Pino logger with environment-specific settings
 * - All environments: Write to daily log files
 * - Development: Additional pretty-printed console output
 */
const baseConfig = {
  level: isDevelopment ? 'debug' : isProduction ? 'info' : 'silent',
  timestamp: pino.stdTimeFunctions.isoTime,
};

/**
 * Generate log file path based on current date
 */
function getLogFilePath(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const filename = `app-${year}-${month}-${day}.log`;
  return join(process.cwd(), 'storage', 'logs', filename);
}

/**
 * Create file stream for logging (synchronous so logger is ready immediately)
 */
function createLogStream() {
  const logDir = join(process.cwd(), 'storage', 'logs');
  try {
    mkdirSync(logDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create logs directory:', error);
  }
  return createWriteStream(getLogFilePath(), { flags: 'a' });
}

/**
 * Create a pino logger instance writing to the given stream
 */
function buildLogger(stream: NodeJS.WritableStream): pino.Logger {
  if (isDevelopment) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pretty = require('pino-pretty');
    const consoleStream = pretty({
      colorize: true,
      singleLine: false,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    });
    return pino(baseConfig, pino.multistream([
      { stream },
      { stream: consoleStream },
    ]));
  }
  return pino(baseConfig, stream);
}

let currentDate: string = new Date().toISOString().split('T')[0];
let logStream = createLogStream();
let loggerInstance: pino.Logger = buildLogger(logStream);

/**
 * Rotate log file and recreate logger if the date has changed
 */
function checkAndRotateLog() {
  const newDate = new Date().toISOString().split('T')[0];
  if (newDate !== currentDate) {
    currentDate = newDate;
    logStream.end();
    logStream = createLogStream();
    loggerInstance = buildLogger(logStream);
  }
}

export const logger = new Proxy({} as pino.Logger, {
  get: (_target, prop) => {
    checkAndRotateLog();
    if (prop in loggerInstance) {
      return (loggerInstance as any)[prop];
    }
    return undefined;
  },
});

/**
 * Create a child logger with request context
 * Usage: const requestLogger = createRequestLogger(req, 'api-endpoint-name')
 */
export function createRequestLogger(
  req: Request | { headers: Headers; url: string },
  endpoint: string,
  userId?: string
) {
  const requestId = crypto.randomUUID();
  const method = 'method' in req ? req.method : 'GET';
  const url = 'url' in req ? req.url : (req as any).url;

  return logger.child({
    requestId,
    endpoint,
    method,
    url,
    userId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log API request/response with standardized format
 */
export function logApiCall(
  requestLogger: ReturnType<typeof createRequestLogger>,
  action: 'request' | 'success' | 'error',
  data?: Record<string, any>
) {
  switch (action) {
    case 'request':
      requestLogger.info({ action: 'api_request', ...data });
      break;
    case 'success':
      requestLogger.info({ action: 'api_success', ...data });
      break;
    case 'error':
      requestLogger.error({ action: 'api_error', ...data });
      break;
  }
}

/**
 * Log database operations
 */
export function logDatabase(
  requestLogger: ReturnType<typeof createRequestLogger>,
  operation: 'query' | 'insert' | 'update' | 'delete',
  data?: Record<string, any>
) {
  requestLogger.debug({ type: 'database', operation, ...data });
}

/**
 * Log authentication events
 */
export function logAuth(action: 'login' | 'logout' | 'failed' | 'token_refresh', userId?: string, data?: Record<string, any>) {
  logger.info({ type: 'auth', action, userId, ...data });
}

type AnyLogger = ReturnType<typeof createRequestLogger> | typeof logger;

export function logInfo(requestLogger: AnyLogger, data: Record<string, any>) {
  requestLogger.info(data);
}

export function logWarn(requestLogger: AnyLogger, data: Record<string, any>) {
  requestLogger.warn(data);
}

export function logDebug(requestLogger: AnyLogger, data: Record<string, any>) {
  requestLogger.debug(data);
}

/**
 * Log errors with full context — normalizes Error objects and unknown throws
 */
export function logError(
  requestLogger: AnyLogger,
  error: Error | unknown,
  context?: Record<string, any>
) {
  const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { error: String(error) };
  requestLogger.error({ ...errorData, ...context });
}

export default logger;
