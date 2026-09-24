import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Clock,
  Star,
  ArrowRight,
  TrendingUp,
  Compass,
  MapPin,
  Sparkles,
  Flame,
  Tag,
  Layers,
  Utensils,
  Mountain,
  Landmark,
  Home,
  BookOpen
} from 'lucide-react';
import SafeImage from '../common/SafeImage.jsx';

const getCategoryIcon = (name = '', iconKey = '') => {
  const n = (name || '').toLowerCase();
  const key = (iconKey || '').toLowerCase();
  if (key === 'mappin' || n.includes('destination')) return <MapPin className="w-5 h-5 shrink-0" />;
  if (key === 'compass' || n.includes('tip')) return <Compass className="w-5 h-5 shrink-0" />;
  if (key === 'utensils' || n.includes('food') || n.includes('cuisine')) return <Utensils className="w-5 h-5 shrink-0" />;
  if (key === 'sparkles' || n.includes('spiritual')) return <Sparkles className="w-5 h-5 shrink-0" />;
  if (key === 'mountain' || n.includes('adventure')) return <Mountain className="w-5 h-5 shrink-0" />;
  if (key === 'landmark' || n.includes('culture')) return <Landmark className="w-5 h-5 shrink-0" />;
  if (key === 'home' || n.includes('stay')) return <Home className="w-5 h-5 shrink-0" />;
  if (key === 'bookopen' || n.includes('guide')) return <BookOpen className="w-5 h-5 shrink-0" />;
  return <Tag className="w-5 h-5 shrink-0" />;
};

