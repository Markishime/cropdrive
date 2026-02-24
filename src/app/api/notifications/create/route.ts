import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Create a notification for a user. Respects user preferences:
 * - notifications: in-app notifications (Firestore)
 * - emailNotifications: sends email if user has it enabled
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const idToken = authHeader?.replace('Bearer ', '');

    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const body = await req.json();
    const { type = 'info', title, titleMs, message, messageMs, actionUrl } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'title and message required' }, { status: 400 });
    }

    const userDoc = await adminDb.collection('users').doc(uid).get();
    const userData = userDoc.data() || {};
    const preferences = userData.preferences || {};
    const notificationsEnabled = preferences.notifications !== false;
    const emailNotificationsEnabled = preferences.emailNotifications === true;

    if (notificationsEnabled) {
      await adminDb.collection('notifications').add({
        userId: uid,
        type: type || 'info',
        title: title,
        titleMs: titleMs || title,
        message: message,
        messageMs: messageMs || message,
        actionUrl: actionUrl || null,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    // TODO: If emailNotificationsEnabled, send email via SMTP
    // For now we only create in-app notifications

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
