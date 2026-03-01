import type pino from 'pino';

declare global {
  interface Request {
    logger: pino.Logger;
  }
}
