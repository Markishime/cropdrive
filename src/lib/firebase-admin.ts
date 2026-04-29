import admin from 'firebase-admin';

function initializeApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin credentials are not set. ' +
      'Ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and ' +
      'FIREBASE_PRIVATE_KEY are present in your environment.'
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, privateKey, clientEmail }),
    projectId,
  });
}

// Eagerly initialize so getAuth()/getFirestore() from firebase-admin modular API work
const app = initializeApp();

export const adminAuth = app.auth();
export const adminDb = app.firestore();
export const adminFirestore = adminDb;
export const adminStorage = app.storage();

export default admin;
