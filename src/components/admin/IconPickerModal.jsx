import React, { useState } from 'react';
import { Search, X, Check, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import RouteIcon, { AVAILABLE_ROUTE_ICONS } from '../common/RouteIcon.jsx';

export default function IconPickerModal({
  isOpen,
  onClose,
  currentIcon = 'MapPin',
  onSelectIcon
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [customUrl, setCustomUrl] = useState('');
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'custom'

  if (!isOpen) return null;

  const categories = ['ALL', 'General', 'Transit', 'Sightseeing', 'Hospitality', 'Food', 'Utility', 'Shopping'];

  const filteredIcons = AVAILABLE_ROUTE_ICONS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.label.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleApply = (iconName) => {
    onSelectIcon({
      icon: iconName,
      iconLibrary: 'lucide'
    });
    onClose();
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    onSelectIcon({
      icon: customUrl.trim(),
      iconLibrary: 'custom'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Select Checkpoint Icon</h3>
            <p className="text-xs text-slate-500">Pick a clean Lucide vector icon or use a custom image URL</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-5 pt-2 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`pb-2 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'border-[#F97316] text-[#F97316]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Lucide Icon Library</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-2 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-[#F97316] text-[#F97316]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Custom Image / SVG URL</span>
          </button>
        </div>

        {activeTab === 'library' ? (
          <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
            {/* Search and Category Filters */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search icons (e.g. Bus, Temple, Mountain, Car)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-orange-100 text-[#F97316]'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-1">
              {filteredIcons.map((item) => {
                const isSelected = currentIcon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleApply(item.name)}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all group ${
                      isSelected
                        ? 'border-[#F97316] bg-orange-50 text-[#F97316] ring-2 ring-orange-500/20'
                        : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50 text-slate-700'
                    }`}
                    title={item.label}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-white flex items-center justify-center transition-colors">
                      <RouteIcon icon={item.name} className="w-4 h-4 text-slate-800 group-hover:text-[#F97316]" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 truncate w-full group-hover:text-slate-900">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredIcons.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No icons found matching &ldquo;{search}&rdquo;
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 flex-1 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Icon or Logo URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://example.com/marker-icon.svg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  disabled={!customUrl.trim()}
                  className="px-4 py-2 bg-[#F97316] hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports PNG, SVG, or WebP icon graphics for custom transit branding.
              </p>
            </div>

            {customUrl && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Preview
                </span>
                <div className="w-12 h-12 mx-auto bg-white rounded-full border border-slate-200 flex items-center justify-center p-2 shadow-2xs">
                  <img
                    src={customUrl}
                    alt="Preview"
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
          <span>Selected Icon: <strong className="text-slate-800">{currentIcon || 'MapPin'}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
