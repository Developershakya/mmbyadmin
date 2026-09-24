'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext.jsx';
import TravelProPackageBuilder from '@/components/package-builder/TravelProPackageBuilder.jsx';

export default function PackageDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const packageId = resolvedParams?.id;
  const { handleSaveBuilderPackage, showToast, packages } = useAdmin();

  const foundPackage = packageId ? packages.find(p => String(p.id) === String(packageId)) : null;

  return (
    <div id="holiday-package-builder-container" className="w-full max-w-7xl mx-auto">
      <TravelProPackageBuilder
        initialPackage={foundPackage}
        onNavigate={(path) => router.push(path)}
        onSavePackage={handleSaveBuilderPackage}
        showToast={showToast}
      />
    </div>
  );
}
