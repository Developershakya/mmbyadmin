import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Search, CheckCircle2, Sparkles, X, Check } from 'lucide-react';
import PageHeader from '../components/admin/PageHeader.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';

export default function DestinationsView({
  destinations = [],
  onAddDestination,
  onDeleteDestination,
  onNavigate
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDest, setNewDest] = useState({
    name: '',
    state: '',
    tagline: '',
    packagesCount: 1,
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
    popularSpot: '',
    status: 'Active'
  });

  const filtered = destinations.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (e) => {
    e.preventDefault();
    if (!newDest.name) return;
    onAddDestination({
      ...newDest,
      id: `DEST-${Date.now().toString().slice(-4)}`
    });
    setModalOpen(false);
    setNewDest({
      name: '',
      state: '',
      tagline: '',
      packagesCount: 1,
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
      popularSpot: '',
      status: 'Active'
    });
  };

  return (
    <div id="destinations-page" className="space-y-6">
      <PageHeader
        title="Destinations & Regions"
        subtitle="Manage travel destinations, state metadata, iconic landmarks, and linked tour packages."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Management' },
          { label: 'Destinations' }
        ]}
        onNavigate={onNavigate}
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination</span>
          </button>
        }
      />

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search state, region, or city..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filtered.length} destination{filtered.length !== 1 ? 's' : ''} available
        </span>
      </div>

      {/* Destination Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((dest) => (
          <div
            key={dest.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <StatusBadge status={dest.status} />
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                  {dest.packagesCount} Tour Packages
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {dest.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">{dest.state}</span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {dest.tagline || 'Experience unmatched culture and breathtaking landscapes.'}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="truncate">Top Spot: {dest.popularSpot || 'City Center & Heritage Sites'}</span>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">{dest.id}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onDeleteDestination(dest)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Delete Destination"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Destination Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Destination</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="pt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Destination Name *</label>
                <input
                  type="text"
                  required
                  value={newDest.name}
                  onChange={(e) => setNewDest({ ...newDest, name: e.target.value })}
                  placeholder="e.g. Udaipur & Mount Abu"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State / Region</label>
                  <input
                    type="text"
                    value={newDest.state}
                    onChange={(e) => setNewDest({ ...newDest, state: e.target.value })}
                    placeholder="e.g. Rajasthan"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Key Landmark / Spot</label>
                  <input
                    type="text"
                    value={newDest.popularSpot}
                    onChange={(e) => setNewDest({ ...newDest, popularSpot: e.target.value })}
                    placeholder="e.g. Lake Pichola"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Photo Image URL</label>
                <input
                  type="url"
                  value={newDest.image}
                  onChange={(e) => setNewDest({ ...newDest, image: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline / Short Intro</label>
                <textarea
                  rows={2}
                  value={newDest.tagline}
                  onChange={(e) => setNewDest({ ...newDest, tagline: e.target.value })}
                  placeholder="The City of Lakes and Royal Palaces..."
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
                  Save Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
