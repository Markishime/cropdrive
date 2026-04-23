import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { getMembershipAdmin, canAccessPalmira } from '@/lib/membership-admin';

// Using adminDb from firebase-admin

// Get specific chat with messages
export async function GET(
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
        { success: false, error: 'Palmira access is currently unavailable for this account' },
        { status: 403 }
      );
    }

    const { chatId } = await params;

    // Get chat
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

    // Get messages
    const messagesSnapshot = await adminDb
      .collection('palmira_chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();

    const messages = messagesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        chatId,
        userId,
        role: data.role,
        content: data.content,
        pdfFileName: data.metadata?.pdfFileName || null,
        metadata: data.metadata || {},
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        id: chatId,
        title: chatData.title,
        activeReportId: chatData.activeReportId || null,
        messages,
        createdAt: chatData.createdAt?.toDate?.() || new Date(),
        updatedAt: chatData.updatedAt?.toDate?.() || new Date(),
        escalated: chatData.escalated || false,
      },
    });
  } catch (error: any) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a chat (authenticated users only)
export async function DELETE(
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

    // Check membership for Palmira access
    const membership = await getMembershipAdmin(userId);
    if (!canAccessPalmira(membership)) {
      return NextResponse.json(
        { success: false, error: 'Palmira access is currently unavailable for this account' },
        { status: 403 }
      );
    }

    const { chatId } = await params;

    // Verify the chat belongs to the user
    const chatDoc = await adminDb.collection('palmira_chats').doc(chatId).get();
    if (!chatDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Chat not found' },
        { status: 404 }
      );
    }

    const chatData = chatDoc.data();
    if (chatData?.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete the chat document and all its messages
    await adminDb.collection('palmira_chats').doc(chatId).delete();

    return NextResponse.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
