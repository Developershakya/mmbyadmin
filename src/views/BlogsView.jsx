import React, { useState } from 'react';
import { FileText, Plus, Edit2, Trash2, Eye, Calendar, User, Search } from 'lucide-react';
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

  const filtered = blogs.filter((b) => {
    if (selectedCat !== 'ALL' && b.category !== selectedCat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div id="blogs-page" className="space-y-6">
      <PageHeader
        title="Travel Blogs & Articles"
        subtitle="Publish insider travel guides, cultural deep-dives, packing tips, and tourist stories."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Management' },
          { label: 'Blogs' }
        ]}
        onNavigate={onNavigate}
        actions={
          <button
            type="button"
            onClick={onOpenAddBlog}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
        }
      />

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Category:</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
              <th className="py-3.5 px-4">Article</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Author</th>
              <th className="py-3.5 px-4">Published Date</th>
              <th className="py-3.5 px-4">Views</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((blog) => (
              <tr key={blog.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="max-w-md">
                      <p className="font-bold text-slate-900 leading-snug">{blog.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{blog.excerpt}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-700">{blog.category}</td>
                <td className="py-3.5 px-4 text-slate-600">{blog.author}</td>
                <td className="py-3.5 px-4 text-slate-500">{blog.date}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-700">
                  {blog.views?.toLocaleString('en-IN') || 0}
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={blog.status} />
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenEditBlog(blog)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      title="Edit Post"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteBlog(blog)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
