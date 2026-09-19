import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Star,
  ChevronRight,
  Share2,
  Check,
  Utensils,
  ArrowLeft
} from 'lucide-react';
import FoodDishesSection from './FoodDishesSection.jsx';
import FoodPlacesSection from './FoodPlacesSection.jsx';
import FoodTipsSection from './FoodTipsSection.jsx';

export default function FoodBlogView({ blog, onNavigate }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navTo = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return (
    <article className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8" id="food-blog-article">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
        <button type="button" onClick={() => navTo('/blogs')} className="hover:text-slate-900 transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button type="button" onClick={() => navTo('/blogs')} className="hover:text-slate-900 transition-colors">
          Blog
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button type="button" onClick={() => navTo(`/blog-category/food`)} className="hover:text-slate-900 transition-colors">
          Food
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold truncate max-w-xs">{blog.title}</span>
      </nav>

      {/* Hero Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-orange-100 text-[#F97316] rounded-full inline-flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5" />
            {blog.category || 'Food & Cuisine'}
          </span>
          {blog.rating && (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{blog.rating} ({blog.ratingCount || 94})</span>
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {blog.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 pt-3 border-t border-slate-200/80 text-xs sm:text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{blog.author || 'Bharat Yatra Editorial'}</span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{blog.publishDate || '15 Jun 2026'}</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{blog.readTime || '7 min read'}</span>
          </span>
        </div>

        {/* Hero Cover Image */}
        <div className="mt-6 aspect-21/9 w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg bg-slate-100 relative">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      {/* Layout with Table of Contents + Content Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Sticky Table of Contents Sidebar */}
        <aside className="lg:col-span-3 order-2 lg:order-1">
          <div className="sticky top-24 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Table of Contents
            </h4>
            <nav className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => scrollToSection('overview')}
                className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 font-medium transition-colors"
              >
                1. Overview
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('dishes')}
                className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 font-medium transition-colors"
              >
                2. Must Try Dishes
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('places')}
                className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 font-medium transition-colors"
              >
                3. Best Places to Eat
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('tips')}
                className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 font-medium transition-colors"
              >
                4. Food Tips
              </button>
            </nav>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>Share Guide</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Column */}
        <main className="lg:col-span-9 order-1 lg:order-2">
          {/* Overview Paragraph */}
          <section className="mb-8 scroll-mt-24" id="overview">
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              {blog.content || blog.excerpt}
            </p>

            {/* Quick Info Strip */}
            {Array.isArray(blog.quickInfo) && blog.quickInfo.length > 0 && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {blog.quickInfo.map((qi, qIdx) => (
                  <div key={qIdx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {qi.label}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 block">
                      {qi.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Must Try Dishes Grid */}
          <FoodDishesSection dishes={blog.foodDishes} />

          {/* Best Places to Eat Grid */}
          <FoodPlacesSection places={blog.foodPlaces} />

          {/* Food Tips Split Section */}
          <FoodTipsSection tips={blog.tips} image={blog.tipsImage} />

          {/* Share Callout Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md mb-8">
            <div>
              <h3 className="text-lg font-bold">Loved this food guide?</h3>
              <p className="text-xs text-slate-300 mt-1">
                Share this culinary trail with your fellow travel &amp; food enthusiasts!
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Back Navigation Strip */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navTo('/blogs')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#F97316] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all travel stories</span>
            </button>
          </div>
        </main>
      </div>
    </article>
  );
}
