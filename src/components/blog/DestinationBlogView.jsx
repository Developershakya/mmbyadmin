import React from 'react';
import { Calendar, Clock, Star, MapPin, Compass } from 'lucide-react';
import TravelDiariesSidebar from './TravelDiariesSidebar.jsx';
import JourneyTimeline from './JourneyTimeline.jsx';
import PlacesExploredSection from './PlacesExploredSection.jsx';
import ExperienceSection from './ExperienceSection.jsx';
import RightRailSidebar from './RightRailSidebar.jsx';
import SafeImage from '../common/SafeImage.jsx';

export default function DestinationBlogView({ blog, allBlogs = [], onNavigate }) {
  return (
    <article className="max-w-[1720px] w-full mx-auto px-3 sm:px-5 lg:px-6 xl:px-8 py-8" id="destination-blog-article">
      {/* 3-Column Layout: Left Diaries Sidebar, Center Main Travelogue, Right Snapshot Rail */}
      <div className="flex flex-col lg:flex-row gap-5 xl:gap-7 items-start">
        {/* Left Sidebar */}
        <TravelDiariesSidebar
          diaries={allBlogs}
          currentSlug={blog.slug}
          onNavigate={onNavigate}
        />

        {/* Center Main Column */}
        <main className="flex-1 min-w-0 w-full">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-orange-100 text-[#F97316] rounded-full inline-flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              {blog.category || 'Spiritual Journey'}
            </span>
            {blog.rating && (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{blog.rating} ({blog.ratingCount || 128})</span>
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
              <span>{blog.publishDate || '12 Oct 2026'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{blog.readTime || '5 min read'}</span>
            </span>
          </div>

          {/* Hero Image */}
          <div className="aspect-16/9 rounded-2xl overflow-hidden shadow-md bg-slate-100 mb-8 relative">
            <SafeImage
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover"
              fallbackSrc="https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=1200&auto=format&fit=crop"
              placeholderText={blog.title}
            />
          </div>

          {/* My Journey Route Timeline */}
          <JourneyTimeline
            route={blog.journeyRoute}
            stats={blog.journeyStats || blog.tripSnapshot}
          />

          {/* Places I Explored */}
          <PlacesExploredSection places={(blog.placesExplored && blog.placesExplored.length > 0) ? blog.placesExplored : (blog.placesCovered || [])} />

          {/* Body Content paragraph */}
          {blog.content && (
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Travel Highlights</h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {blog.content}
              </p>
            </div>
          )}

          {/* My Experience & Photos */}
          <ExperienceSection experience={blog.experience} />
        </main>

        {/* Right Rail Sidebar */}
        <RightRailSidebar
          snapshot={blog.tripSnapshot}
          tips={blog.tips}
          destination={blog.category || 'Vrindavan'}
          journeyRoute={blog.journeyRoute}
          stats={blog.journeyStats || blog.tripSnapshot}
          onNavigate={onNavigate}
        />
      </div>
    </article>
  );
}
