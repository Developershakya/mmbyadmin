import React, { useEffect, useState } from 'react';
import FoodBlogView from '../../../components/blog/FoodBlogView.jsx';
import DestinationBlogView from '../../../components/blog/DestinationBlogView.jsx';
import TopListBlogView from '../../../components/blog/TopListBlogView.jsx';
import { Compass, ArrowLeft } from 'lucide-react';

export default function BlogDetailPage({ slug, params, onNavigate }) {
  const blogSlug = slug || (params && params.slug);
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchBlogDetail() {
      if (!blogSlug) return;
      try {
        setLoading(true);
        setError(null);

        const [detailRes, listRes] = await Promise.all([
          fetch(`/api/blogs/${encodeURIComponent(blogSlug)}`).then(r => r.json()),
          fetch('/api/blogs?status=Published&limit=10').then(r => r.json())
        ]);

        if (isMounted) {
          if (detailRes.success && detailRes.blog) {
            setBlog(detailRes.blog);
          } else {
            setError(detailRes.error || 'Blog post not found');
          }

          if (listRes.success) {
            setAllBlogs(listRes.blogs || []);
          }
        }
      } catch (err) {
        console.error('Error fetching blog detail:', err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBlogDetail();

    return () => {
      isMounted = false;
    };
  }, [blogSlug]);

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading travel story...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
          <Compass className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Blog Not Found</h2>
        <p className="text-sm text-slate-600">
          The requested travel article could not be located or has been unpublished.
        </p>
        <button
          type="button"
          onClick={() => onNavigate ? onNavigate('/blogs') : (window.location.href = '/blogs')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F97316] text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all travel stories</span>
        </button>
      </div>
    );
  }

  // Dynamic layout selection based on blogType
  if (blog.blogType === 'food') {
    return <FoodBlogView blog={blog} allBlogs={allBlogs} onNavigate={onNavigate} />;
  }

  if (blog.blogType === 'destination') {
    return <DestinationBlogView blog={blog} allBlogs={allBlogs} onNavigate={onNavigate} />;
  }

  // Default to Top List / General travel guide
  return <TopListBlogView blog={blog} allBlogs={allBlogs} onNavigate={onNavigate} />;
}
