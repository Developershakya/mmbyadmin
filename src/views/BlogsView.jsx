import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  Search,
  Sparkles,
  Utensils,
  MapPin,
  Compass,
  Layers,
  CheckCircle2,
  Eye
} from 'lucide-react';
import PageHeader from '../components/admin/PageHeader.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';

export default function BlogsView({
  blogs = [],
  categories = [],
  onOpenAddBlog,
  onOpenEditBlog,
  onDeleteBlog,
  onNavigate
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  const filtered = blogs.filter((b) => {
    if (selectedCat !== 'ALL' && b.category !== selectedCat) return false;
    if (selectedType !== 'ALL' && b.blogType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = b.title && b.title.toLowerCase().includes(q);
      const matchAuthor = b.author && b.author.toLowerCase().includes(q);
      const matchSlug = b.slug && b.slug.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchSlug) return false;
    }
    return true;
  });

  const handleNav = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const getBlogTypeIcon = (type) => {
    switch (type) {
      case 'food':
        return <Utensils className="w-3.5 h-3.5 text-amber-500" />;
      case 'top_list':
        return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      case 'destination':
      default:
        return <Compass className="w-3.5 h-3.5 text-[#F97316]" />;
    }
  };

  const getBlogTypeLabel = (type) => {
    switch (type) {
      case 'food':
        return 'Food Trail';
      case 'top_list':
        return 'Top 10 / 5';
      case 'destination':
      default:
        return 'Destination';
    }
  };

  return (
    <div id="blogs-admin-page" className="space-y-6">
      <PageHeader
        title="Travel Blogs & Articles"
        subtitle="Manage dynamic travelogues, food trails, and curated guides with Places and Transit integrations."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Management' },
          { label: 'Blogs' }
        ]}
        onNavigate={onNavigate}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNav('/blogs')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              <span>View Blog Frontend</span>
            </button>
            <button
              type="button"
              onClick={onOpenAddBlog}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Write Article</span>
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Category:</span>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden"
            >
              <option value="ALL">All Blog Types</option>
              <option value="destination">Destination</option>
              <option value="top_list">Top 10 / 5 List</option>
              <option value="food">Food Trail</option>
            </select>
          </div>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, author, or slug..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                <th className="py-3.5 px-4">Article</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Published Date</th>
                <th className="py-3.5 px-4">Places &amp; Route</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold">No travel articles found.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try adjusting your filters or write a new article.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((blog) => (
                  <tr key={blog.id || blog.slug} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={blog.coverImage || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=120'}
                          alt=""
                          className="w-12 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <p className="font-bold text-slate-900 truncate leading-snug group-hover:text-[#F97316] transition-colors" title={blog.title}>
                            {blog.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            /blogs/{blog.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {getBlogTypeIcon(blog.blogType)}
                        <span>{getBlogTypeLabel(blog.blogType)}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {blog.category}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {blog.author || 'Editorial'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {blog.publishDate}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span title="Places Explored" className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                          {Array.isArray(blog.placesExplored) ? blog.placesExplored.length : 0} Places
                        </span>
                        <span title="Route Stops" className="px-1.5 py-0.5 rounded bg-orange-50 text-[#F97316] font-bold">
                          {Array.isArray(blog.journeyRoute) ? blog.journeyRoute.length : 0} Stops
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={blog.status || 'Published'} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleNav(`/blogs/${blog.slug}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="View on Website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenEditBlog(blog)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                          title="Edit Article"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteBlog(blog.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
