import { adminAuth, adminDb } from './firebase-admin';

/**
 * Check if a user is an admin
 * Admins are determined by:
 * 1. Having isAdmin: true in their user document, OR
 * 2. Having their email in the ADMIN_EMAILS environment variable (comma-separated)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    // Check user document for isAdmin flag
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      
      // Check isAdmin flag first
      if (userData?.isAdmin === true) {
        return true;
      }
      
      // Check if user email is in admin emails list (from user document)
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
      const userEmail = userData?.email?.toLowerCase();
      
      if (userEmail && adminEmails.length > 0 && adminEmails.includes(userEmail)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Verify that the authenticated user is an admin
 * Returns the userId if admin, throws error otherwise
 */
export async function verifyAdmin(token: string): Promise<string> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    return userId;
  } catch (error: any) {
    throw new Error(error.message || 'Unauthorized: Admin access required');
  }
}
