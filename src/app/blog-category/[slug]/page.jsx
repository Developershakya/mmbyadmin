import React from 'react';
import BlogsPage from '../../blogs/page.jsx';

export default function CategoryPage({ slug, params, onNavigate }) {
  const categorySlug = slug || (params && params.slug) || '';

  // Format slug to human readable category
  const formattedCategory = categorySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <BlogsPage
      onNavigate={onNavigate}
      category={formattedCategory}
    />
  );
}
