import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Search,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Info,
  ExternalLink,
  Edit3,
  Check,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';
import { searchSightseeing, getMasterSightseeingList } from '../../../lib/api/sightseeing.js';
import SightseeingMasterModal from './SightseeingMasterModal.jsx';

export default function SightseeingServiceCard({
  sightseeingData = {},
  onChange,
  defaultCity = 'Manali'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [activeReadMoreItem, setActiveReadMoreItem] = useState(null);
  const dropdownRef = useRef(null);

  const items = sightseeingData.items || [];

  // Search autocomplete
  useEffect(() => {
    let active = true;
    if (searchQuery.trim().length > 0) {
      searchSightseeing(searchQuery, defaultCity).then((res) => {
        if (active) {
          setSuggestions(res.results || []);
          setShowSuggestions(true);
        }
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    return () => {
      active = false;
    };
  }, [searchQuery, defaultCity]);

  // Handle clicking outside suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSightseeing = (item) => {
    // Check if already added
    if (items.some((i) => i.id === item.id)) {
      setShowSuggestions(false);
      setSearchQuery('');
      return;
    }

    const newItem = {
      id: item.id,
      name: item.name,
      location: item.location,
      city: item.city,
      category: item.category,
      duration: item.duration,
      image: item.image,
      masterDescription: item.description,
      description: item.description,
      useMasterDescription: true,
      ticketPrice: item.ticketPrice || 0
    };

    onChange({
      ...sightseeingData,
      items: [...items, newItem]
    });

    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleToggleDescriptionMode = (index, useMaster) => {
    const updated = [...items];
    const target = updated[index];
    target.useMasterDescription = useMaster;
    if (useMaster && target.masterDescription) {
      target.description = target.masterDescription;
    }
    onChange({
      ...sightseeingData,
      items: updated
    });
  };

  const handleUpdateItemDescription = (index, newDesc) => {
    const updated = [...items];
    updated[index].description = newDesc;
    updated[index].useMasterDescription = false;
    onChange({
      ...sightseeingData,
      items: updated
    });
  };

  const handleRemoveItem = (index) => {
    onChange({
      ...sightseeingData,
      items: items.filter((_, i) => i !== index)
    });
  };

  const handleMoveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange({
      ...sightseeingData,
      items: updated
    });
  };

  const handleMasterAdded = (newRecord) => {
    handleSelectSightseeing(newRecord);
  };

  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 md:p-5 border border-rose-200/80 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">Sightseeing & Heritage Attractions</span>
            <span className="text-[11px] text-slate-500">
              Connected to Reusable Master Database ({items.length} spots added to this day)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMasterModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Master Spot</span>
        </button>
      </div>

      {/* Search Input with Auto-complete Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim().length > 0) setShowSuggestions(true);
            }}
            placeholder={`Type sightseeing name (e.g. Hadimba Temple, Vashisht Kund, Solang Valley in ${defaultCity})...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        {/* Suggestion Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 z-30 overflow-hidden max-h-72 overflow-y-auto animate-fadeIn">
            <div className="p-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Matching Master Sightseeing Catalog ({suggestions.length})
            </div>
            {suggestions.map((item) => {
              const isAlreadyAdded = items.some((i) => i.id === item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => !isAlreadyAdded && handleSelectSightseeing(item)}
                  className={`flex items-center justify-between p-3 border-b border-slate-100 transition-colors cursor-pointer ${
                    isAlreadyAdded ? 'bg-slate-50 opacity-60 cursor-not-allowed' : 'hover:bg-rose-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{item.name}</span>
                      <span className="text-[11px] text-slate-500 block">
                        {item.location} • {item.city} ({item.duration})
                      </span>
                      <span className="text-[10px] text-rose-600 font-semibold">{item.category}</span>
                    </div>
                  </div>

                  <div>
                    {isAlreadyAdded ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Added
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        + Add to Day
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* List of Configured Sightseeing Spots with Reordering & Description Override */}
      {items.length === 0 ? (
        <div className="p-6 bg-white rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
          No sightseeing spots selected for this day yet. Search above to pick from the master library or click "New Master Spot".
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[11px] flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-100"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{item.name}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Controls: Reorder & Remove */}
                <div className="flex items-center gap-1 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveItem(index, -1)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => handleMoveItem(index, 1)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Sightseeing"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Master Description vs Package Specific Description */}
              <div className="pt-2.5 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Description Mode:</span>
                    <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleToggleDescriptionMode(index, true)}
                        className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                          item.useMasterDescription
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Use Master Description
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleDescriptionMode(index, false)}
                        className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                          !item.useMasterDescription
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Customize for this Package
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveReadMoreItem(item)}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Info className="w-3 h-3" />
                    <span>Read More</span>
                  </button>
                </div>

                {/* Description input/display */}
                {item.useMasterDescription ? (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic line-clamp-2">
                    "{item.description}"
                  </p>
                ) : (
                  <textarea
                    rows={2}
                    value={item.description || ''}
                    onChange={(e) => handleUpdateItemDescription(index, e.target.value)}
                    placeholder="Enter custom package-specific description for this sightseeing..."
                    className="w-full p-2 rounded-lg border border-rose-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Read More Detail Modal */}
      {activeReadMoreItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            <div className="relative h-48">
              <img
                src={activeReadMoreItem.image}
                alt={activeReadMoreItem.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">
                    {activeReadMoreItem.category}
                  </span>
                  <h4 className="text-white text-base font-bold">{activeReadMoreItem.name}</h4>
                  <span className="text-white/80 text-xs">{activeReadMoreItem.location} • {activeReadMoreItem.city}</span>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">Complete Historical & Tourism Details:</span>
              <p className="text-xs text-slate-600 leading-relaxed max-h-60 overflow-y-auto">
                {activeReadMoreItem.description || activeReadMoreItem.masterDescription}
              </p>
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveReadMoreItem(null)}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Master Catalog Creation Modal */}
      <SightseeingMasterModal
        isOpen={isMasterModalOpen}
        onClose={() => setIsMasterModalOpen(false)}
        defaultCity={defaultCity}
        onAdded={handleMasterAdded}
      />
    </div>
  );
}
