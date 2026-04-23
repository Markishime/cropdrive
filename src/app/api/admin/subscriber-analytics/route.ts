import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin';
import { adminDb } from '@/lib/firebase-admin';

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split('Bearer ')[1] || null;
}

function parseCountry(raw: string): string {
  const value = raw.toLowerCase();
  if (value.includes('malaysia')) return 'Malaysia';
  if (value.includes('indonesia')) return 'Indonesia';
  if (value.includes('philippines')) return 'Philippines';
  if (value.includes('thailand')) return 'Thailand';
  if (value.includes('india')) return 'India';
  if (value.includes('sri lanka')) return 'Sri Lanka';
  if (value.includes('kenya') || value.includes('ghana') || value.includes('nigeria') || value.includes('africa')) {
    return 'Africa';
  }
  return raw.trim() || 'Unknown';
}

function monthKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export async function GET(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await verifyAdmin(token);

    const usersSnap = await adminDb.collection('users').get();
    const growthByMonth = new Map<string, number>();
    const geoCounts = new Map<string, number>();

    usersSnap.forEach((doc: any) => {
      const data = doc.data() || {};
      const registrationDate =
        data.registrationDate?.toDate?.() || data.createdAt?.toDate?.() || new Date();

      const key = monthKey(registrationDate);
      growthByMonth.set(key, (growthByMonth.get(key) || 0) + 1);

      const countryRegion = String(data.countryRegion || data.farmLocation || 'Unknown');
      const country = parseCountry(countryRegion);
      geoCounts.set(country, (geoCounts.get(country) || 0) + 1);
    });

    const growth = Array.from(growthByMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }));

    const geography = Array.from(geoCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([country, count]) => ({ country, count }));

    const malaysia = geoCounts.get('Malaysia') || 0;
    const indonesia = geoCounts.get('Indonesia') || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalSubscribers: usersSnap.size,
        growth,
        geography,
        priorityMarkets: {
          malaysia,
          indonesia,
        },
        expansionMarkets: ['Philippines', 'Thailand', 'India', 'Sri Lanka', 'Africa'],
      },
    });
  } catch (error: any) {
    console.error('Error fetching subscriber analytics:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
