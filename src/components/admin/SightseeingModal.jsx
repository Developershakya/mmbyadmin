import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Camera,
  Upload,
  Sparkles,
  Clock,
  Calendar,
  IndianRupee,
  Layers,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Image as ImageIcon,
  Compass,
  Navigation,
  Search,
  Globe,
  Loader2,
  Check
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Monument & Heritage',
  'Royal Forts & Palaces',
  'Sacred Temples & Pilgrimage',
  'Adventure & Nature',
  'High Altitude Scenic Pass',
  'Nature Trek & Waterfalls',
  'Beach & Watersports',
  'Wildlife & Safari',
  'Scenic Viewpoint',
  'Museum & Culture',
  'Leisure & Shopping',
  'Hill Station Attraction'
];

const DURATION_OPTIONS = [
  '1 - 2 Hours',
  '2 - 3 Hours',
  '3 - 4 Hours',
  'Half Day (4 - 5 Hours)',
  'Full Day (6 - 8 Hours)'
];

export default function SightseeingModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  existingCities = []
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    city: '',
    state: '',
    country: 'India',
    location: '',
    latitude: '',
    longitude: '',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
    gallery: [],
    shortDescription: '',
    description: '',
    category: 'Monument & Heritage',
    duration: '2 - 3 Hours',
    bestTimeToVisit: 'October to March',
    entryFee: 'Free Entry',
    openingTime: '09:00 AM',
    closingTime: '06:00 PM',
    status: 'Active'
  });

  const [galleryInput, setGalleryInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Google Maps / Place Geocoding search states
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');
  const [locationProvider, setLocationProvider] = useState('');

  // Initialize or reset form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        city: initialData.city || initialData.cityName || '',
        state: initialData.state || '',
        country: initialData.country || 'India',
        location: initialData.location || '',
        latitude: initialData.latitude ? String(initialData.latitude) : '',
        longitude: initialData.longitude ? String(initialData.longitude) : '',
        image: initialData.image || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
        gallery: Array.isArray(initialData.gallery) ? [...initialData.gallery] : [],
        shortDescription: initialData.shortDescription || '',
        description: initialData.description || initialData.masterDescription || '',
        category: initialData.category || 'Monument & Heritage',
        duration: initialData.duration || '2 - 3 Hours',
        bestTimeToVisit: initialData.bestTimeToVisit || 'October to March',
        entryFee: initialData.entryFee || 'Free Entry',
        openingTime: initialData.openingTime || '09:00 AM',
        closingTime: initialData.closingTime || '06:00 PM',
        status: initialData.status || 'Active'
      });
      setSlugManuallyEdited(Boolean(initialData.slug));
    } else {
      setFormData({
        name: '',
        slug: '',
        city: '',
        state: '',
        country: 'India',
        location: '',
        latitude: '',
        longitude: '',
        image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
        gallery: [],
        shortDescription: '',
        description: '',
        category: 'Monument & Heritage',
        duration: '2 - 3 Hours',
        bestTimeToVisit: 'October to March',
        entryFee: 'Free Entry',
        openingTime: '09:00 AM',
        closingTime: '06:00 PM',
        status: 'Active'
      });
      setSlugManuallyEdited(false);
    }
    setErrors({});
    setActiveTab('general');
  }, [initialData, isOpen]);

  // Helper to slugify
  const slugify = (text) => {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Auto-generate slug when name or city changes if not manually overridden
  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, name: val };
      if (!slugManuallyEdited) {
        const combined = prev.city ? `${val} ${prev.city}` : val;
        updated.slug = slugify(combined);
      }
      return updated;
    });
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: null }));
    }
  };

  const handleCityChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, city: val };
      if (!slugManuallyEdited && prev.name) {
        updated.slug = slugify(`${prev.name} ${val}`);
      }
      return updated;
    });
    if (errors.city) {
      setErrors((prev) => ({ ...prev, city: null }));
    }
  };

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    setFormData({ ...formData, slug: slugify(e.target.value) });
  };

  // Google Maps & Places Geocoding Search Handler
  const handleSearchLocation = async (queryToSearch) => {
    const query = (queryToSearch !== undefined ? queryToSearch : mapSearchQuery).trim();
    if (!query || query.length < 2) return;

    setIsSearchingLocation(true);
    setLocationSuccessMsg('');
    try {
      const res = await fetch(`/api/places/geocode?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setMapSearchResults(data.results);
        setLocationProvider(data.provider || 'maps');
      } else {
        setMapSearchResults([]);
      }
    } catch (err) {
      console.warn('Location search error:', err);
      setMapSearchResults([]);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Auto-apply selected location result to all fields: City, State/Region, Country, Full Location, GPS
  const handleApplyLocation = (item) => {
    if (!item) return;
    setFormData((prev) => ({
      ...prev,
      city: item.city || prev.city,
      state: item.state || prev.state,
      country: item.country || prev.country || 'India',
      location: item.location || prev.location,
      latitude: item.latitude !== undefined && item.latitude !== null ? String(item.latitude) : prev.latitude,
      longitude: item.longitude !== undefined && item.longitude !== null ? String(item.longitude) : prev.longitude
    }));

    if (errors.city) setErrors((prev) => ({ ...prev, city: null }));
    if (errors.latitude) setErrors((prev) => ({ ...prev, latitude: null }));
    if (errors.longitude) setErrors((prev) => ({ ...prev, longitude: null }));

    setLocationSuccessMsg(
      `✓ Auto-filled: ${item.name ? item.name + ' — ' : ''}${item.city ? item.city + ', ' : ''}${item.state ? item.state + ', ' : ''}${item.country} [Lat: ${item.latitude}, Lng: ${item.longitude}]`
    );
    setMapSearchResults([]);
  };

  const handleAutoFillFromNameAndCity = () => {
    const combined = [formData.name, formData.city].filter(Boolean).join(' ');
    if (!combined) {
      alert('Please enter a Place Name or City first.');
      return;
    }
    setMapSearchQuery(combined);
    handleSearchLocation(combined);
  };

  // Image file upload via FileReader
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData((prev) => ({ ...prev, image: uploadEvent.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Add gallery image
  const handleAddGalleryImage = () => {
    if (!galleryInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, galleryInput.trim()]
    }));
    setGalleryInput('');
  };

  const handleRemoveGalleryImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== idx)
    }));
  };

  // Form validation
  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Place name is required.';
    }
    if (!formData.city.trim()) {
      errs.city = 'City is required.';
    }
    if (formData.latitude && formData.latitude.trim() !== '') {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errs.latitude = 'Latitude must be between -90 and 90.';
      }
    }
    if (formData.longitude && formData.longitude.trim() !== '') {
      const lon = parseFloat(formData.longitude);
      if (isNaN(lon) || lon < -180 || lon > 180) {
        errs.longitude = 'Longitude must be between -180 and 180.';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Focus on first tab with error
      if (errors.name || errors.city || errors.latitude || errors.longitude) {
        if (errors.latitude || errors.longitude || errors.city) {
          setActiveTab('location');
        } else {
          setActiveTab('general');
        }
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        id: initialData?.id,
        slug: formData.slug || slugify(`${formData.name} ${formData.city}`)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="sightseeing-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="sightseeing-modal"
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Sightseeing Place' : 'Add New Sightseeing Place'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Update attraction specifications, timings, coordinates, and descriptions.'
                  : 'Register a landmark with coordinates, category, duration, and imagery.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0 bg-white pt-2">
          {[
            { id: 'general', label: 'General Info' },
            { id: 'location', label: 'Location & Map' },
            { id: 'descriptions', label: 'Descriptions' },
            { id: 'visiting', label: 'Visiting Details' },
            { id: 'media', label: 'Photos & Media' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Sightseeing Name <span className="text-rose-500">*</span>
                  </label>
                  {formData.name.trim().length >= 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('location');
                        handleAutoFillFromNameAndCity();
                      }}
                      className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-orange-500" />
                      <span>Auto-fetch Region & GPS</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Amber Fort & Palace"
                  className={`w-full h-10 px-3.5 rounded-xl border bg-slate-50/80 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 ${
                    errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Slug / URL Identifier
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    placeholder="e.g. amber-fort-palace-jaipur"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs text-slate-700 font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Auto-generated from name and city.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catalog Status
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={() => setFormData({ ...formData, status: 'Active' })}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active (Live on website & suggestions)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={formData.status === 'Inactive'}
                      onChange={() => setFormData({ ...formData, status: 'Inactive' })}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Inactive (Draft / Hidden)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOCATION & MAP */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              {/* Google Maps / Geocoding Place Search Box */}
              <div className="bg-gradient-to-r from-orange-50/80 via-amber-50/60 to-emerald-50/80 border border-orange-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-2xs shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>Search Location on Google / Maps</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Auto-fills City, Region, Country & GPS
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Search any monument, temple, fort, city, or address to automatically fetch state/region, full address, country, and latitude/longitude.
                      </p>
                    </div>
                  </div>

                  {(formData.name || formData.city) && (
                    <button
                      type="button"
                      onClick={handleAutoFillFromNameAndCity}
                      className="text-[11px] font-bold text-orange-700 hover:text-orange-800 bg-white border border-orange-300 hover:border-orange-400 px-3 py-1.5 rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 self-start sm:self-auto active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      <span>Auto-detect "{[formData.name, formData.city].filter(Boolean).join(' ')}"</span>
                    </button>
                  )}
                </div>

                {/* Search input with live results */}
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={mapSearchQuery}
                        onChange={(e) => {
                          setMapSearchQuery(e.target.value);
                          if (e.target.value.trim().length >= 3) {
                            handleSearchLocation(e.target.value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearchLocation();
                          }
                        }}
                        placeholder="Search place, monument or city (e.g. Amer Fort Jaipur, Prem Mandir Vrindavan, Taj Mahal, Calangute Goa)..."
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-orange-200 bg-white text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-2xs"
                      />
                      {isSearchingLocation && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] text-orange-600 font-semibold">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                          <span>Searching...</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isSearchingLocation || !mapSearchQuery.trim()}
                      onClick={() => handleSearchLocation()}
                      className="h-10 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search</span>
                    </button>
                  </div>

                  {/* Dropdown Suggestions */}
                  {mapSearchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1.5 bg-white rounded-xl shadow-xl border border-orange-200 max-h-64 overflow-y-auto divide-y divide-slate-100 animate-in fade-in">
                      <div className="px-3.5 py-1.5 bg-orange-50/70 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>Click any suggestion to auto-fill Region, Full Location, Country & Coordinates:</span>
                        <span className="capitalize text-orange-700 font-bold bg-orange-100/80 px-1.5 py-0.2 rounded">
                          {locationProvider || 'Maps'} API
                        </span>
                      </div>
                      {mapSearchResults.map((resItem, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleApplyLocation(resItem)}
                          className="p-3 hover:bg-orange-50/80 cursor-pointer transition-colors flex items-start justify-between gap-3 group"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 block group-hover:text-orange-700 truncate">
                                {resItem.name}
                              </span>
                              <p className="text-[11px] text-slate-600 line-clamp-1">
                                {resItem.location || `${resItem.city}, ${resItem.state}, ${resItem.country}`}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 flex-wrap">
                                {resItem.city && (
                                  <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-700">
                                    City: <strong>{resItem.city}</strong>
                                  </span>
                                )}
                                {resItem.state && (
                                  <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-700">
                                    State: <strong>{resItem.state}</strong>
                                  </span>
                                )}
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-700">
                                  GPS: <strong>{resItem.latitude}, {resItem.longitude}</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-[10px] font-bold text-white bg-orange-600 hover:bg-orange-700 px-2.5 py-1 rounded-md shrink-0 shadow-2xs group-hover:bg-orange-700"
                          >
                            ✓ Auto-Fill
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {locationSuccessMsg && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{locationSuccessMsg}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLocationSuccessMsg('')}
                        className="text-[10px] text-emerald-600 hover:text-emerald-800 shrink-0 font-bold"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="city-suggestions"
                    value={formData.city}
                    onChange={handleCityChange}
                    placeholder="e.g. Jaipur"
                    className={`w-full h-10 px-3.5 rounded-xl border bg-slate-50/80 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 ${
                      errors.city ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  />
                  <datalist id="city-suggestions">
                    {existingCities.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                  {errors.city && <p className="text-[11px] text-rose-500 mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Rajasthan"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. India"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Location / Address
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Amer, Jaipur, Rajasthan 302028"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Navigation className="w-4 h-4 text-orange-500" />
                    <span>Geographic Coordinates (GPS)</span>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-orange-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Preview on Google Maps</span>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Latitude (e.g. 26.9855)
                    </label>
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) => {
                        setFormData({ ...formData, latitude: e.target.value });
                        if (errors.latitude) setErrors({ ...errors, latitude: null });
                      }}
                      placeholder="e.g. 26.9855"
                      className={`w-full h-9 px-3 rounded-lg border bg-white text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500 ${
                        errors.latitude ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {errors.latitude && (
                      <p className="text-[10px] text-rose-500 mt-0.5">{errors.latitude}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Longitude (e.g. 75.8513)
                    </label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={(e) => {
                        setFormData({ ...formData, longitude: e.target.value });
                        if (errors.longitude) setErrors({ ...errors, longitude: null });
                      }}
                      placeholder="e.g. 75.8513"
                      className={`w-full h-9 px-3 rounded-lg border bg-white text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500 ${
                        errors.longitude ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {errors.longitude && (
                      <p className="text-[10px] text-rose-500 mt-0.5">{errors.longitude}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DESCRIPTIONS */}
          {activeTab === 'descriptions' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Summary (Cards &amp; Itinerary overview)
                </label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief 1-2 sentence highlight for travel itineraries..."
                  maxLength={300}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Displayed on tour package day cards &amp; quick hover previews.</span>
                  <span>{formData.shortDescription.length}/300</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Detailed Description (Master narrative &amp; guide)
                </label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Elaborate history, architectural style, cultural legends, photography tips, and visiting highlights..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 4: VISITING DETAILS */}
          {activeTab === 'visiting' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Recommended Duration
                  </label>
                  <input
                    type="text"
                    list="duration-list"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 2 - 3 Hours"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                  <datalist id="duration-list">
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Best Time To Visit
                  </label>
                  <input
                    type="text"
                    value={formData.bestTimeToVisit}
                    onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                    placeholder="e.g. October to March / Sunrise"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Entry Ticket / Fee Structure
                </label>
                <input
                  type="text"
                  value={formData.entryFee}
                  onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                  placeholder="e.g. Free Entry or ₹50 for Indians, ₹500 for Foreigners"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Opening Time
                  </label>
                  <input
                    type="text"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    placeholder="e.g. 09:00 AM or Sunrise"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Closing Time
                  </label>
                  <input
                    type="text"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    placeholder="e.g. 06:00 PM or Sunset"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PHOTOS & MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Cover Image
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                  <label className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-200 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Cover Image Preview */}
                {formData.image && (
                  <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                    <img
                      src={formData.image}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                        Main Cover
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery Section */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Gallery Images
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    placeholder="Paste image URL..."
                    className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs text-slate-900 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="px-3 h-9 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Gallery</span>
                  </button>
                </div>

                {formData.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formData.gallery.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="relative h-24 rounded-lg overflow-hidden border border-slate-200 group bg-slate-50"
                      >
                        <img
                          src={imgUrl}
                          alt={`Gallery ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(i)}
                          className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white opacity-90 hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    No extra gallery photos added yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Saving Place...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Create Sightseeing Place'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
