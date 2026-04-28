/**
 * One-time script to grant admin access to a user by email.
 * Usage: node scripts/set-admin.mjs cmark7781@gmail.com
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import admin from 'firebase-admin';

// Load .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => {
      const [key, ...rest] = line.split('=');
      return [key.trim(), rest.join('=').trim().replace(/^["']|["']$/g, '')];
    })
);

const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_CLIENT_EMAIL;
const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Missing Firebase credentials in .env.local');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
});

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/set-admin.mjs <email>');
  process.exit(1);
}

try {
  const userRecord = await admin.auth().getUserByEmail(email);
  const uid = userRecord.uid;
  console.log(`✅ Found user: ${uid} (${email})`);

  await admin.firestore().collection('users').doc(uid).set(
    { isAdmin: true },
    { merge: true }
  );

  console.log(`✅ isAdmin: true set for ${email}`);
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
