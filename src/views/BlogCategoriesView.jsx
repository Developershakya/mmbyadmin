import React, { useState } from 'react';
import { Tags, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import PageHeader from '../components/admin/PageHeader.jsx';

export default function BlogCategoriesView({
  categories = [],
  onAddCategory,
  onDeleteCategory,
  onNavigate
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '', postCount: 0 });

  const handleSave = (e) => {
    e.preventDefault();
    if (!newCategory.name) return;
    onAddCategory({
      ...newCategory,
      id: `CAT-${Date.now().toString().slice(-4)}`,
      slug: newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, '-')
    });
    setModalOpen(false);
    setNewCategory({ name: '', slug: '', description: '', postCount: 0 });
  };

  return (
    <div id="blog-categories-page" className="space-y-6">
      <PageHeader
        title="Blog Taxonomy & Categories"
        subtitle="Organize articles, customer travelogues, and regional stories into navigable categories."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Management' },
          { label: 'Blog Categories' }
        ]}
        onNavigate={onNavigate}
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
              <th className="py-3.5 px-4">Category Name</th>
              <th className="py-3.5 px-4">URL Slug</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4 text-center">Published Articles</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <Tags className="w-4 h-4 text-orange-600" />
                  {cat.name}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">/{cat.slug}</td>
                <td className="py-3.5 px-4 text-slate-600 max-w-sm">{cat.description}</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs">
                    {cat.postCount}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Blog Category</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="pt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Title *</label>
                <input
                  type="text"
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g. Wildlife & Safaris"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Articles on national parks, tiger reserves..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F97316] text-white hover:bg-orange-600 font-semibold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
