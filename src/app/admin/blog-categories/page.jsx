"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tags, Plus, Trash2, X, Check, ExternalLink, Loader2 } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";

export default function BlogCategoriesView() {
  const router = useRouter();
  const [blogCategories, setBlogCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    postCount: 0,
  });
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    isDanger: false,
    onConfirm: () => {},
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () =>
    setNewCategory({ name: "", slug: "", description: "", postCount: 0 });

  // ---------- FETCH CATEGORIES ----------
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const res = await fetch("/api/admin/blog-categories", {
        method: "GET",
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to fetch categories");
      }

      // API kisi bhi shape mein de sakti hai: { categories: [] } ya seedha []
      setBlogCategories(data.categories || data.data || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Fetch categories error:", err);
      setFetchError(err.message || "Something went wrong while loading categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ---------- ADD CATEGORY ----------
  const handleAddCategory = async () => {
    const name = newCategory.name?.trim();
    if (!name) {
      showToast("Category title is required.", "error");
      return;
    }

    const category = {
      ...newCategory,
      name,
      slug:
        newCategory.slug?.trim() ||
        name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    };

    try {
      setSaving(true);
      const res = await fetch("/api/admin/blog-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create category");
      }

      setBlogCategories((prev) => [...prev, data.category]);
      showToast(`Category "${category.name}" created.`);
      setModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Create category error:", err);
      showToast(err.message || `Failed to create category "${category.name}".`, "error");
    } finally {
      setSaving(false);
    }
  };

  // ---------- DELETE CATEGORY ----------
  const handleDeleteCategory = (cat) => {
    setConfirmationState({
      isOpen: true,
      title: "Delete Blog Category?",
      message: `Are you sure you want to remove category "${cat.name}"?`,
      confirmText: "Delete Category",
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/blog-categories/${cat.id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to delete category");

          setBlogCategories((prev) => prev.filter((c) => c.id !== cat.id));
          showToast(`Category "${cat.name}" deleted.`, "info");
        } catch (err) {
          console.error("Error deleting category:", err);
          showToast(err.message || "Failed to delete category.", "error");
        } finally {
          setConfirmationState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const toastColors = {
    success: "bg-emerald-600",
    error: "bg-rose-600",
    info: "bg-slate-800",
  };

  return (
    <div id="blog-categories-page" className="space-y-6">
      <PageHeader
        title="Blog Taxonomy & Categories"
        subtitle="Organize articles, customer travelogues, and regional stories into navigable categories."
        breadcrumbs={[
          { label: "Dashboard", path: "/admin/dashboard" },
          { label: "Management" },
          { label: "Blog Categories" },
        ]}
        onNavigate={(path) => router.push(path)}
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
            {loading && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading categories...
                  </div>
                </td>
              </tr>
            )}

            {!loading && fetchError && (
              <tr>
                <td colSpan={5} className="py-10 text-center">
                  <p className="text-rose-600 font-semibold mb-2">{fetchError}</p>
                  <button
                    type="button"
                    onClick={fetchCategories}
                    className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Retry
                  </button>
                </td>
              </tr>
            )}

            {!loading && !fetchError && blogCategories.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400">
                  No categories found. Click "Add Category" to create one.
                </td>
              </tr>
            )}

            {!loading &&
              !fetchError &&
              blogCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Tags className="w-4 h-4 text-orange-600" />
                      {cat.name}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">/{cat.slug}</td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                    {cat.description}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs">
                      {cat.postCount ?? 0}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onNavigate?.(`/blog-category/${cat.slug}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                        title="View Category on Website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete Category"
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

      {/* Add Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Blog Category</h3>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Category Title *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCategory();
                  }}
                  placeholder="e.g. Wildlife & Safaris"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Slug (optional)
                </label>
                <input
                  type="text"
                  value={newCategory.slug}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, slug: e.target.value })
                  }
                  placeholder="auto-generated from title"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, description: e.target.value })
                  }
                  placeholder="Articles on national parks, tiger reserves..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#F97316] text-white hover:bg-orange-600 font-semibold flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmationState.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              {confirmationState.title}
            </h3>
            <p className="mt-2 text-xs text-slate-600">{confirmationState.message}</p>
            <div className="mt-5 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  setConfirmationState((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmationState.onConfirm}
                className={`px-4 py-2 rounded-xl text-white font-semibold ${
                  confirmationState.isDanger
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-[#F97316] hover:bg-orange-600"
                }`}
              >
                {confirmationState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[70] px-4 py-2.5 rounded-xl text-white text-xs font-semibold shadow-lg ${
            toastColors[toast.type] || toastColors.success
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}