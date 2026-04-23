import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { getMembershipAdmin, canAccessPalmira } from '@/lib/membership-admin';

// Using adminDb from firebase-admin

function toMillis(value: any): number {
  try {
    if (!value) return 0;
    // Firestore Timestamp
    if (typeof value.toMillis === 'function') return value.toMillis();
    if (typeof value.toDate === 'function') return value.toDate().getTime();
    // ISO string
    if (typeof value === 'string') {
      const ms = Date.parse(value);
      return Number.isFinite(ms) ? ms : 0;
    }
    // number
    if (typeof value === 'number') return value;
    return 0;
  } catch {
    return 0;
  }
}

// Get user's reports for Palmira
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

    // Check membership for full access
    const membership = await getMembershipAdmin(userId);
    if (!canAccessPalmira(membership)) {
      return NextResponse.json(
        { success: false, error: 'Palmira access is currently unavailable for this account' },
        { status: 403 }
      );
    }

    // Get user's reports (support both userId + user_id formats).
    // IMPORTANT: Some older docs may not have `status`; the History page treats missing status as "completed".
    const reportsRef = adminDb.collection('analysis_results');

    // Follow History page fetching logic:
    // - No `orderBy` (avoids composite-index requirements)
    // - No `status` filter in the query; filter client-side/server-side after fetching
    const [snap1, snap2] = await Promise.all([
      reportsRef
        .where('user_id', '==', userId)
        .limit(200)
        .get(),
      reportsRef
        .where('userId', '==', userId)
        .limit(200)
        .get(),
    ]);

    const byId = new Map<string, any>();
    for (const doc of snap1.docs) byId.set(doc.id, doc.data());
    for (const doc of snap2.docs) byId.set(doc.id, doc.data());

    const reports = Array.from(byId.entries())
      .map(([id, data]) => {
        const reportStatus = String(data.status || 'completed').toLowerCase().trim();
        if (reportStatus !== 'completed') return null;

        const createdMs =
          toMillis(data.createdAt) ||
          toMillis(data.timestamp) ||
          // Some docs store date as ISO string (History page uses `date` fallback)
          toMillis(data.date) ||
          toMillis(data.updatedAt);
        // Match History page title logic (processReportDoc)
        const dateIso =
          createdMs ? new Date(createdMs).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const title =
          data.title ||
          data.reportTitle ||
          data.report_title ||
          `Analysis Report - ${data.date || dateIso}`;
        const type =
          data.type ||
          (Array.isArray(data.report_types) && data.report_types.includes('soil')
            ? 'soil'
            : Array.isArray(data.report_types) && data.report_types.includes('leaf')
              ? 'leaf'
              : 'other');

        return {
          id,
          reportId: id,
          title,
          type,
          uploadedAt: createdMs ? new Date(createdMs) : new Date(),
          summary: data.summary || '',
        };
      })
      .filter((r): r is { id: string; reportId: string; title: string; type: string; uploadedAt: Date; summary: string } => !!r)
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .slice(0, 50);

    return NextResponse.json({
      success: true,
      data: reports,
    });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
