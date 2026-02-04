'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallManagementPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/admin');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting to admin portal...</p>
    </div>
  );
}
