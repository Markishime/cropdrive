import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAdmin } from '@/lib/admin';

// PUT: Update a blog post (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    await verifyAdmin(token);

    const { postId } = await params;
    const postData = await req.json();

    // Check if post exists
    const postRef = adminFirestore.collection('blog_posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Update post
    await postRef.update({
      ...postData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedPost = await postRef.get();
    const postDataWithId = {
      id: updatedPost.id,
      ...updatedPost.data(),
      date: updatedPost.data()?.date?.toDate?.()?.toISOString() || updatedPost.data()?.date,
      createdAt: updatedPost.data()?.createdAt?.toDate?.()?.toISOString(),
      updatedAt: updatedPost.data()?.updatedAt?.toDate?.()?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      post: postDataWithId,
      message: 'Blog post updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a blog post (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    await verifyAdmin(token);

    const { postId } = await params;

    // Check if post exists
    const postRef = adminFirestore.collection('blog_posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Delete post
    await postRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
