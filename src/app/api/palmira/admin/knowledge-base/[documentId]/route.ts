import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';
import { getMembershipAdmin, canAccessPalmira } from '@/lib/membership-admin';
import { verifyAdmin } from '@/lib/admin';
import admin from 'firebase-admin';

// GET - Get a specific knowledge base document (authenticated users)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
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

    const { documentId } = await params;
    const doc = await adminDb.collection('palmira_knowledge_base').doc(documentId).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    const data = doc.data();
    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        title: data?.title || '',
        content: data?.content || '',
        category: data?.category || '',
        tags: data?.tags || [],
        language: data?.language || 'both',
        isActive: data?.isActive !== undefined ? data.isActive : true,
        createdAt: data?.createdAt?.toDate?.() || data?.createdAt,
        updatedAt: data?.updatedAt?.toDate?.() || data?.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching knowledge base document:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

// PUT - Update a knowledge base document (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    await verifyAdmin(token);

    const { documentId } = await params;
    const body = await request.json();
    const { title, content, category, tags, language, isActive } = body;

    // Check if document exists
    const docRef = adminDb.collection('palmira_knowledge_base').doc(documentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Validate language if provided
    if (language && !['en', 'ms', 'both'].includes(language)) {
      return NextResponse.json(
        { success: false, error: 'Language must be "en", "ms", or "both"' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (category !== undefined) updateData.category = category?.trim() || 'general';
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) 
        ? tags.map((tag: string) => tag.trim()).filter(Boolean) 
        : [];
    }
    if (language !== undefined) updateData.language = language;
    if (isActive !== undefined) updateData.isActive = isActive;

    await docRef.update(updateData);

    // Fetch updated document
    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        title: updatedData?.title || '',
        content: updatedData?.content || '',
        category: updatedData?.category || '',
        tags: updatedData?.tags || [],
        language: updatedData?.language || 'both',
        isActive: updatedData?.isActive !== undefined ? updatedData.isActive : true,
        createdAt: updatedData?.createdAt?.toDate?.() || updatedData?.createdAt,
        updatedAt: updatedData?.updatedAt?.toDate?.() || updatedData?.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error updating knowledge base document:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

// DELETE - Delete a knowledge base document (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    await verifyAdmin(token);

    const { documentId } = await params;
    const docRef = adminDb.collection('palmira_knowledge_base').doc(documentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting knowledge base document:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
