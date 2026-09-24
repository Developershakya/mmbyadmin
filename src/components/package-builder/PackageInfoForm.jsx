import React from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Check,
  Building,
  Tag
} from 'lucide-react';
import StepperControl from './StepperControl.jsx';
import AutocompleteInput from './AutocompleteInput.jsx';

const PRESET_COVERS = [
  {
    name: 'Manali, Himachal',
    url: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Goa Beaches',
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Kashmir Valley',
    url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Kerala Backwaters',
    url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Ladakh Mountains',
    url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Rajasthan Palaces',
    url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Dubai Skyline',
    url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop'
  }
];

const CATEGORY_TAGS = [
  'Honeymoon Special',
  'Family Holiday',
  'Adventure & Trekking',
  'Hill Station',
  'Beach Vacation',
  'Weekend Getaway',
  'Luxury Resort',
  'Pilgrimage & Spiritual',
  'Wildlife Safari'
];

export default function PackageInfoForm({
  packageData,
  setPackageData,
  onContinue,
  showToast
}) {
  const travelers = packageData.travelers || { adults: 2, children: 0, infants: 0 };
  const daysCount = packageData.days ? packageData.days.length : 4;
  const nightsCount = packageData.nights || Math.max(daysCount - 1, 1);
  const selectedTags = packageData.tags || ['Family Holiday', 'Hill Station'];
  const highlights = packageData.highlights || [
    'Scenic mountain transfer in private AC cab',
    'Stay in 4-star mountain view resort with breakfast',
    'Full day guided excursion to Solang Valley & Rohtang Pass',
    'Dedicated 24x7 local on-ground tour coordinator'
  ];

  // Helper to calculate end date: startDate + (days - 1)
  const computeEndDate = (startStr, days) => {
    if (!startStr) return '';
    const parts = startStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dateObj = new Date(y, m, d);
      dateObj.setDate(dateObj.getDate() + Math.max(0, days - 1));
      const resY = dateObj.getFullYear();
      const resM = String(dateObj.getMonth() + 1).padStart(2, '0');
      const resD = String(dateObj.getDate()).padStart(2, '0');
      return `${resY}-${resM}-${resD}`;
    }
    return '';
  };

  // Handle Days count change: nights is strictly auto-calculated as (days - 1)
  const handleDaysChange = (newDays) => {
    if (newDays < 1) return;
    const currentDays = [...(packageData.days || [])];
    if (newDays > currentDays.length) {
      // Add days
      const needed = newDays - currentDays.length;
      for (let i = 0; i < needed; i++) {
        const nextNum = currentDays.length + 1;
        currentDays.push({
          id: `day-${Date.now()}-${nextNum}`,
          title: `Day ${nextNum} - Exploration & Activities`,
          location: packageData.destination || 'Manali',
          description: 'Explore scenic attractions, local markets, and cultural landmarks.',
          collapsed: false,
          services: []
        });
      }
    } else if (newDays < currentDays.length) {
      // Trim days
      currentDays.length = newDays;
    }

    const calculatedNights = Math.max(0, newDays - 1);
    const calculatedEndDate = computeEndDate(packageData.startDate || '2026-07-07', newDays);

    setPackageData((prev) => ({
      ...prev,
      days: currentDays,
      nights: calculatedNights,
      endDate: calculatedEndDate
    }));
  };

  const handleStartDateChange = (newStartDate) => {
    const calculatedEndDate = computeEndDate(newStartDate, daysCount);
    setPackageData((prev) => ({
      ...prev,
      startDate: newStartDate,
      endDate: calculatedEndDate
    }));
  };

  const toggleTag = (tag) => {
    const exists = selectedTags.includes(tag);
    const updated = exists
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setPackageData((prev) => ({ ...prev, tags: updated }));
  };

  const handleAddHighlight = () => {
    setPackageData((prev) => ({
      ...prev,
      highlights: [...highlights, 'New package highlight / inclusion']
    }));
  };

  const handleUpdateHighlight = (index, val) => {
    const updated = [...highlights];
    updated[index] = val;
    setPackageData((prev) => ({ ...prev, highlights: updated }));
  };

  const handleRemoveHighlight = (index) => {
    const updated = highlights.filter((_, i) => i !== index);
    setPackageData((prev) => ({ ...prev, highlights: updated }));
  };

  return (
    <div id="package-info-form" className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Package Basic Information</h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure destination, tour title, duration, travelers, and visual presentation.
            </p>
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition cursor-pointer shadow-xs active:scale-98 self-start sm:self-auto"
          >
            <span>Continue to Itinerary</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5">
          {/* Package Title */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
              Package Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={packageData.title || ''}
              onChange={(e) => setPackageData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. 5 Days / 4 Nights Magical Manali & Rohtang Pass Tour"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-[#0F172A] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
            />
          </div>

          {/* Destination City Autocomplete (uses /api/cities/cab) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
              Destination City <span className="text-red-500">*</span>
            </label>
            <AutocompleteInput
              value={packageData.destination || ''}
              onChange={(e) => setPackageData((prev) => ({ ...prev, destination: e.target.value, city: e.target.value }))}
              onSelect={(item) => {
                setPackageData((prev) => ({
                  ...prev,
                  destination: item.label,
                  city: item.label,
                  destinationId: item.code
                }));
                if (showToast) showToast(`Selected Destination: ${item.label}`, 'info');
              }}
              suggestUrl="/api/cities/cab"
              placeholder="Search destination (e.g. Goa, Manali, Jaipur)"
              iconType="car"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Suggestions loaded via Devtunnel / Local City Aggregator
            </p>
          </div>

          {/* Starting / Origin City Autocomplete (uses /api/cities/airports) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
              Starting / Origin City
            </label>
            <AutocompleteInput
              value={packageData.originCity || 'Delhi'}
              onChange={(e) => setPackageData((prev) => ({ ...prev, originCity: e.target.value }))}
              onSelect={(item) => {
                setPackageData((prev) => ({ ...prev, originCity: item.label }));
              }}
              suggestUrl="/api/cities/airports"
              placeholder="Search origin airport / city (e.g. Delhi, Mumbai)"
              iconType="airport"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Origin point for customer flight or road pickup
            </p>
          </div>
        </div>
      </div>

      {/* DURATION & TRAVELERS SECTION (Using Stepper Controls) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Duration Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-sm text-[#0F172A]">Tour Duration</h3>
          </div>

          {/* Total Days & Nights Indicator */}
          <div className="p-3.5 bg-gradient-to-r from-orange-50/80 via-amber-50/50 to-orange-50/80 border border-orange-200/80 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Calculated Duration</p>
              <p className="text-base font-extrabold text-slate-900">
                {daysCount} {daysCount === 1 ? 'Day' : 'Days'} / {Math.max(0, daysCount - 1)} {Math.max(0, daysCount - 1) === 1 ? 'Night' : 'Nights'}
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-medium">
              <span>Rule: Nights = Days - 1</span>
            </div>
          </div>

          {/* Quick Presets for Days */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Common Durations</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { d: 3, label: '3D / 2N' },
                { d: 4, label: '4D / 3N' },
                { d: 5, label: '5D / 4N' },
                { d: 6, label: '6D / 5N' },
                { d: 7, label: '7D / 6N' },
                { d: 10, label: '10D / 9N' }
              ].map((p) => (
                <button
                  key={p.d}
                  type="button"
                  onClick={() => handleDaysChange(p.d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    daysCount === p.d
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StepperControl
              id="stepper-days"
              label="Total Days"
              value={daysCount}
              onChange={handleDaysChange}
              min={1}
              max={30}
              suffix="Days"
              subLabel="Itinerary length"
            />
            <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Total Nights (Auto)</span>
                <p className="text-lg font-bold text-slate-800 mt-1">
                  {Math.max(0, daysCount - 1)} <span className="text-xs font-medium text-slate-500">Nights</span>
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Calculated automatically from Total Days
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tour Start Date</label>
              <input
                type="date"
                value={packageData.startDate || '2026-07-07'}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tour End Date <span className="text-[10px] text-orange-600 font-normal">(Auto-calculated)</span>
              </label>
              <div className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>{packageData.endDate || computeEndDate(packageData.startDate || '2026-07-07', daysCount)}</span>
                <span className="text-[10px] bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                  {daysCount}D / {Math.max(0, daysCount - 1)}N
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-orange-50/70 border border-orange-200/60 rounded-xl text-xs text-orange-800">
            <span className="font-semibold">Dynamic Sync:</span> Dates and duration are dynamically synced across the itinerary timeline, hotel stays, and PDF quotation voucher.
          </div>
        </div>

        {/* Travelers Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-sm text-[#0F172A]">Travelers &amp; Customer Quote</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StepperControl
              id="stepper-adults"
              label="Adults"
              value={travelers.adults || 2}
              onChange={(val) =>
                setPackageData((prev) => ({
                  ...prev,
                  travelers: { ...(prev.travelers || {}), adults: val }
                }))
              }
              min={1}
              max={20}
              subLabel="12+ yrs"
            />
            <StepperControl
              id="stepper-children"
              label="Children"
              value={travelers.children || 0}
              onChange={(val) =>
                setPackageData((prev) => ({
                  ...prev,
                  travelers: { ...(prev.travelers || {}), children: val }
                }))
              }
              min={0}
              max={15}
              subLabel="2-11 yrs"
            />
            <StepperControl
              id="stepper-infants"
              label="Infants"
              value={travelers.infants || 0}
              onChange={(val) =>
                setPackageData((prev) => ({
                  ...prev,
                  travelers: { ...(prev.travelers || {}), infants: val }
                }))
              }
              min={0}
              max={5}
              subLabel="<2 yrs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Customer / Guest Name</label>
              <input
                type="text"
                value={packageData.customerInfo?.name || packageData.customerName || 'Neha Jain'}
                onChange={(e) =>
                  setPackageData((prev) => ({
                    ...prev,
                    customerName: e.target.value,
                    customerInfo: { ...(prev.customerInfo || {}), name: e.target.value }
                  }))
                }
                placeholder="e.g. Neha Jain"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Quote Reference ID</label>
              <input
                type="text"
                value={packageData.referenceId || 'FBL78'}
                onChange={(e) => setPackageData((prev) => ({ ...prev, referenceId: e.target.value }))}
                placeholder="e.g. FBL78 or MMBY-2026-904"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-800">
            <span className="font-semibold">Capacity:</span> Pricing calculations divide total costs across {((travelers.adults || 0) + (travelers.children || 0)) || 1} travelers.
          </div>
        </div>
      </div>

      {/* CATEGORIES & TAGS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Tag className="w-4 h-4 text-emerald-500" />
          <h3 className="font-bold text-sm text-[#0F172A]">Tour Categories & Themes</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORY_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>{tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* COVER IMAGE & VISUAL GALLERY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-purple-500" />
            <h3 className="font-bold text-sm text-[#0F172A]">Package Cover Photo</h3>
          </div>
          <span className="text-xs text-slate-400">High Resolution Landscape</span>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
            Image URL
          </label>
          <input
            type="text"
            value={packageData.coverImage || ''}
            onChange={(e) => setPackageData((prev) => ({ ...prev, coverImage: e.target.value }))}
            placeholder="https://..."
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
          />
        </div>

        {/* Preset Gallery */}
        <div>
          <p className="text-xs text-slate-500 mb-2 font-medium">Or choose a destination preset:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {PRESET_COVERS.map((preset) => {
              const isCurrent = packageData.coverImage === preset.url;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setPackageData((prev) => ({ ...prev, coverImage: preset.url }))}
                  className={`relative rounded-xl overflow-hidden aspect-4/3 border-2 transition group text-left cursor-pointer ${
                    isCurrent ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-1.5">
                    <span className="text-[10px] text-white font-medium truncate">{preset.name}</span>
                  </div>
                  {isCurrent && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Banner Preview */}
        {packageData.coverImage && (
          <div className="relative rounded-2xl overflow-hidden h-44 border border-slate-200 shadow-inner">
            <img
              src={packageData.coverImage}
              alt="Cover Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider self-start mb-1">
                {packageData.destination || 'Destination'}
              </span>
              <h4 className="text-white text-base font-bold drop-shadow-sm">
                {packageData.title || 'Tour Title'}
              </h4>
              <p className="text-white/80 text-xs mt-0.5">
                {daysCount} Days / {nightsCount} Nights · {travelers.adults || 2} Adults
              </p>
            </div>
          </div>
        )}
      </div>

      {/* TOUR HIGHLIGHTS & INCLUSIONS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-[#0F172A]">Tour Highlights & Bullet Points</h3>
          </div>
          <button
            type="button"
            onClick={handleAddHighlight}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Highlight
          </button>
        </div>

        <div className="space-y-2">
          {highlights.map((h, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                {idx + 1}
              </span>
              <input
                type="text"
                value={h}
                onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-[#0F172A] focus:border-orange-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => handleRemoveHighlight(idx)}
                aria-label="Remove highlight"
                className="p-1.5 text-slate-400 hover:text-red-500 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-500">
          All changes are kept in builder memory and synced across steps.
        </span>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition cursor-pointer shadow-sm active:scale-98"
        >
          <span>Save &amp; Continue to Itinerary</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
