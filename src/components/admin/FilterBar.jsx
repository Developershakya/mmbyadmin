import React from 'react';
import { Search, RotateCcw, Calendar, Filter } from 'lucide-react';

export default function FilterBar({
  id = 'filter-bar',
  filters = [],
  filterValues = {},
  onFilterChange,
  searchQuery = '',
  onSearchChange,
  onApplySearch,
  onReset,
  searchPlaceholder = 'Search by name, booking ID, or email...'
}) {
  return (
    <div
      id={id}
      className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs mb-6 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filters.map((filter) => (
          <div key={filter.key} className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              {filter.label}
            </label>
            <select
              value={filterValues[filter.key] || 'ALL'}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="w-full h-10.5 px-3 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all cursor-pointer"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Search Input & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-slate-100">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onApplySearch && onApplySearch()}
            placeholder={searchPlaceholder}
            className="w-full h-10.5 pl-10 pr-4 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            id="filter-search-btn"
            type="button"
            onClick={() => onApplySearch && onApplySearch()}
            className="flex-1 sm:flex-none h-10.5 px-6 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </button>

          <button
            id="filter-reset-btn"
            type="button"
            onClick={() => onReset && onReset()}
            className="flex-1 sm:flex-none h-10.5 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
