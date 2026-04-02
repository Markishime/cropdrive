import { NextRequest, NextResponse } from 'next/server';
import { refreshAgsKnowledgeBase } from '@/lib/ags-knowledge-refresh';

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

    const result = await refreshAgsKnowledgeBase({
      triggeredBy: isVercelCron ? 'vercel-cron' : 'manual-api',
    });

    const statusCode = result.errors.length > 0 ? 207 : 200;

    return NextResponse.json(
      {
        success: result.errors.length === 0,
        message: 'AGS knowledge refresh completed',
        ...result,
      },
      { status: statusCode }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error refreshing AGS knowledge base:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh AGS knowledge base',
        details: message,
      },
      { status: 500 }
    );
  }
}