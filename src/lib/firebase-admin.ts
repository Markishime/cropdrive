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

/**
 * Returns the Firebase Admin Auth instance, ensuring the app is initialised first.
 * Use this instead of `getAuth()` from 'firebase-admin/auth' so that our lazy
 * initialisation always runs before any auth operation is attempted.
 */
export function getAdminAuth(): admin.auth.Auth {
  return getApp().auth();
}

/**
 * Helper proxy factory — binds every method to its service instance so that
 * detached property access (e.g. `const fn = proxy.method; fn()`) works safely.
 */
function makeProxy<T extends object>(getService: () => T): T {
  return new Proxy({} as T, {
    get(_t, prop: string | symbol) {
      const service = getService();
      const val = (service as any)[prop];
      return typeof val === 'function' ? (val as Function).bind(service) : val;
    },
  });
}

export const adminAuth = makeProxy<admin.auth.Auth>(() => getApp().auth());
export const adminDb   = makeProxy<admin.firestore.Firestore>(() => getApp().firestore());
export const adminFirestore = adminDb;
export const adminStorage   = makeProxy<admin.storage.Storage>(() => getApp().storage());

export default admin;
