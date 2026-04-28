import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin';
import { adminDb } from '@/lib/firebase-admin';

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split('Bearer ')[1] || null;
}

export async function GET(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await verifyAdmin(token);

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ success: false, error: 'chatId is required' }, { status: 400 });
    }

    const messagesSnap = await adminDb
      .collection('palmira_chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();

    const messages = messagesSnap.docs.map((doc: any) => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        role: String(data.role || 'user'),
        content: String(data.content || data.text || ''),
        timestamp: data.createdAt?.toDate?.()?.toISOString?.() || data.timestamp?.toDate?.()?.toISOString?.() || null,
        fileUrls: data.fileUrls || data.attachments || [],
        fileName: data.fileName || data.metadata?.fileName || null,
      };
    });

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
