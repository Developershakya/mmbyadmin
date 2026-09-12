import React, { useState } from 'react';
import { Calendar, ChevronRight, Download, Plus } from 'lucide-react';

export default function PageHeader({
  id = 'page-header',
  title,
  subtitle,
  breadcrumbs = [],
  onNavigate,
  actions,
  dateRange = 'Tue, 09 Sep 2025 - Tue, 16 Sep 2025',
  onDateChange,
  showDateSelector = true
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedRange, setSelectedRange] = useState(dateRange);

  const datePresets = [
    'Today',
    'Last 7 Days (02 Sep - 09 Sep)',
    'Last 30 Days (10 Aug - 09 Sep)',
    'Tue, 09 Sep 2025 - Tue, 16 Sep 2025',
    'This Month (Sep 2025)',
    'Custom Range...'
  ];

  const handleSelectPreset = (preset) => {
    setSelectedRange(preset);
    setShowDatePicker(false);
    if (onDateChange) onDateChange(preset);
  };

  return (
    <div id={id} className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                {crumb.path ? (
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate(crumb.path)}
                    className="hover:text-orange-600 transition-colors cursor-pointer font-medium"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={idx === breadcrumbs.length - 1 ? 'text-slate-800 font-semibold' : ''}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {subtitle && (
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center flex-wrap gap-2.5 shrink-0">
        {showDateSelector && (
          <div className="relative">
            <button
              id="header-date-selector-btn"
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>{selectedRange}</span>
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                  Filter by Travel Dates
                </div>
                {datePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      selectedRange === preset
                        ? 'bg-orange-50 text-orange-600 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {actions}
      </div>
    </div>
  );
}
