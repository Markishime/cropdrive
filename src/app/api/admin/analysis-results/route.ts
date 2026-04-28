import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin';
import { adminDb } from '@/lib/firebase-admin';

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split('Bearer ')[1] || null;
}

function toISOString(value: any): string | null {
  if (!value) return null;
  if (value?.toDate) return value.toDate().toISOString();
  if (value?.seconds) return new Date(value.seconds * 1000).toISOString();
  if (typeof value === 'string') return value;
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await verifyAdmin(token);

    const { searchParams } = new URL(request.url);
    const filterUserId = searchParams.get('userId') ?? null;

    // Fetch all users for name/email lookup
    const usersSnap = await adminDb.collection('users').get();
    const usersById = new Map<string, { name: string; email: string; countryRegion: string }>();
    usersSnap.forEach((doc: any) => {
      const d = doc.data() || {};
      usersById.set(doc.id, {
        name: String(d.displayName || d.name || ''),
        email: String(d.email || ''),
        countryRegion: String(d.countryRegion || d.farmLocation || ''),
      });
    });

    // ── Plain collection scan — no composite index required ──────────────────
    // We intentionally avoid compound where+orderBy queries because they require
    // Firestore composite indexes that may not be deployed.
    let baseQuery: FirebaseFirestore.Query = adminDb.collection('analysis_results');

    // If filtering by a single user, use simple equality queries (single-field
    // indexes always exist automatically) for both field-name formats.
    let allDocs: FirebaseFirestore.QueryDocumentSnapshot[] = [];

    if (filterUserId) {
      const [s1, s2] = await Promise.allSettled([
        adminDb.collection('analysis_results').where('userId', '==', filterUserId).get(),
        adminDb.collection('analysis_results').where('user_id', '==', filterUserId).get(),
      ]);
      if (s1.status === 'fulfilled') allDocs.push(...s1.value.docs);
      if (s2.status === 'fulfilled') allDocs.push(...s2.value.docs);
    } else {
      // Full scan — admin sees everything
      const snap = await baseQuery.limit(2000).get();
      allDocs = snap.docs;
    }

    const seen = new Set<string>();
    const results: any[] = [];

    for (const docSnap of allDocs) {
      if (seen.has(docSnap.id)) continue;
      seen.add(docSnap.id);

      const data = docSnap.data() || {};

      // Support both field-name formats for the owner UID
      const uid = String(data.userId || data.user_id || '');
      if (!uid) continue; // skip orphaned docs with no owner

      const userMeta = usersById.get(uid);

      // Normalise date
      const createdAt =
        toISOString(data.createdAt) ||
        toISOString(data.timestamp) ||
        toISOString(data.date) ||
        null;

      // Normalise type
      let type = 'soil';
      if (typeof data.type === 'string' && data.type) {
        type = data.type;
      } else if (Array.isArray(data.report_types) && data.report_types.length > 0) {
        type = data.report_types.includes('soil') ? 'soil' : data.report_types[0];
      }

      // Normalise recommendations — keep full array AND count
      const rawRecs = data.recommendations ?? data.analysisData?.recommendations ?? [];
      const rawRecsMs = data.recommendationsMs ?? data.analysisData?.recommendationsMs ?? [];
      const recommendationsArray: string[] = Array.isArray(rawRecs)
        ? rawRecs.filter((r: any) => typeof r === 'string')
        : [];
      const recommendationsArrayMs: string[] = Array.isArray(rawRecsMs)
        ? rawRecsMs.filter((r: any) => typeof r === 'string')
        : [];
      const recommendationsCount = typeof rawRecs === 'number'
        ? rawRecs
        : recommendationsArray.length;

      results.push({
        id: docSnap.id,
        userId: uid,
        userName: userMeta?.name || String(data.userName || data.user_name || 'Unknown User'),
        userEmail: userMeta?.email || String(data.userEmail || data.user_email || ''),
        countryRegion: userMeta?.countryRegion || String(data.countryRegion || ''),
        title: String(data.title || data.reportTitle || data.report_title || 'Analysis Report'),
        type,
        status: String(data.status || 'completed'),
        summary: String(data.summary || data.description || data.report_summary || ''),
        createdAt,
        fileUrl: String(data.fileUrl || data.file_url || data.fileURL || ''),
        recommendationsArray,
        recommendationsArrayMs,
        recommendationsCount,
        soilData: data.soilData || data.soil_data || data.analysisData?.soilData || null,
        leafData: data.leafData || data.leaf_data || data.analysisData?.leafData || null,
        analysisData: data.analysisData || data.analysis_data || null,
      });
    }

    // Sort newest first
    results.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db2 - da;
    });

    return NextResponse.json({ success: true, results, total: results.length });
  } catch (error: any) {
    console.error('Error fetching admin analysis results:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
