import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Map airport codes to destination names
const codeToDestination = {
  'DEL': 'New Delhi',
  'BOM': 'Mumbai',
  'BLR': 'Bangalore',
  'GOI': 'Goa',
  'SIN': 'Singapore',
  'BKK': 'Bangkok',
  'DXB': 'Dubai',
  // Add more as needed
};

export default function HolidaysRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      // Redirect old /holidays?from=X&to=Y to new /holiday/search?destination=Y
      const { from, to } = router.query;
      
      if (to) {
        // Map airport code to destination name, or use as-is if not mapped
        const destination = codeToDestination[to] || to;
        router.replace(`/holiday/search?destination=${encodeURIComponent(destination)}`);
      } else {
        // If no params, redirect to home
        router.replace('/');
      }
    }
  }, [router.isReady]);

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