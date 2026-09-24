import React from 'react';
import { BookOpen, ChevronRight, Compass } from 'lucide-react';
import SafeImage from '../common/SafeImage.jsx';

export default function TravelDiariesSidebar({
  diaries = [],
  currentSlug = '',
  onNavigate
}) {
  const handleNav = (slug) => {
    if (onNavigate) {
      onNavigate(`/blogs/${slug}`);
    } else if (typeof window !== 'undefined') {
      window.location.href = `/blogs/${slug}`;
    }
  };

  const handleAllBlogs = () => {
    if (onNavigate) {
      onNavigate('/blogs');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/blogs';
    }
  };

  return (
    <aside className="w-full lg:w-60 xl:w-68 2xl:w-72 shrink-0 space-y-4" id="travel-diaries-sidebar">
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#F97316]" />
            <span>My Travel Diaries</span>
          </h4>
        </div>

        <div className="space-y-3">
          {diaries && diaries.length > 0 ? (
            diaries.slice(0, 6).map((d) => {
              const isCurrent = d.slug === currentSlug;
              const imgSrc =
                d.coverImage ||
                d.thumbnail ||
                d.image ||
                'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=300&auto=format&fit=crop&q=80';
              return (
                <div
                  key={d.id || d.slug}
                  onClick={() => handleNav(d.slug)}
                  className={`group cursor-pointer p-2 rounded-xl transition-all border flex items-center gap-3 ${
                    isCurrent
                      ? 'bg-orange-50/80 border-orange-200 shadow-2xs'
                      : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative">
                    <SafeImage
                      src={imgSrc}
                      alt={d.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallbackSrc="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=300&auto=format&fit=crop&q=80"
                      placeholderText={d.title ? d.title.slice(0, 10) : 'Diary'}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-orange-600 block uppercase tracking-wider truncate">
                      {d.category || 'Travelogue'}
                    </span>
                    <h5 className={`text-xs font-semibold leading-snug line-clamp-2 mt-0.5 ${
                      isCurrent ? 'text-slate-900 font-bold' : 'text-slate-700 group-hover:text-[#F97316]'
                    }`}>
                      {d.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {d.publishDate || d.readTime}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400">Loading travel stories...</p>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleAllBlogs}
            className="w-full py-2 px-3 text-xs font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <span>View All Blogs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
