// src/app/admin/api-handler.ts
// Centralized API handler for admin API calls. Throws UnauthorizedError on 401.

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export async function adminApiHandler(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    throw new UnauthorizedError();
  }
  return res;
}
