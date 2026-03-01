type SSEController = ReadableStreamDefaultController<Uint8Array>;

declare global {
  // eslint-disable-next-line no-var
  var __sseClients: Map<string, Set<SSEController>> | undefined;
}

/**
 * Global in-memory registry of active SSE connections.
 * Keyed by DB userId → set of active stream controllers.
 *
 * Uses globalThis so the same Map survives Next.js hot-module reloads in dev.
 */
const clients: Map<string, Set<SSEController>> =
  globalThis.__sseClients ?? (globalThis.__sseClients = new Map());

export function addClient(userId: string, controller: SSEController): void {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId)!.add(controller);
}

export function removeClient(userId: string, controller: SSEController): void {
  const set = clients.get(userId);
  if (!set) return;
  set.delete(controller);
  if (set.size === 0) clients.delete(userId);
}

/**
 * Push a JSON payload to all active SSE connections for a given user.
 * Stale controllers (closed connections) are silently pruned.
 */
export function notifyUser(userId: string, payload: unknown): void {
  const set = clients.get(userId);
  if (!set || set.size === 0) return;

  const data = `data: ${JSON.stringify(payload)}\n\n`;
  const encoded = new TextEncoder().encode(data);

  for (const controller of [...set]) {
    try {
      controller.enqueue(encoded);
    } catch {
      // Connection was closed — prune it
      set.delete(controller);
    }
  }
}
