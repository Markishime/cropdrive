import { NextRequest, NextResponse } from 'next/server';
import { refreshAgsKnowledgeDocs } from '@/lib/ags-knowledge-refresh';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  try {
    const vercelCronHeader = req.headers.get('x-vercel-cron');
    const authHeader = req.headers.get('authorization');
    const cronSecret = authHeader?.replace('Bearer ', '') || req.nextUrl.searchParams.get('secret');

    const isVercelCron = vercelCronHeader === '1';
    const isAuthorized = !!CRON_SECRET && cronSecret === CRON_SECRET;

    if (!isVercelCron && !isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await refreshAgsKnowledgeDocs();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error refreshing AGS knowledge docs:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to refresh AGS knowledge docs' },
      { status: 500 }
    );
  }
}
