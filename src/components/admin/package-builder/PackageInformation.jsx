import React, { useState } from 'react';
import {
  Package,
  MapPin,
  Calendar,
  Moon,
  Sparkles,
  Plus,
  Trash2,
  Hotel,
  Plane,
  Car,
  Bus,
  Camera,
  Compass,
  Utensils,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

export default function PackageInformation({
  packageData,
  onChange,
  onNext
}) {
  const [newHighlight, setNewHighlight] = useState('');

  // Handle nested updates
  const updateField = (field, value) => {
    onChange({
      ...packageData,
      [field]: value
    });
  };

  const updateHotelRule = (field, value) => {
    onChange({
      ...packageData,
      hotelRules: {
        ...(packageData.hotelRules || {}),
        [field]: value
      }
    });
  };

  const updateServiceConfig = (serviceKey, subfield, value) => {
    onChange({
      ...packageData,
      servicesConfig: {
        ...(packageData.servicesConfig || {}),
        [serviceKey]: {
          ...(packageData.servicesConfig?.[serviceKey] || { enabled: false, customizable: false }),
          [subfield]: value
        }
      }
    });
  };

  const handleAddHighlight = (e) => {
    e?.preventDefault();
    if (!newHighlight.trim()) return;
    const currentHighlights = packageData.highlights || [];
    updateField('highlights', [...currentHighlights, newHighlight.trim()]);
    setNewHighlight('');
  };

  const handleRemoveHighlight = (index) => {
    const currentHighlights = packageData.highlights || [];
    updateField('highlights', currentHighlights.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Basic Package Information */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F97316]">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Package Basic Information</h2>
            <p className="text-xs text-slate-500">Define the core destination, identity, duration, and publishing status.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Package Name */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Package Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={packageData.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g. Manali Adventure & Snow Peaks Holiday"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Primary Destination */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Destination City / State <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={packageData.destination || ''}
                onChange={(e) => updateField('destination', e.target.value)}
                placeholder="e.g. Manali, Himachal Pradesh"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Starting City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Starting City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={packageData.startCity || ''}
              onChange={(e) => updateField('startCity', e.target.value)}
              placeholder="e.g. Delhi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Ending City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Ending City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={packageData.endCity || ''}
              onChange={(e) => updateField('endCity', e.target.value)}
              placeholder="e.g. Delhi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Duration in Days */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Duration (Days) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={packageData.duration || ''}
                onChange={(e) => updateField('duration', e.target.value)}
                placeholder="e.g. 3 Days"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Number of Nights */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Number of Nights <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Moon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={packageData.nights || ''}
                onChange={(e) => updateField('nights', e.target.value)}
                placeholder="e.g. 2 Nights"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Package Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Package Type
            </label>
            <select
              value={packageData.packageType || 'Customizable'}
              onChange={(e) => updateField('packageType', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
            >
              <option value="Customizable">Customizable (Customer can change services)</option>
              <option value="Fixed">Fixed Itinerary (Locked services)</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Publication Status
            </label>
            <select
              value={packageData.status || 'Draft'}
              onChange={(e) => updateField('status', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
            >
              <option value="Draft">Draft (Only visible to admin)</option>
              <option value="Active">Active (Published on customer portal)</option>
              <option value="Inactive">Inactive (Temporarily archived)</option>
            </select>
          </div>
        </div>

        {/* Hero Cover Image URL */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Hero Banner Image URL
          </label>
          <input
            type="url"
            value={packageData.heroImage || ''}
            onChange={(e) => updateField('heroImage', e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
      </div>

      {/* 2. Descriptions & Highlights */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Descriptions & Highlights</h2>
            <p className="text-xs text-slate-500">Provide compelling copy and bullet points for the customer brochure.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Short Description (Card Summary)
            </label>
            <input
              type="text"
              value={packageData.shortDescription || ''}
              onChange={(e) => updateField('shortDescription', e.target.value)}
              placeholder="e.g. Unforgettable 3-day Himalayan getaway featuring Solang Valley snow adventures..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Detailed Long Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Detailed Long Overview Description
            </label>
            <textarea
              rows={3}
              value={packageData.longDescription || ''}
              onChange={(e) => updateField('longDescription', e.target.value)}
              placeholder="Write a comprehensive paragraph describing the experience, mountain atmosphere, inclusions..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Highlights List Builder */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Package Key Highlights
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHighlight(e)}
                placeholder="Add highlight (e.g. Private cab included, Mountain view breakfast...)"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Highlight</span>
              </button>
            </div>

            {/* List of current highlights */}
            <div className="space-y-2">
              {(packageData.highlights || []).map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                    <span>{highlight}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(index)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove Highlight"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Package Hotel Rules */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Package Hotel Rules</h2>
              <p className="text-xs text-slate-500">
                These rules govern live API hotel search queries and define which category of hotel options are fetched.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            API Filter Rule
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Hotel Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Default Star Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={packageData.hotelRules?.category || '4 Star'}
              onChange={(e) => updateHotelRule('category', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
            >
              <option value="3 Star">3 Star (Comfort & Budget-friendly)</option>
              <option value="4 Star">4 Star (Premium Resort & Amenities)</option>
              <option value="5 Star">5 Star (Luxury Heritage / Palace)</option>
            </select>
          </div>

          {/* Location Rule */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hotel Location Rule
            </label>
            <select
              value={packageData.hotelRules?.locationRule || 'Same destination'}
              onChange={(e) => updateHotelRule('locationRule', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
            >
              <option value="Same destination">Same destination (Stay in primary town)</option>
              <option value="Same city">Same city</option>
              <option value="Multiple cities">Multiple cities (Touring itinerary)</option>
              <option value="Specific hotel">Specific hotel only</option>
            </select>
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Default Room Type
            </label>
            <select
              value={packageData.hotelRules?.roomType || 'Deluxe Mountain View'}
              onChange={(e) => updateHotelRule('roomType', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
            >
              <option value="Standard Room">Standard Room</option>
              <option value="Deluxe Mountain View">Deluxe Mountain View</option>
              <option value="Premium Valley Room">Premium Valley Room</option>
              <option value="Luxury Suite / Cottage">Luxury Suite / Cottage</option>
            </select>
          </div>

          {/* Meal Plan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Included Meal Plan
            </label>
            <select
              value={packageData.hotelRules?.mealPlan || 'Breakfast + Dinner'}
              onChange={(e) => updateHotelRule('mealPlan', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
            >
              <option value="Room Only">Room Only (EP)</option>
              <option value="Breakfast Included">Breakfast Included (CP)</option>
              <option value="Breakfast + Dinner">Breakfast + Dinner (MAP)</option>
              <option value="Breakfast + Lunch + Dinner">Breakfast + Lunch + Dinner (AP)</option>
              <option value="All Meals & High Tea">All Meals & High Tea</option>
            </select>
          </div>
        </div>

        {/* Hotel Customization Toggles */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <span className="text-xs font-bold text-slate-700 block">Customer-Facing Hotel Upgrade Permissions:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'allowHotelChange', label: 'Allow Hotel Change' },
              { id: 'allowRoomChange', label: 'Allow Room Upgrade' },
              { id: 'allowMealChange', label: 'Allow Meal Plan Change' },
              { id: 'allowHotelUpgrade', label: 'Allow 4★ to 5★ Upgrade' }
            ].map(rule => (
              <label key={rule.id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!packageData.hotelRules?.[rule.id]}
                  onChange={(e) => updateHotelRule(rule.id, e.target.checked)}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span>{rule.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Package Service Configuration (7 Service Cards) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Package Service Configuration</h2>
            <p className="text-xs text-slate-500">
              Control which services are active across the package and whether customers are allowed to customize them.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[
            { key: 'flight', label: 'Flight Service', icon: Plane, color: 'text-blue-600', bg: 'bg-blue-50' },
            { key: 'hotel', label: 'Hotel & Stays', icon: Hotel, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { key: 'cab', label: 'Private Cabs', icon: Car, color: 'text-purple-600', bg: 'bg-purple-50' },
            { key: 'bus', label: 'Intercity Bus', icon: Bus, color: 'text-amber-600', bg: 'bg-amber-50' },
            { key: 'sightseeing', label: 'Sightseeing Tours', icon: Camera, color: 'text-rose-600', bg: 'bg-rose-50' },
            { key: 'activity', label: 'Adventure Activities', icon: Compass, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { key: 'meal', label: 'Curated Meals', icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-50' }
          ].map(svc => {
            const Icon = svc.icon;
            const isEnabled = !!packageData.servicesConfig?.[svc.key]?.enabled;
            const isCustomizable = !!packageData.servicesConfig?.[svc.key]?.customizable;

            return (
              <div
                key={svc.key}
                className={`p-4 rounded-xl border transition-all ${
                  isEnabled
                    ? 'bg-white border-slate-300 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${svc.bg} flex items-center justify-center ${svc.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">{svc.label}</span>
                  </div>

                  {/* Enable/Disable Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => updateServiceConfig(svc.key, 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F97316]"></div>
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Customer Customization:</span>
                  <button
                    type="button"
                    disabled={!isEnabled}
                    onClick={() => updateServiceConfig(svc.key, 'customizable', !isCustomizable)}
                    className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-colors cursor-pointer ${
                      !isEnabled
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : isCustomizable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isCustomizable ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <span>Continue to Itinerary Builder</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
