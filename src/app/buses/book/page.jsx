"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BusBookPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/buses/booking');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
      Redirecting to booking flow...
    </div>
  );
}