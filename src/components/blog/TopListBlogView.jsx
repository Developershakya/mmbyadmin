import React from 'react';
import { Calendar, Clock, Star, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import TravelDiariesSidebar from './TravelDiariesSidebar.jsx';
import JourneyTimeline from './JourneyTimeline.jsx';
import PlacesCoveredSection from './PlacesCoveredSection.jsx';
import RightRailSidebar from './RightRailSidebar.jsx';
import SafeImage from '../common/SafeImage.jsx';

export default function TopListBlogView({ blog, allBlogs = [], onNavigate }) {
  return (
    <article className="max-w-[1720px] w-full mx-auto px-3 sm:px-5 lg:px-6 xl:px-8 py-8" id="toplist-blog-article">
      <div className="flex flex-col lg:flex-row gap-5 xl:gap-7 items-start">
        {/* Left Column: Travel Diaries */}
        <TravelDiariesSidebar
          diaries={allBlogs}
          currentSlug={blog.slug}
          onNavigate={onNavigate}
        />

        {/* Center Main Guide */}
        <main className="flex-1 min-w-0 w-full">
          {/* Badge & Rating */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-orange-100 text-[#F97316] rounded-full inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {blog.category || 'Top 10 Guide'}
            </span>
            {blog.rating && (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{blog.rating} ({blog.ratingCount || 150})</span>
              </span>
            )}
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {blog.title}
          </h1>
          {blog.excerpt && (
            <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 my-4 py-2.5 border-y border-slate-100">
            <span className="font-semibold text-slate-800">{blog.author || 'Bharat Yatra Editorial'}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{blog.publishDate || '20 May 2026'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{blog.readTime || '8 min read'}</span>
            </span>
          </div>

          {/* Hero Cover Image */}
          <div className="aspect-16/9 rounded-2xl overflow-hidden shadow-md bg-slate-100 mb-8 relative">
            <SafeImage
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover"
              fallbackSrc="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop"
              placeholderText={blog.title}
            />
          </div>

          {/* Info Grid: Highlights & Quick Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Highlights Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F97316]" />
                <span>Highlights of this Guide</span>
              </h3>
              <ul className="space-y-2">
                {(blog.highlights && blog.highlights.length > 0
                  ? blog.highlights
                  : [
                      'Best time to visit and seasonal insights',
                      'Hidden places list with route tips',
                      'Travel tips for offbeat explorers',
                      'Where to stay & authentic homestays'
                    ]
                ).map((hl, hIdx) => (
                  <li key={hIdx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-[#F97316] font-bold mt-0.5">•</span>
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Info Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
                Quick Trip Info
              </h3>
              <div className="space-y-2.5">
                {(blog.quickInfo && blog.quickInfo.length > 0
                  ? blog.quickInfo
                  : [
                      { label: 'Best Time to Visit', value: 'March to June, Sept to Nov' },
                      { label: 'Ideal Duration', value: '5 – 7 Days' },
                      { label: 'Trip Budget', value: '₹ 8,000 – ₹ 15,000' },
                      { label: 'Difficulty Level', value: 'Easy to Moderate' }
                    ]
                ).map((qi, qIdx) => (
                  <div key={qIdx} className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">{qi.label}</span>
                    <span className="font-bold text-slate-900 text-right">{qi.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Journey Route Timeline (if any) */}
          {blog.journeyRoute && blog.journeyRoute.length > 0 && (
            <JourneyTimeline
              route={blog.journeyRoute}
              stats={blog.journeyStats || blog.tripSnapshot}
            />
          )}

          {/* Places Covered Grid */}
          <PlacesCoveredSection places={(blog.placesCovered && blog.placesCovered.length > 0) ? blog.placesCovered : (blog.placesExplored || [])} />

          {/* Concluding Paragraph / Content */}
          {blog.content && (
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Final Verdict</h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {blog.content}
              </p>
            </div>
          )}
        </main>

        {/* Right Rail Sidebar */}
        <RightRailSidebar
          snapshot={blog.tripSnapshot}
          tips={blog.tips}
          destination={blog.category || 'Himachal Pradesh'}
          journeyRoute={blog.journeyRoute}
          stats={blog.journeyStats || blog.tripSnapshot}
          onNavigate={onNavigate}
        />
      </div>
    </article>
  );
}
