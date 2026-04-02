import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { getMembershipAdmin, canAccessPalmira } from '@/lib/membership-admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check membership
    const membership = await getMembershipAdmin(userId);
    if (!canAccessPalmira(membership)) {
      return NextResponse.json(
        { success: false, error: 'Palmira access requires a plan' },
        { status: 403 }
      );
    }

    const { chatId } = await params;

    // Verify chat belongs to user
    const chatDoc = await adminDb
      .collection('palmira_chats')
      .doc(chatId)
      .get();

    if (!chatDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Chat not found' },
        { status: 404 }
      );
    }

    const chatData = chatDoc.data();
    if (chatData?.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Mark chat as escalated
    await adminDb.collection('palmira_chats').doc(chatId).update({
      escalated: true,
      escalationReason: 'User requested escalation',
      escalatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create escalation notification (you can extend this to notify admins)
    await adminDb.collection('notifications').add({
      userId,
      type: 'info',
      title: 'Chat Escalated',
      titleMs: 'Sembang Dikemukakan',
      message: `Your chat "${chatData.title}" has been flagged for human follow-up.`,
      messageMs: `Sembang anda "${chatData.title}" telah ditandakan untuk susulan manusia.`,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Chat escalated successfully',
    });
  } catch (error: any) {
    console.error('Error escalating chat:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
