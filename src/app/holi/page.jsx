"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Map airport codes to destination names
const codeToDestination = {
  DEL: 'New Delhi',
  BOM: 'Mumbai',
  BLR: 'Bangalore',
  GOI: 'Goa',
  SIN: 'Singapore',
  BKK: 'Bangkok',
  DXB: 'Dubai',
};

export default function HolidaysRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const to = searchParams.get('to');

    if (to) {
      const destination = codeToDestination[to.toUpperCase()] || to;
      router.replace(`/holiday/search?destination=${encodeURIComponent(destination)}`);
      return;
    }

    router.replace('/');
  }, [router, searchParams]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontSize: '18px',
      color: '#666'
    }}>
      Redirecting to holiday search...
    </div>
  );
}