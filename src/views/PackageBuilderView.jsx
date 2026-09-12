import React from 'react';
import TravelProPackageBuilder from '../components/package-builder/TravelProPackageBuilder.jsx';

export default function PackageBuilderView({
  initialPackage = null,
  onSavePackage,
  onCancel,
  onNavigate,
  showToast
}) {
  return (
    <div id="holiday-package-builder-container" className="w-full max-w-7xl mx-auto">
      <TravelProPackageBuilder
        initialPackage={initialPackage}
        onNavigate={onNavigate || onCancel}
        onSavePackage={onSavePackage}
        showToast={showToast}
      />
    </div>
  );
}
