import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { getMembershipAdmin, canAccessPalmira } from '@/lib/membership-admin';

// Using adminDb from firebase-admin

// Get knowledge base documents (for admin management - simplified)
// In production, implement vector search for semantic retrieval
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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const language = searchParams.get('language') || 'en';
    const limit = parseInt(searchParams.get('limit') || '5');

    // Simplified search - in production, use vector search or full-text search
    let kbQuery = adminDb
      .collection('palmira_knowledge_base')
      .where('isActive', '==', true)
      .where('language', 'in', [language, 'both'])
      .limit(limit);

    const kbDocs = await kbQuery.get();
    
    let documents = kbDocs.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        content: data.content || '',
        category: data.category || '',
        tags: data.tags || [],
        language: data.language || 'both',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        isActive: data.isActive || false,
      };
    });

    // Simple text matching if query provided
    if (query) {
      const queryLower = query.toLowerCase();
      documents = documents
        .filter(doc => {
          const title = (doc.title || '').toLowerCase();
          const content = (doc.content || '').toLowerCase();
          return title.includes(queryLower) || content.includes(queryLower);
        })
        .slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error: any) {
    console.error('Error fetching knowledge base:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
