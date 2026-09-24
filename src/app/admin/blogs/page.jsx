"use client";
import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  Sparkles,
  Utensils,
  Compass,
  Loader2,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import AddBlogModal from "@/components/admin/AddBlogModal";
function countArraySafe(value) {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "null" || trimmed === "[]") return 0;
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }
  return 0;
}

function getPlacesCount(blog) {
  const explored = countArraySafe(blog?.placesExplored);
  if (explored > 0) return explored;
  return countArraySafe(blog?.placesCovered);
}
export default function BlogsView({ onNavigate }) {
  const [blogs, setBlogs] = useState([]);
  const [blogCategories, setBlogCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");

  // Modal state: separate "is open" from "data inside it"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlogData, setEditingBlogData] = useState(null); // null = create mode
  const [editLoadingId, setEditLoadingId] = useState(null); // which row is being fetched

  const [toast, setToast] = useState(null); // { message, type }
  const [confirmState, setConfirmState] = useState({ isOpen: false });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBlogs = async () => {
    try {
      const [blogRes, categoryRes] = await Promise.all([
        fetch("/api/admin/blogs"),
        fetch("/api/admin/blog-categories"),
      ]);
      const blogData = await blogRes.json();
      const categoryData = await categoryRes.json();
      setBlogs(Array.isArray(blogData) ? blogData : blogData.blogs || []);
      setBlogCategories(
        Array.isArray(categoryData)
          ? categoryData
          : categoryData.categories || [],
      );
    } catch (error) {
      console.error("Error loading blogs:", error?.message);
      showToast("Failed to load blogs", "error");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filtered = blogs.filter((b) => {
    if (selectedCat !== "ALL" && b.category !== selectedCat) return false;
    if (selectedType !== "ALL" && b.blogType !== selectedType) return false;
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
    if (onNavigate) onNavigate(path);
    else if (typeof window !== "undefined") window.location.href = path;
  };

  // Open modal for a NEW article
  const handleOpenCreate = () => {
    setEditingBlogData(null);
    setIsModalOpen(true);
  };

  // Open modal for EDIT — fetch fresh data from API first, THEN open modal
  const handleOpenEditBlog = async (blogRow) => {
    const id = blogRow.id;
    setEditLoadingId(id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`);
      const data = await res.json();
      const fullBlog = data.blog || data.data || data; // adapt to your API's response shape

      if (!fullBlog || data.success === false) {
        throw new Error(data.error || "Could not load article");
      }

      setEditingBlogData(fullBlog);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching blog for edit:", err);
      showToast(`Could not load article: ${err.message}`, "error");
    } finally {
      setEditLoadingId(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlogData(null);
  };

  // Add / Edit Blog (Persisted to Database)
  const handleSaveBlog = async (blogData) => {
    try {
      const isEditing = !!editingBlogData?.id;
      const url = isEditing
        ? `/api/admin/blogs/${editingBlogData.id}`
        : "/api/admin/blogs";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogData),
      });
      const data = await res.json();

      if (data.success) {
        showToast(
          isEditing
            ? `Article "${blogData.title}" updated.`
            : `Article "${blogData.title}" published!`,
        );
        fetchBlogs(); // refresh list
        handleCloseModal();
      } else {
        showToast(`Failed to save: ${data.error || "Server error"}`, "error");
      }
    } catch (err) {
      console.error("Error saving blog:", err);
      showToast(`Error saving article: ${err.message}`, "error");
    }
  };

  const handleDeleteBlog = (blogRow) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Blog Article?",
      message: `Are you sure you want to delete "${blogRow.title || "this article"}"? This will permanently remove it from the public blog and database.`,
      confirmText: "Delete Article",
      isDanger: true,
      onConfirm: async () => {
        try {
          await fetch(`/api/admin/blogs/${blogRow.id}`, { method: "DELETE" });
          setBlogs((prev) => prev.filter((b) => b.id !== blogRow.id));
          showToast("Article deleted.", "info");
        } catch (err) {
          console.error("Error deleting blog:", err);
          showToast("Failed to delete article", "error");
        }
        setConfirmState({ isOpen: false });
      },
    });
  };

  const getBlogTypeIcon = (type) => {
    switch (type) {
      case "food":
        return <Utensils className="w-3.5 h-3.5 text-amber-500" />;
      case "top_list":
        return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-[#F97316]" />;
    }
  };

  const getBlogTypeLabel = (type) => {
    switch (type) {
      case "food":
        return "Food Trail";
      case "top_list":
        return "Top 10 / 5";
      default:
        return "Destination";
    }
  };

  return (
    <div id="blogs-admin-page" className="space-y-6">
      <PageHeader
        title="Travel Blogs & Articles"
        subtitle="Manage dynamic travelogues, food trails, and curated guides with Places and Transit integrations."
        breadcrumbs={[
          { label: "Dashboard", path: "/admin/dashboard" },
          { label: "Management" },
          { label: "Blogs" },
        ]}
        onNavigate={onNavigate}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNav("/blogs")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              <span>View Blog Frontend</span>
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Category:</span>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              {blogCategories.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

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
                    <p className="text-[11px] text-slate-400 mt-1">
                      Try adjusting your filters or write a new article.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id || b.slug}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            b.coverImage ||
                            "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=120"
                          }
                          alt=""
                          className="w-12 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <p
                            className="font-bold text-slate-900 truncate leading-snug group-hover:text-[#F97316] transition-colors"
                            title={b.title}
                          >
                            {b.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            /blogs/{b.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {getBlogTypeIcon(b.blogType)}
                        <span>{getBlogTypeLabel(b.blogType)}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {b.category}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {b.author || "Editorial"}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {b.publishDate}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span
                          title="Places Explored"
                          className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold"
                        >
                          {getPlacesCount(b)} Places
                        </span>
                        <span
                          title="Route Stops"
                          className="px-1.5 py-0.5 rounded bg-orange-50 text-[#F97316] font-bold"
                        >
                          {countArraySafe(b.journeyRoute)} Stops
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={b.status || "Published"} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleNav(`/blogs/${b.slug}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="View on Website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditBlog(b)}
                          disabled={editLoadingId === b.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50"
                          title="Edit Article"
                        >
                          {editLoadingId === b.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Edit2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlog(b)}
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

      {isModalOpen && (
        <AddBlogModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveBlog}
          categories={blogCategories}
          initialData={editingBlogData}
        />
      )}

      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-[999] px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-slate-900 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[998] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-3">
            <h4 className="font-bold text-slate-900">{confirmState.title}</h4>
            <p className="text-xs text-slate-600">{confirmState.message}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmState({ isOpen: false })}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmState.onConfirm}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white"
              >
                {confirmState.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
