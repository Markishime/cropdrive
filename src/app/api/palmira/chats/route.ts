import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { getMembershipAdmin, canAccessPalmira } from '@/lib/membership-admin';

// Using adminDb from firebase-admin

// Get user's chat history
export async function GET(request: NextRequest) {
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

    // Get user's chats
    const chatsQuery = adminDb
      .collection('palmira_chats')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .limit(20);

    const chatsSnapshot = await chatsQuery.get();
    const chats = await Promise.all(
      chatsSnapshot.docs.map(async doc => {
        const data = doc.data();
        
        // Get message count
        const messagesSnapshot = await doc.ref
          .collection('messages')
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();
        
        const lastMessage = messagesSnapshot.docs[0]?.data();
        
        return {
          id: doc.id,
          title: data.title || 'New Chat',
          activeReportId: data.activeReportId || null,
          lastMessage: lastMessage?.content || null,
          lastMessageTime: lastMessage?.createdAt?.toDate?.() || data.updatedAt?.toDate?.() || new Date(),
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          escalated: data.escalated || false,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: chats,
    });
  } catch (error: any) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new chat
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, reportId } = body;

    const chatRef = adminDb.collection('palmira_chats').doc();
    const chatData = {
      userId,
      title: title || 'New Chat',
      activeReportId: reportId || null,
      messages: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      escalated: false,
    };

    await chatRef.set(chatData);

    return NextResponse.json({
      success: true,
      data: {
        id: chatRef.id,
        ...chatData,
      },
    });
  } catch (error: any) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
