import admin from 'firebase-admin';

function getApp(): admin.app.App {
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

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_t, prop) {
    return (getApp().auth() as any)[prop];
  },
});

export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_t, prop) {
    return (getApp().firestore() as any)[prop];
  },
});

export const adminFirestore = adminDb;

export const adminStorage = new Proxy({} as admin.storage.Storage, {
  get(_t, prop) {
    return (getApp().storage() as any)[prop];
  },
});

export default admin;
