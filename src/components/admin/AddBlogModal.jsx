import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function AddBlogModal({
  isOpen,
  onClose,
  onSaveBlog,
  blogToEdit = null,
  categories = []
}) {
  const [formData, setFormData] = useState(
    blogToEdit || {
      title: '',
      category: categories[0]?.name || 'Destinations',
      author: 'Aarav Malhotra',
      status: 'Published',
      readTime: '6 min read',
      views: 0,
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
      excerpt: 'Comprehensive travel tips and essential recommendations for travelers visiting India.'
    }
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newBlog = {
      ...formData,
      id: blogToEdit ? blogToEdit.id : `BLG-${Date.now().toString().slice(-4)}`,
      date: blogToEdit ? blogToEdit.date : '12 Sep 2025'
    };

    onSaveBlog(newBlog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 my-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {blogToEdit ? 'Edit Blog Post' : 'Create New Travel Article'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Draft engaging travel stories, itineraries, and destination guides
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Article Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 10 Hidden Gem Beaches in South Andaman You Must Visit"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white cursor-pointer"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Destinations">Destinations</option>
                    <option value="Travel Tips">Travel Tips</option>
                    <option value="Culture & Heritage">Culture & Heritage</option>
                    <option value="Food & Cuisine">Food & Cuisine</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Publish Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white cursor-pointer"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Author
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Read Time
              </label>
              <input
                type="text"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                placeholder="e.g. 5 min read"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Summary / Excerpt
            </label>
            <textarea
              rows={3}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Article
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
