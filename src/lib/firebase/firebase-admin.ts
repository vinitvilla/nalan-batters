import { initializeApp, cert, getApps, getApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

function getAdminApp(): App {
  if (getApps().length > 0) return getApp();
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// Lazy proxies — Firebase Admin is not initialized until the first property
// access at request time. This prevents cert() from running during
// `next build`'s static analysis phase when credentials aren't present.
export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_, prop: string | symbol) {
    return getAuth(getAdminApp())[prop as keyof Auth];
  },
});

export const app: App = new Proxy({} as App, {
  get(_, prop: string | symbol) {
    return getAdminApp()[prop as keyof App];
  },
});
