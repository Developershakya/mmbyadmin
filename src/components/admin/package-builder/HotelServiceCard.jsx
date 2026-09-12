import React, { useState } from 'react';
import {
  Hotel,
  Search,
  Star,
  CheckCircle2,
  Sliders,
  ChevronDown,
  MapPin,
  Coffee,
  BedDouble,
  ShieldCheck
} from 'lucide-react';
import { searchHotels } from '../../../lib/api/hotels.js';

export default function HotelServiceCard({
  hotelData = {},
  packageHotelRules = {},
  defaultCity = 'Manali',
  onChange
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [showRules, setShowRules] = useState(false);

  const updateField = (field, value) => {
    onChange({
      ...hotelData,
      [field]: value
    });
  };

  const updateRule = (ruleKey, value) => {
    onChange({
      ...hotelData,
      rules: {
        ...(hotelData.rules || {}),
        [ruleKey]: value
      }
    });
  };

  const currentCategory = hotelData.category || packageHotelRules.category || '4 Star';
  const currentCity = hotelData.city || defaultCity;
  const currentRoom = hotelData.roomType || packageHotelRules.roomType || 'Deluxe Mountain View';
  const currentMeal = hotelData.mealPlan || packageHotelRules.mealPlan || 'Breakfast + Dinner';

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchResults(null);

    try {
      const res = await searchHotels({
        city: currentCity,
        category: currentCategory,
        roomType: currentRoom,
        mealPlan: currentMeal
      });
      setSearchResults(res.hotels || []);
    } catch (err) {
      console.error('Hotel search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectHotel = (hotel) => {
    onChange({
      ...hotelData,
      city: hotel.city,
      hotelName: hotel.name,
      category: hotel.category,
      roomType: hotel.roomType,
      mealPlan: hotel.mealPlan,
      selectedHotel: {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        category: hotel.category,
        stars: hotel.stars,
        roomType: hotel.roomType,
        mealPlan: hotel.mealPlan,
        pricePerNight: hotel.pricePerNight,
        taxes: hotel.taxes,
        totalPerNight: hotel.totalPerNight,
        image: hotel.image,
        amenities: hotel.amenities
      }
    });
    setSearchResults(null);
  };

  const selected = hotelData.selectedHotel;

  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 md:p-5 border border-emerald-200/80 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Hotel className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">Hotel Stay & Accommodations</span>
            <span className="text-[11px] text-slate-500">
              Inherits package-level rule ({packageHotelRules.category || '4 Star'} • {packageHotelRules.mealPlan || 'Breakfast + Dinner'})
            </span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Rule-Constrained Hotel
        </span>
      </div>

      {/* Hotel Search Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Destination City</label>
          <input
            type="text"
            value={currentCity}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="e.g. Manali"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Star Category</label>
          <select
            value={currentCategory}
            onChange={(e) => updateField('category', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer"
          >
            <option value="3 Star">3 Star</option>
            <option value="4 Star">4 Star</option>
            <option value="5 Star">5 Star</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Room Category</label>
          <input
            type="text"
            value={currentRoom}
            onChange={(e) => updateField('roomType', e.target.value)}
            placeholder="Deluxe Mountain View"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Meal Plan</label>
          <select
            value={currentMeal}
            onChange={(e) => updateField('mealPlan', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer"
          >
            <option value="Room Only">Room Only</option>
            <option value="Breakfast Included">Breakfast Included</option>
            <option value="Breakfast + Dinner">Breakfast + Dinner</option>
            <option value="All Meals & High Tea">All Meals</option>
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Hotel Name / Preferred Property</label>
          <input
            type="text"
            value={hotelData.hotelName || selected?.name || ''}
            onChange={(e) => updateField('hotelName', e.target.value)}
            placeholder="e.g. Hotel Snow Valley Resorts / The Himalayan Heritage"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isSearching ? 'Finding Hotels...' : 'Search Matching Hotels'}</span>
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="bg-white rounded-xl p-3 border border-emerald-300 shadow-sm space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">
              Hotels matching {currentCategory} in {currentCity} ({searchResults.length})
            </span>
            <button
              type="button"
              onClick={() => setSearchResults(null)}
              className="text-[11px] text-slate-400 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {searchResults.map((hotel) => (
              <div
                key={hotel.id}
                className="flex gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all bg-white text-xs"
              >
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-20 h-20 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate block text-xs">{hotel.name}</span>
                      <div className="flex items-center text-amber-500 text-[10px] font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                        <span>{hotel.category}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate">{hotel.location}</span>
                    <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">{hotel.mealPlan}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                    <span className="font-extrabold text-slate-900 text-xs">
                      ₹{hotel.pricePerNight?.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-400">/nt</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectHotel(hotel)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                    >
                      Select Hotel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Hotel Display */}
      {selected && (
        <div className="bg-white rounded-xl p-3.5 border border-emerald-300 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-900">Selected Hotel for this Day</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">{selected.city}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-emerald-50/40 rounded-lg border border-emerald-100">
            {selected.image && (
              <img
                src={selected.image}
                alt={selected.name}
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm truncate">{selected.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {selected.category}
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-slate-400" /> {selected.roomType}</span>
                <span className="flex items-center gap-1"><Coffee className="w-3.5 h-3.5 text-slate-400" /> {selected.mealPlan}</span>
              </p>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200">
              <span className="text-[10px] text-slate-500 block">Rate Per Night</span>
              <span className="text-sm font-extrabold text-emerald-800">
                ₹{selected.pricePerNight?.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block">+ ₹{selected.taxes || 450} taxes</span>
            </div>
          </div>
        </div>
      )}

      {/* Rules Accordion */}
      <div className="pt-2 border-t border-slate-200/80">
        <button
          type="button"
          onClick={() => setShowRules(!showRules)}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-emerald-700 cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Customer Hotel Customization Controls</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showRules ? 'rotate-180' : ''}`} />
        </button>

        {showRules && (
          <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs animate-fadeIn">
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={hotelData.rules?.allowHotelChange ?? true}
                onChange={(e) => updateRule('allowHotelChange', e.target.checked)}
                className="rounded border-slate-300 text-emerald-600"
              />
              <span>Allow Hotel Change</span>
            </label>

            <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={hotelData.rules?.allowRoomChange ?? true}
                onChange={(e) => updateRule('allowRoomChange', e.target.checked)}
                className="rounded border-slate-300 text-emerald-600"
              />
              <span>Allow Room Change</span>
            </label>

            <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={hotelData.rules?.allowMealChange ?? true}
                onChange={(e) => updateRule('allowMealChange', e.target.checked)}
                className="rounded border-slate-300 text-emerald-600"
              />
              <span>Allow Meal Plan Change</span>
            </label>

            <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={hotelData.rules?.allowHotelUpgrade ?? true}
                onChange={(e) => updateRule('allowHotelUpgrade', e.target.checked)}
                className="rounded border-slate-300 text-emerald-600"
              />
              <span>Allow Star Category Upgrade</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
