import Footer from '@/components/Footer.jsx';
import Header from '@/components/Header.jsx';
import React from 'react';


/**
 * Next.js App Router Layout for /blogs and /blog-category
 */
export default function BlogLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased selection:bg-orange-100 selection:text-orange-900">
      <Header />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
