import { Suspense } from 'react';
import ForgotPasswordClient from '@/components/ForgotPasswordClient';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordClient />
    </Suspense>
  );
}