export default function BlogListingView({
  blogs = [],
  categories = [],
  destinations = [],
  initialCategory = 'All',
  initialSearch = '',
  onNavigate
}) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'top_list' | 'food' | 'destination'

  const navTo = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchSearch =
        !searchQuery.trim() ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.excerpt && b.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        !selectedCategory ||
        selectedCategory.toLowerCase() === 'all' ||
        (b.category && b.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (b.categorySlug && b.categorySlug.toLowerCase() === selectedCategory.toLowerCase());

      const matchTab =
        activeTab === 'all' || b.blogType === activeTab;

      return matchSearch && matchCategory && matchTab;
    });
  }, [blogs, searchQuery, selectedCategory, activeTab]);

  // Featured blogs
  const featuredMain = blogs[0] || null;
  const featuredSides = blogs.slice(1, 3);

  // Trending blogs
  const trendingBlogs = blogs.slice(0, 5);

  return (
    <div className="pb-16" id="blog-listing-root">
      {/* 1. Hero Search Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 text-white py-14 sm:py-18 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F97316_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Bharat Yatra Chronicles
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Travel Stories &amp; Guides
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Discover travel tips, destination guides, food walks, and stories from real journeys across India.
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl overflow-hidden p-1.5">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places, food trails, spiritual yatras..."
                className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-700 px-2"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                className="px-5 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Filter Pills (Icon on top, text below) */}
      <div className="bg-white border-b border-slate-200 sticky top-18 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex flex-col items-center justify-center gap-1.5 min-w-[76px] cursor-pointer ${
                selectedCategory.toLowerCase() === 'all'
                  ? 'bg-[#F97316] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-5 h-5 shrink-0" />
              <span className="whitespace-nowrap text-center">All Articles</span>
            </button>
            {categories.map((cat) => {
              const isSelected =
                selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                selectedCategory.toLowerCase() === (cat.slug || '').toLowerCase();
              return (
                <button
                  key={cat.id || cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex flex-col items-center justify-center gap-1.5 min-w-[76px] cursor-pointer ${
                    isSelected
                      ? 'bg-[#F97316] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {getCategoryIcon(cat.name, cat.icon)}
                  <span className="whitespace-nowrap text-center">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-14">
        {/* 3. Featured Stories Section (Shown when no search/filter active) */}
        {!searchQuery && selectedCategory.toLowerCase() === 'all' && featuredMain && (
          <section id="featured-stories">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F97316]" />
                <span>Featured Stories</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Main Featured Card */}
              <div
                onClick={() => navTo(`/blogs/${featuredMain.slug}`)}
                className="lg:col-span-7 group cursor-pointer bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="aspect-16/10 w-full overflow-hidden bg-slate-100 relative">
                  <SafeImage
                    src={featuredMain.coverImage}
                    alt={featuredMain.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fallbackSrc="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80"
                    placeholderText={featuredMain.title}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold">
                      {featuredMain.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#F97316] transition-colors leading-snug">
                      {featuredMain.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                      {featuredMain.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">{featuredMain.author}</span>
                    <div className="flex items-center gap-3">
                      <span>{featuredMain.publishDate}</span>
                      <span>·</span>
                      <span>{featuredMain.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Stacked Featured Cards */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {featuredSides.map((sideBlog) => (
                  <div
                    key={sideBlog.id || sideBlog.slug}
                    onClick={() => navTo(`/blogs/${sideBlog.slug}`)}
                    className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex-1 flex flex-col sm:flex-row"
                  >
                    <div className="sm:w-48 aspect-4/3 sm:aspect-auto overflow-hidden bg-slate-100 relative shrink-0">
                      <SafeImage
                        src={sideBlog.coverImage}
                        alt={sideBlog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        fallbackSrc="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80"
                        placeholderText={sideBlog.title}
                      />
                      <div className="absolute top-3 left-3 sm:hidden">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                          {sideBlog.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="hidden sm:inline-block text-[10px] font-bold uppercase text-[#F97316] tracking-wider mb-1">
                          {sideBlog.category}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-[#F97316] transition-colors leading-snug line-clamp-2">
                          {sideBlog.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {sideBlog.excerpt}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{sideBlog.publishDate}</span>
                        <span>{sideBlog.readTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Dynamic Destination Cards Section (Populated from real DB /api/destinations) */}
        {destinations && destinations.length > 0 && (
          <section id="explore-destinations" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#F97316]" />
                <span>Explore by Destination</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {destinations.slice(0, 6).map((dest) => (
                <div
                  key={dest.id || dest.name}
                  onClick={() => {
                    setSelectedCategory(dest.name);
                    const el = document.getElementById('latest-articles');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group cursor-pointer bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all text-center flex flex-col items-center"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2 relative">
                    <SafeImage
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      fallbackSrc="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400&auto=format&fit=crop&q=80"
                      placeholderText={dest.name}
                    />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#F97316] transition-colors truncate w-full">
                    {dest.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {dest.packagesCount > 0 ? `${dest.packagesCount} Package${dest.packagesCount > 1 ? 's' : ''}` : 'Featured Spot'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Latest Articles Section */}
        <section id="latest-articles">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {searchQuery || selectedCategory !== 'All' ? 'Filtered Articles' : 'Latest Articles'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredBlogs.length} articles
              </p>
            </div>

            {/* Sub-tabs for Blog Types */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('top_list')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'top_list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Top Lists
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('food')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'food' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Food Trails
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('destination')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'destination' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Destinations
              </button>
            </div>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Compass className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No matching articles found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for different keywords or reset your category filters to explore all travel stories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setActiveTab('all');
                }}
                className="px-4 py-2 bg-[#F97316] text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((b) => (
                <div
                  key={b.id || b.slug}
                  onClick={() => navTo(`/blogs/${b.slug}`)}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-16/10 w-full overflow-hidden bg-slate-100 relative">
                    <SafeImage
                      src={b.coverImage}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      fallbackSrc="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80"
                      placeholderText={b.title}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold">
                        {b.category}
                      </span>
                    </div>
                    {b.rating && (
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-700 flex items-center gap-1 shadow-xs">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{b.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#F97316] transition-colors leading-snug line-clamp-2">
                        {b.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {b.excerpt}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{b.publishDate}</span>
                      <span className="font-bold text-[#F97316] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Read Story</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 5. Trending Now Section */}
        <section id="trending-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="w-5 h-5 text-[#F97316]" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Trending Now
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {trendingBlogs.map((tb, idx) => (
              <div
                key={tb.id || tb.slug}
                onClick={() => navTo(`/blogs/${tb.slug}`)}
                className="group cursor-pointer flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <span className="text-2xl font-black text-slate-300 group-hover:text-[#F97316] transition-colors shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-orange-600 block uppercase tracking-wider truncate">
                    {tb.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#F97316] transition-colors leading-snug line-clamp-2 mt-0.5">
                    {tb.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {tb.readTime || '6 min read'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
