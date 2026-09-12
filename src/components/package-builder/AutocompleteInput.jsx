import React, { useState, useEffect, useRef } from 'react';
import { Loader2, MapPin, Plane, Bus, Car, Building2, Check } from 'lucide-react';
import { fetchSuggestions } from '../../lib/packageBuilder/searchApi.js';

export default function AutocompleteInput({
  value = '',
  onChange,
  onSelect,
  suggestUrl,
  placeholder = 'Type to search...',
  disabled = false,
  className = '',
  iconType = 'default',
  required = false,
  id,
  name
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync internal input value if external value changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce & abort previous request
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputValue(text);
    if (onChange) {
      onChange(e);
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const results = await fetchSuggestions(suggestUrl, text, controller.signal);
        setSuggestions(results.slice(0, 8));
        setIsOpen(true);
        setActiveIndex(-1);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching autocomplete suggestions:', err);
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelectItem = (item) => {
    setInputValue(item.label);
    setIsOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    if (onSelect) {
      onSelect(item);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSelectItem(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Helper icon renderer
  const renderItemIcon = () => {
    switch (iconType) {
      case 'airport':
      case 'flight':
        return <Plane className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'bus':
        return <Bus className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'car':
      case 'cab':
        return <Car className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'hotel':
        return <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          id={id}
          name={name}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 && inputValue.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className={
            className ||
            "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed"
          }
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          </div>
        )}
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-[9999] left-0 mt-1.5 w-full min-w-[280px] sm:min-w-[380px] max-w-[92vw] max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-2xl ring-1 ring-black/5 py-1 text-sm animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100">
          {suggestions.map((item, index) => {
            const isSelected = index === activeIndex;
            return (
              <li
                key={item.id || `${item.code}-${index}`}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur
                  handleSelectItem(item);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`px-3.5 py-2.5 flex items-start gap-3 cursor-pointer transition ${
                  isSelected ? 'bg-blue-50/90 text-blue-950' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="mt-0.5 shrink-0">{renderItemIcon()}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-[#0F172A] leading-tight">
                      {item.label}
                    </span>
                    {item.code && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        {item.code}
                      </span>
                    )}
                  </div>
                  {item.subLabel && (
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug break-words">
                      {item.subLabel}
                    </p>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-1" />}
              </li>
            );
          })}
        </ul>
      )}

      {isOpen && !loading && suggestions.length === 0 && inputValue.trim().length >= 2 && (
        <div className="absolute z-[9999] left-0 mt-1.5 w-full min-w-[280px] sm:min-w-[340px] bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs text-slate-500 text-center">
          No matches found for "{inputValue}"
        </div>
      )}
    </div>
  );
}
