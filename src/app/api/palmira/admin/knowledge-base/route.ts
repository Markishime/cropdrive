import { NextRequest, NextResponse } from 'next/server';
import { adminDb, getAdminAuth } from '@/lib/firebase-admin';
import { getMembershipAdmin, canAccessPalmira } from '@/lib/membership-admin';
import { isAdmin } from '@/lib/admin';
import { PalmiraKnowledgeBaseDocument } from '@/types';
import admin from 'firebase-admin';

// GET - List all knowledge base documents (admin or Palmira plan)
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
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      const membership = await getMembershipAdmin(userId);
      if (!canAccessPalmira(membership)) {
        return NextResponse.json(
          { success: false, error: 'Palmira access requires a plan' },
          { status: 403 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const language = searchParams.get('language');
    const isActive = searchParams.get('isActive');

    let query = adminDb.collection('palmira_knowledge_base');

    if (category) {
      query = query.where('category', '==', category) as any;
    }
    if (language) {
      query = query.where('language', 'in', [language, 'both']) as any;
    }
    if (isActive !== null) {
      query = query.where('isActive', '==', isActive === 'true') as any;
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    const documents = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        content: data.content || '',
        category: data.category || '',
        tags: data.tags || [],
        language: data.language || 'both',
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      } as PalmiraKnowledgeBaseDocument;
    });

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error: any) {
    console.error('Error fetching knowledge base documents:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

// POST - Create a new knowledge base document (admin only - keeping admin requirement for creation)
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

    // Keep admin requirement for creating documents
    const { verifyAdmin } = await import('@/lib/admin');
    await verifyAdmin(token);

    const body = await request.json();
    const { title, content, category, tags, language, isActive } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Validate language
    if (language && !['en', 'ms', 'both'].includes(language)) {
      return NextResponse.json(
        { success: false, error: 'Language must be "en", "ms", or "both"' },
        { status: 400 }
      );
    }

    const now = new Date();
    const docData = {
      title: title.trim(),
      content: content.trim(),
      category: category?.trim() || 'general',
      tags: Array.isArray(tags) ? tags.map((tag: string) => tag.trim()).filter(Boolean) : [],
      language: language || 'both',
      isActive: isActive !== undefined ? isActive : true,
      createdAt: admin.firestore.Timestamp.fromDate(now),
      updatedAt: admin.firestore.Timestamp.fromDate(now),
    };

    const docRef = await adminDb.collection('palmira_knowledge_base').add(docData);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...docData,
        createdAt: now,
        updatedAt: now,
      },
    });
  } catch (error: any) {
    console.error('Error creating knowledge base document:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
