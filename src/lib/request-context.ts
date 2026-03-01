import type pino from 'pino';

type RequestLogger = pino.Logger;

const loggerMap = new Map<string, RequestLogger>();

export function setRequestLogger(requestId: string, logger: RequestLogger) {
  loggerMap.set(requestId, logger);

  // Auto-cleanup after 60s to prevent memory leaks
  setTimeout(() => {
    loggerMap.delete(requestId);
  }, 60_000);
}

// Patch Request.prototype so request.logger works automatically in route handlers
if (typeof Request !== 'undefined') {
  Object.defineProperty(Request.prototype, 'logger', {
    get(this: Request) {
      const requestId = this.headers.get('x-request-id');
      if (!requestId) return undefined;
      return loggerMap.get(requestId);
    },
    configurable: true,
  });
}
