import React, { useEffect, useState } from 'react';
import BlogListingView from '../../components/blog/BlogListingView.jsx';

export default function BlogsPage({ onNavigate, category = 'All', search = '' }) {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [blogsRes, catsRes, destsRes] = await Promise.all([
          fetch('/api/blogs?status=Published').then(r => r.json()),
          fetch('/api/blog-categories').then(r => r.json()),
          fetch('/api/destinations').then(r => r.json()).catch(() => ({ destinations: [] }))
        ]);

        if (isMounted) {
          if (blogsRes.success) {
            setBlogs(blogsRes.blogs || []);
          }
          if (catsRes.success) {
            setCategories(catsRes.categories || []);
          }
          if (destsRes.success && destsRes.destinations) {
            setDestinations(destsRes.destinations || []);
          }
        }
      } catch (err) {
        console.error('Failed to load blogs:', err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading && blogs.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading travel stories &amp; guides...</p>
      </div>
    );
  }

  return (
    <BlogListingView
      blogs={blogs}
      categories={categories}
      destinations={destinations}
      initialCategory={category}
      initialSearch={search}
      onNavigate={onNavigate}
    />
  );
}
