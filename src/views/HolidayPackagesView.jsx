import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Sliders,
  Star,
  Clock,
  MapPin,
  Edit2,
  Trash2,
  CheckCircle,
  LayoutGrid,
  List,
  Sparkles
} from 'lucide-react';
import PageHeader from '../components/admin/PageHeader.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';

export default function HolidayPackagesView({
  packages = [],
  onOpenAddPackage,
  onOpenEditPackage,
  onOpenBuilder,
  onEditInBuilder,
  onDeletePackage,
  onNavigate
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    'ALL',
    'Beach & Island',
    'Himalayan Adventure',
    'Heritage & Culture',
    'Nature & Wildlife',
    'Spiritual & Pilgrimage'
  ];

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      if (selectedCategory !== 'ALL' && pkg.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = pkg.name?.toLowerCase().includes(q);
        const matchDest = pkg.destination?.toLowerCase().includes(q);
        if (!matchName && !matchDest) return false;
      }
      return true;
    });
  }, [packages, selectedCategory, searchQuery]);

  return (
    <div id="holiday-packages-page" className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Holiday Packages Management"
        subtitle="Curate, price, and publish signature travel itineraries across Incredible Bharat."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Management' },
          { label: 'Holiday Packages' }
        ]}
        onNavigate={onNavigate}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              id="btn-open-package-builder"
              type="button"
              onClick={onOpenBuilder}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-orange-600 cursor-pointer shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Package Builder (New)</span>
            </button>

            <button
              id="btn-add-package"
              type="button"
              onClick={onOpenAddPackage}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Add</span>
            </button>
          </div>
        }
      />

      {/* Category Pills & Search Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'All Packages' : cat}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter packages..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Package Content: Empty State or Grid / List View */}
      {filteredPackages.length === 0 ? (
        <div id="packages-empty-state" className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No packages found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'No packages match the selected filters or search terms.'
              : 'There are currently no packages saved in the database. Use the Package Builder to curate and publish your signature tours.'}
          </p>
          <button
            id="btn-empty-create-package"
            type="button"
            onClick={onOpenBuilder}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-orange-600 cursor-pointer shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Package Builder</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={pkg.image || pkg.coverImage || 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5'}
                    alt={pkg.name || pkg.packageName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <StatusBadge status={pkg.type || pkg.tagType || 'Customized'} />
                    <StatusBadge status={pkg.status || 'Published'} />
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                    {pkg.duration || pkg.days || '5 Days'}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-slate-700 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      {pkg.destination || pkg.city || 'India'}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {pkg.rating || '4.8'} ({pkg.reviewsCount || 12})
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
                    {pkg.name || pkg.packageName}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Included Badges */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
                    {(pkg.included || (pkg.inclusions?.map(i => i.title || i)) || ['Flights', 'Resort', 'Meals', 'Transfers']).slice(0, 3).map((inc, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        ✓ {typeof inc === 'string' ? inc : inc?.title}
                      </span>
                    ))}
                    {((pkg.included || pkg.inclusions || []).length > 3) && (
                      <span className="text-[10px] text-slate-400">+{(pkg.included || pkg.inclusions).length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Price & Controls */}
              <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-slate-900">
                      ₹{(pkg.price || pkg.offerPrice || pkg.totalPrice || 0).toLocaleString('en-IN')}
                    </span>
                    {(pkg.originalPrice || (pkg.totalPrice && pkg.offerPrice && pkg.totalPrice > pkg.offerPrice)) && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{(pkg.originalPrice || pkg.totalPrice).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{pkg.bookingsCount || 12} Bookings</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => (onEditInBuilder ? onEditInBuilder(pkg) : onOpenEditPackage ? onOpenEditPackage(pkg) : onNavigate(`/admin/packages/builder?id=${pkg.id}`))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-orange-600 hover:text-white hover:bg-orange-600 border border-orange-200 transition-colors cursor-pointer text-xs font-bold"
                    title="Edit in Package Builder"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/admin/packages/customization')}
                    className="p-2 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-50 border border-slate-200 transition-colors cursor-pointer"
                    title="Customize Package Rules"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePackage(pkg)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                    title="Delete Package"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={pkg.image || pkg.coverImage || 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5'}
                        alt={pkg.name || pkg.packageName}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{pkg.name || pkg.packageName}</p>
                        <p className="text-[11px] text-slate-400">{pkg.category || 'Custom Tour'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{pkg.destination || pkg.city}</td>
                  <td className="py-3 px-4 text-slate-600">{pkg.duration || pkg.days}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">₹{(pkg.price || pkg.offerPrice || pkg.totalPrice || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4"><StatusBadge status={pkg.type || pkg.tagType || 'Customized'} /></td>
                  <td className="py-3 px-4"><StatusBadge status={pkg.status || 'Published'} /></td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => (onEditInBuilder ? onEditInBuilder(pkg) : onOpenEditPackage ? onOpenEditPackage(pkg) : onNavigate(`/admin/packages/builder?id=${pkg.id}`))}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-orange-600 hover:text-white hover:bg-orange-600 border border-orange-200 text-xs font-bold cursor-pointer transition-colors"
                        title="Edit in Package Builder"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('/admin/packages/customization')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 cursor-pointer"
                        title="Configure Customization"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePackage(pkg)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete"
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
      )}
    </div>
  );
}
