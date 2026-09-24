'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TravelProPackageBuilder from '@/components/package-builder/TravelProPackageBuilder.jsx';

export default function PackageDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const packageId = resolvedParams?.id;
  const [initialPackage, setInitialPackage] = useState(null);

  useEffect(() => {
    if (!packageId) {
      setInitialPackage(null);
      return;
    }

    let isMounted = true;

    fetch(`/api/admin-srdv/package?id=${encodeURIComponent(packageId)}`, {
      method: 'GET',
      cache: 'no-store'
    })
      .then(async (res) => {
        const text = await res.text();
        let data = {};
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = { raw: text };
          }
        }

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to fetch package');
        }

        if (isMounted) {
          setInitialPackage(data?.package || null);
        }
      })
      .catch((err) => {
        console.warn('Failed to load package for builder:', err);
        if (isMounted) setInitialPackage(null);
      });

    return () => {
      isMounted = false;
    };
  }, [packageId]);

  return (
    <div id="holiday-package-builder-container" className="w-full max-w-7xl mx-auto">
      <TravelProPackageBuilder
        initialPackage={initialPackage}
        onNavigate={(path) => router.push(path)}
        onSavePackage={() => {}}
        showToast={(message, type) => console.log(message, type)}
      />
    </div>
  );
}
