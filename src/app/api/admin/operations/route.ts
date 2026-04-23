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

    const [usersSnap, uploadsSnap, reportsSnap, chatsSnap] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('palmira_user_uploads').orderBy('createdAt', 'desc').limit(300).get(),
      adminDb.collection('internal_reports').orderBy('createdAt', 'desc').limit(300).get(),
      adminDb.collection('palmira_chats').orderBy('updatedAt', 'desc').limit(300).get(),
    ]);

    const usersById = new Map<string, { name: string; email: string; countryRegion: string }>();
    usersSnap.forEach((doc: any) => {
      const data = doc.data() || {};
      usersById.set(doc.id, {
        name: String(data.displayName || data.name || 'Unknown User'),
        email: String(data.email || ''),
        countryRegion: String(data.countryRegion || data.farmLocation || ''),
      });
    });

    const uploadedFiles = uploadsSnap.docs.map((doc: any) => {
      const data = doc.data() || {};
      const userMeta = usersById.get(String(data.userId || ''));
      return {
        id: doc.id,
        userId: String(data.userId || ''),
        userName: userMeta?.name || 'Unknown User',
        userEmail: userMeta?.email || '',
        countryRegion: userMeta?.countryRegion || '',
        fileName: String(data.fileName || ''),
        fileType: String(data.fileType || ''),
        storagePath: String(data.storagePath || ''),
        downloadUrl: String(data.downloadUrl || ''),
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
      };
    });

    const internalReports = reportsSnap.docs.map((doc: any) => {
      const data = doc.data() || {};
      const userMeta = usersById.get(String(data.userId || ''));
      return {
        id: doc.id,
        reportId: String(data.reportId || ''),
        userId: String(data.userId || ''),
        userName: userMeta?.name || 'Unknown User',
        userEmail: String(data.userEmail || userMeta?.email || ''),
        countryRegion: String(data.countryRegion || userMeta?.countryRegion || ''),
        title: String(data.title || 'Untitled Report'),
        type: String(data.type || ''),
        fileUrl: String(data.fileUrl || ''),
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
      };
    });

    const chatLogs = chatsSnap.docs.map((doc: any) => {
      const data = doc.data() || {};
      const userId = String(data.userId || '');
      const userMeta = usersById.get(userId);
      return {
        id: doc.id,
        userId,
        userName: userMeta?.name || 'Unknown User',
        userEmail: userMeta?.email || '',
        countryRegion: userMeta?.countryRegion || '',
        title: String(data.title || 'New Chat'),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
        escalated: Boolean(data.escalated),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        uploadedFiles,
        internalReports,
        chatLogs,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin operations data:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
