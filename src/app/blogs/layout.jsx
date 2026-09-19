import React from 'react';
import AppHeader from '../../components/blog/AppHeader.jsx';
import AppFooter from '../../components/blog/AppFooter.jsx';

/**
 * Next.js App Router Layout for /blogs and /blog-category
 */
export default function BlogLayout({ children, currentPath, onNavigate }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased selection:bg-orange-100 selection:text-orange-900">
      <AppHeader currentPath={currentPath} onNavigate={onNavigate} />
      <main className="flex-1 w-full">
        {children}
      </main>
      <AppFooter onNavigate={onNavigate} />
    </div>
  );
}
