import { initializeApp, cert, getApps, getApp, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
};

export const app: App = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApp();
export const adminAuth = getAuth(app);
