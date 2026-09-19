import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Clock,
  IndianRupee,
  Layers,
  Power,
  ExternalLink,
  Calendar,
  AlertCircle
} from 'lucide-react';
import PageHeader from '../components/admin/PageHeader.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import ConfirmationModal from '../components/admin/ConfirmationModal.jsx';
import SightseeingModal from '../components/admin/SightseeingModal.jsx';
import SightseeingDetailModal from '../components/admin/SightseeingDetailModal.jsx';

export default function SightseeingView({ onNavigate, onShowToast }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingPlace, setViewingPlace] = useState(null);

  // Delete confirmation
  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    place: null,
    isReferenced: false,
    referenceCount: 0,
    references: [],
    isLoading: false
  });

  const showToast = (msg, type = 'success') => {
    if (onShowToast) {
      onShowToast(msg, type);
    }
  };

  // Fetch Sightseeing places
  const fetchPlaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sightseeing');
      const data = await res.json();
      if (data.success && Array.isArray(data.sightseeing)) {
        setPlaces(data.sightseeing);
      } else {
        throw new Error(data.error || 'Failed to load sightseeing places.');
      }
    } catch (err) {
      console.error('Error fetching sightseeing:', err);
      setError(err.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  // Compute unique filter options
  const uniqueCities = useMemo(() => {
    const set = new Set();
    places.forEach((p) => {
      const c = p.city || p.cityName;
      if (c) set.add(c.trim());
    });
    return Array.from(set).sort();
  }, [places]);

  const uniqueStates = useMemo(() => {
    const set = new Set();
    places.forEach((p) => {
      if (p.state && p.state.trim()) set.add(p.state.trim());
    });
    return Array.from(set).sort();
  }, [places]);

  const uniqueCategories = useMemo(() => {
    const set = new Set();
    places.forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category.trim());
    });
    return Array.from(set).sort();
  }, [places]);

  // Filtered places
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      // Status filter
      if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;

      // City filter
      if (selectedCity !== 'ALL') {
        const c = p.city || p.cityName;
        if (!c || c.toLowerCase() !== selectedCity.toLowerCase()) return false;
      }

      // State filter
      if (selectedState !== 'ALL' && (!p.state || p.state.toLowerCase() !== selectedState.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name && p.name.toLowerCase().includes(q);
        const matchCity = (p.city || p.cityName) && (p.city || p.cityName).toLowerCase().includes(q);
        const matchState = p.state && p.state.toLowerCase().includes(q);
        const matchCategory = p.category && p.category.toLowerCase().includes(q);
        const matchLocation = p.location && p.location.toLowerCase().includes(q);
        const matchSlug = p.slug && p.slug.toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchState && !matchCategory && !matchLocation && !matchSlug) {
          return false;
        }
      }

      return true;
    });
  }, [places, searchQuery, selectedCity, selectedState, selectedCategory, selectedStatus]);

  // Save (Create or Update)
  const handleSavePlace = async (formData) => {
    const isEdit = Boolean(formData.id);
    const url = isEdit ? `/api/sightseeing/${formData.id}` : '/api/sightseeing';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        showToast(
          isEdit
            ? `Sightseeing place "${formData.name}" updated successfully.`
            : `Sightseeing place "${formData.name}" added successfully.`
        );
        setFormModalOpen(false);
        setEditingPlace(null);
        fetchPlaces();
      } else {
        showToast(data.error || 'Failed to save sightseeing place.', 'error');
      }
    } catch (err) {
      console.error('Save sightseeing error:', err);
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Toggle Active / Inactive
  const handleToggleStatus = async (place) => {
    const targetStatus = place.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`/api/sightseeing/${place.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Place "${place.name}" is now ${targetStatus}.`);
        setPlaces((prev) =>
          prev.map((p) => (p.id === place.id ? { ...p, status: targetStatus } : p))
        );
        if (viewingPlace && viewingPlace.id === place.id) {
          setViewingPlace((prev) => ({ ...prev, status: targetStatus }));
        }
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast(`Error updating status: ${err.message}`, 'error');
    }
  };

  // Delete initiation
  const handleDeleteClick = async (place) => {
    // Check references first by attempting delete check
    try {
      const res = await fetch(`/api/sightseeing/${place.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.isReferenced) {
        // Referenced in packages or blogs
        setDeleteConfirmState({
          isOpen: true,
          place,
          isReferenced: true,
          referenceCount: data.referenceCount,
          references: data.references || [],
          isLoading: false
        });
      } else if (data.success) {
        showToast(`Sightseeing place "${place.name}" deleted.`, 'info');
        setPlaces((prev) => prev.filter((p) => p.id !== place.id));
      } else {
        showToast(data.error || 'Failed to delete sightseeing place.', 'error');
      }
    } catch (err) {
      console.error('Delete check error:', err);
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Confirm delete or force delete
  const handleConfirmDelete = async (force = false) => {
    if (!deleteConfirmState.place) return;
    setDeleteConfirmState((prev) => ({ ...prev, isLoading: true }));

    try {
      const url = `/api/sightseeing/${deleteConfirmState.place.id}${force ? '?force=true' : ''}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        showToast(`Sightseeing place "${deleteConfirmState.place.name}" deleted.`, 'info');
        setPlaces((prev) => prev.filter((p) => p.id !== deleteConfirmState.place.id));
        setDeleteConfirmState({
          isOpen: false,
          place: null,
          isReferenced: false,
          referenceCount: 0,
          references: [],
          isLoading: false
        });
      } else {
        showToast(data.error || 'Failed to delete record.', 'error');
        setDeleteConfirmState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
      setDeleteConfirmState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div id="sightseeing-management-page" className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Sightseeing Management"
        subtitle="Manage sightseeing places and locations used across blogs, itinerary builder, package builder and other parts of the website."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Management' },
          { label: 'Sightseeing Management' }
        ]}
        onNavigate={onNavigate}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchPlaces}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Refresh Sightseeing Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingPlace(null);
                setFormModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Sightseeing</span>
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* City Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500">City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden max-w-[150px]"
              >
                <option value="ALL">All Cities ({uniqueCities.length})</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden max-w-[170px]"
              >
                <option value="ALL">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(selectedCity !== 'ALL' ||
              selectedCategory !== 'ALL' ||
              selectedStatus !== 'ALL' ||
              searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCity('ALL');
                  setSelectedState('ALL');
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, city, state, or location..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Counter strip */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{filteredPlaces.length}</strong> of{' '}
            <strong>{places.length}</strong> total sightseeing places
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{places.filter((p) => p.status === 'Active').length} Active</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>{places.filter((p) => p.status === 'Inactive').length} Inactive</span>
            </span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchPlaces}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Table / Data View */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                <th className="py-3.5 px-4">Sightseeing Place</th>
                <th className="py-3.5 px-4">City &amp; State</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Duration &amp; Timings</th>
                <th className="py-3.5 px-4">Entry Fee</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                // Loading Skeleton Rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg bg-slate-200" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3.5 bg-slate-200 rounded w-36" />
                          <div className="h-2.5 bg-slate-100 rounded w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3 bg-slate-200 rounded w-20" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3 bg-slate-200 rounded w-28" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3 bg-slate-200 rounded w-24" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3 bg-slate-200 rounded w-16" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="h-5 bg-slate-200 rounded-full w-16 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="h-6 bg-slate-200 rounded w-16 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredPlaces.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                    <p className="text-sm font-bold text-slate-700">No sightseeing places found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      No attractions match your active filters. Try adjusting your search query or
                      register a new place.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlace(null);
                        setFormModalOpen(true);
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 transition-colors shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Sightseeing Place</span>
                    </button>
                  </td>
                </tr>
              ) : (
                // Data Rows
                filteredPlaces.map((place) => (
                  <tr
                    key={place.id}
                    className="hover:bg-slate-50/80 transition-colors group text-slate-700"
                  >
                    {/* Place Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            place.image ||
                            'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80'
                          }
                          alt={place.name}
                          className="w-12 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <p
                            className="font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors cursor-pointer"
                            title={place.name}
                            onClick={() => {
                              setViewingPlace(place);
                              setDetailModalOpen(true);
                            }}
                          >
                            {place.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                            <span>#{place.id}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {place.slug}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* City & State */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>{place.city || place.cityName || '—'}</span>
                      </div>
                      {place.state && (
                        <span className="text-[11px] text-slate-400 ml-5 block">
                          {place.state}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-700 border border-slate-200/80">
                        {place.category || 'Monument'}
                      </span>
                    </td>

                    {/* Duration & Timings */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{place.duration || '2 - 3 Hours'}</span>
                      </p>
                      {(place.openingTime || place.closingTime) && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {place.openingTime || '09:00 AM'} - {place.closingTime || '06:00 PM'}
                        </p>
                      )}
                    </td>

                    {/* Entry Fee */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                        <IndianRupee className="w-3 h-3 text-emerald-600" />
                        <span>{place.entryFee || 'Free'}</span>
                      </span>
                    </td>

                    {/* Status with Direct Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(place)}
                        title={`Click to set as ${
                          place.status === 'Active' ? 'Inactive' : 'Active'
                        }`}
                        className="cursor-pointer hover:opacity-85 transition-opacity"
                      >
                        <StatusBadge status={place.status || 'Active'} />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => {
                            setViewingPlace(place);
                            setDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="View Complete Place Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Place */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPlace(place);
                            setFormModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                          title="Edit Sightseeing Place"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Place */}
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(place)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Sightseeing Place"
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

      {/* Add / Edit Sightseeing Modal */}
      <SightseeingModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingPlace(null);
        }}
        onSave={handleSavePlace}
        initialData={editingPlace}
        existingCities={uniqueCities}
      />

      {/* Sightseeing Detail Modal */}
      <SightseeingDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setViewingPlace(null);
        }}
        place={viewingPlace}
        onEdit={(place) => {
          setEditingPlace(place);
          setFormModalOpen(true);
        }}
        onToggleStatus={handleToggleStatus}
      />

      {/* Reference Safety Warning Modal (if place is referenced in packages/blogs) */}
      {deleteConfirmState.isReferenced && (
        <div
          id="reference-warning-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            id="reference-warning-modal"
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-200 animate-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Referenced Sightseeing Place
                </h3>
                <p className="text-xs text-slate-500">
                  Used in existing packages or blog articles
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>"{deleteConfirmState.place?.name}"</strong> is currently referenced in{' '}
              <strong>{deleteConfirmState.referenceCount} tour package(s) or blog article(s)</strong>
              . Hard deleting it may break itinerary links.
            </p>

            {deleteConfirmState.references?.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-32 overflow-y-auto space-y-1 text-[11px] text-slate-600">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                  Active References:
                </span>
                {deleteConfirmState.references.map((refStr, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-700">
                    <span>•</span>
                    <span className="truncate">{refStr}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-800 text-xs">
              <p className="font-semibold">Recommended action:</p>
              <p className="text-[11px] mt-0.5">
                Set status to <strong>Inactive</strong>. This safely removes it from public suggestions
                while preserving existing bookings and itineraries.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleToggleStatus(deleteConfirmState.place);
                  setDeleteConfirmState({
                    isOpen: false,
                    place: null,
                    isReferenced: false,
                    referenceCount: 0,
                    references: [],
                    isLoading: false
                  });
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Set as Inactive (Recommended)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteConfirmState({
                      isOpen: false,
                      place: null,
                      isReferenced: false,
                      referenceCount: 0,
                      references: [],
                      isLoading: false
                    })
                  }
                  className="flex-1 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmDelete(true)}
                  disabled={deleteConfirmState.isLoading}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {deleteConfirmState.isLoading ? 'Deleting...' : 'Force Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
