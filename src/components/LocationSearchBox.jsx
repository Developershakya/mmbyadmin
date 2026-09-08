import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

export const indianCities = [
  { code: "DEL", name: "New Delhi, India", sub: "Indira Gandhi International Airport" },
  { code: "BOM", name: "Mumbai, India", sub: "Chhatrapati Shivaji International Airport" },
  { code: "BLR", name: "Bengaluru, India", sub: "Kempegowda International Airport" },
  { code: "MAA", name: "Chennai, India", sub: "Chennai International Airport" },
  { code: "CCU", name: "Kolkata, India", sub: "Netaji Subhas Chandra Bose Airport" },
  { code: "HYD", name: "Hyderabad, India", sub: "Rajiv Gandhi International Airport" },
  { code: "PNQ", name: "Pune, India", sub: "Pune Airport" },
  { code: "JAI", name: "Jaipur, India", sub: "Jaipur International Airport" },
  { code: "AMD", name: "Ahmedabad, India", sub: "Sardar Vallabhbhai Patel Airport" },
  { code: "LKO", name: "Lucknow, India", sub: "Chaudhary Charan Singh Airport" },
  { code: "IXC", name: "Chandigarh, India", sub: "Chandigarh Airport" },
  { code: "GOI", name: "Goa, India", sub: "Dabolim Airport" },
  { code: "AGR", name: "Agra, India", sub: "Agra Airport" },
  { code: "VNS", name: "Varanasi, India", sub: "Lal Bahadur Shastri Airport" },
  { code: "PAT", name: "Patna, India", sub: "Jay Prakash Narayan Airport" },
  { code: "BHO", name: "Bhopal, India", sub: "Raja Bhoj Airport" },
  { code: "IDR", name: "Indore, India", sub: "Devi Ahilyabai Holkar Airport" },
  { code: "NAG", name: "Nagpur, India", sub: "Dr. Babasaheb Ambedkar Airport" },
  { code: "STV", name: "Surat, India", sub: "Surat Airport" },
  { code: "ATQ", name: "Amritsar, India", sub: "Sri Guru Ram Dass Jee Airport" },
  { code: "IXL", name: "Leh", sub: "Leh Kushok Bakula Rimpoche Airport" },
];

const visaFreeDestinations = [
  { code: "MNL", name: "Manila", sub: "Philippines" },
  { code: "MLE", name: "Male", sub: "Maldives" },
  { code: "KUL", name: "Kuala Lumpur", sub: "Malaysia" },
  { code: "CMB", name: "Colombo", sub: "Sri Lanka" },
  { code: "MRU", name: "Mauritius", sub: "Mauritius" },
  { code: "HKG", name: "Hong Kong", sub: "Hong Kong" },
  { code: "PBH", name: "Paro", sub: "Bhutan" },
  { code: "SEZ", name: "Mahe Island", sub: "Seychelles" },
  { code: "NAN", name: "Nadi", sub: "Fiji" },
];

const eVisaDestinations = [
  { code: "DPS", name: "Denpasar (Bali)", sub: "Indonesia" },
  { code: "SGN", name: "Ho Chi Minh City", sub: "Vietnam" },
  { code: "NRT", name: "Tokyo", sub: "Japan" },
  { code: "REP", name: "Siem Reap", sub: "Cambodia" },
  { code: "TBS", name: "Tbilisi", sub: "Georgia" },
  { code: "DXB", name: "Dubai", sub: "UAE" },
];

const popularSearches = [
  { code: "BOM", name: "Mumbai, India", sub: "Chhatrapati Shivaji International Airport" },
  { code: "DEL", name: "New Delhi, India", sub: "Indira Gandhi International Airport" },
  { code: "SIN", name: "Hyderabad", sub: "Rajiv Gandhi International Airport" },
  { code: "BKK", name: "Bangalore", sub: "Nashville International Airport" },
];

const RECENT_KEY = "bharatYatra_recentSearches";

function getRecentSearches() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(item) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentSearches().filter((i) => i.code !== item.code);
    const updated = [item, ...existing].slice(0, 5);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
}

export default function LocationSearchBox({
  label,
  value,
  placeholder,
  onSelect,
  align = "left",
  showAllSections = true,
  citySearchApi = null,
  theme = "light", // "light" | "dark"
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState([]);
  const [apiResults, setApiResults] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const boxRef = useRef(null);
  const debounceRef = useRef(null);
  const isDark = theme === "dark";

  useEffect(() => {
    if (open) setRecents(getRecentSearches());
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
        setApiResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic (DB-backed) city search — sirf tab chalega jab citySearchApi diya ho
  useEffect(() => {
    if (!citySearchApi) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.trim().length < 2) {
      setApiResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setApiLoading(true);
        const res = await fetch(`${citySearchApi}?query=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        const rows = Array.isArray(data) ? data : data?.data || [];
        const mapped = rows
          .map((row) => ({
            code: String(row.airport_code || row.code || row.cityid || row.id || ""),
            name: row.airport_city_name || row.name || row.Destination || row.city || "",
            sub: row.airport_name || row.sub || row.country || row.state || "",
          }))
          .filter((item) => item.code && item.name);
        setApiResults(mapped);
      } catch (err) {
        console.error("City search error:", err);
        setApiResults([]);
      } finally {
        setApiLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, citySearchApi]);

  const allOptions = [
    ...indianCities,
    ...visaFreeDestinations,
    ...eVisaDestinations,
  ].filter((item, index, self) => index === self.findIndex((t) => t.code === item.code));

  const filtered = query
    ? citySearchApi
      ? apiResults
      : allOptions.filter(
          (item) =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.code.toLowerCase().includes(query.toLowerCase()) ||
            (item.sub && item.sub.toLowerCase().includes(query.toLowerCase()))
        )
    : null;

  function handleSelect(item) {
    onSelect(item);
    saveRecentSearch(item);
    setOpen(false);
    setQuery("");
    setApiResults([]);
  }

  return (
    <div className="relative z-50 w-full h-full cursor-pointer" ref={boxRef} onClick={() => setOpen((prev) => !prev)}>
      <span className={`text-[9px] uppercase tracking-wider block mb-0.5 font-medium ${isDark ? "text-orange-500 font-bold" : "text-gray-400"}`}>
        {label}
      </span>
      <div className="pointer-events-none">
        <div className={`truncate ${isDark ? "text-xs font-black text-white" : "text-xl font-bold text-gray-800"}`}>
          {value ? value.name : placeholder}
        </div>
        {value?.sub && !isDark && (
          <span className="text-xs text-gray-500 truncate block">
            {value.code}, {value.sub}
          </span>
        )}
      </div>

      {open && (
        <div
          className={`absolute mt-2 w-[340px] bg-white shadow-2xl rounded-xl border border-gray-100 z-[100] flex flex-col overflow-hidden ${
            align === "right" ? "right-0" : "left-0"
          }`}
          style={{ maxHeight: "420px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 m-3 mb-2 bg-white flex-shrink-0">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onFocus={() => setOpen(true)}
              onClick={(event) => event.stopPropagation()}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              className="w-full text-sm outline-none text-gray-800"
            />
          </div>

          <div className="overflow-y-auto px-3 pb-3">
            {filtered ? (
              <div>
                {apiLoading && citySearchApi ? (
                  <p className="text-sm text-gray-400 px-1 py-4 text-center">Searching...</p>
                ) : filtered.length === 0 ? (
                  <p className="text-sm text-gray-400 px-1 py-4 text-center">No destinations found</p>
                ) : (
                  filtered.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-orange-50 transition text-left"
                    >
                      <span className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded bg-gray-100 text-xs font-bold text-gray-600">
                        {String(item.code).slice(0, 3).toUpperCase()}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-gray-800">{item.name}</span>
                        <span className="block text-[11px] text-gray-400">{item.sub}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <>
                {showAllSections && !citySearchApi && (
                  <>
                    {recents.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-[11px] uppercase font-bold text-gray-400 tracking-wide px-1 mb-1">Recent Searches</h4>
                        {recents.map((item) => (
                          <button
                            key={`recent-${item.code}`}
                            type="button"
                            onClick={() => handleSelect(item)}
                            className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-orange-50 transition text-left"
                          >
                            <span className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded bg-gray-100 text-xs font-bold text-gray-600">
                              {item.code}
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-gray-800">{item.name}</span>
                              <span className="block text-[11px] text-gray-400">{item.sub}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mb-3">
                      <h4 className="text-[11px] uppercase font-bold text-gray-400 tracking-wide px-1 mb-1">
                        Visa-Free / Visa-on-Arrival Destinations
                      </h4>
                      <div className="grid grid-cols-3 gap-2 px-1">
                        {visaFreeDestinations.map((item) => (
                          <button
                            key={item.code}
                            type="button"
                            onClick={() => handleSelect(item)}
                            className="text-xs font-medium text-gray-700 border border-gray-200 rounded-lg py-2 px-2 hover:border-orange-400 hover:bg-orange-50 transition truncate"
                            title={item.name}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <h4 className="text-[11px] uppercase font-bold text-gray-400 tracking-wide px-1 mb-1">E-Visa Destinations</h4>
                      <div className="grid grid-cols-3 gap-2 px-1">
                        {eVisaDestinations.map((item) => (
                          <button
                            key={item.code}
                            type="button"
                            onClick={() => handleSelect(item)}
                            className="text-xs font-medium text-gray-700 border border-gray-200 rounded-lg py-2 px-2 hover:border-orange-400 hover:bg-orange-50 transition truncate"
                            title={item.name}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {!citySearchApi && (
                  <div>
                    <h4 className="text-[11px] uppercase font-bold text-gray-400 tracking-wide px-1 mb-1">Popular Searches</h4>
                    {popularSearches.map((item) => (
                      <button
                        key={`popular-${item.code}`}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-orange-50 transition text-left"
                      >
                        <span className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded bg-gray-100 text-xs font-bold text-gray-600">
                          {item.code}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-gray-800">{item.name}</span>
                          <span className="block text-[11px] text-gray-400">{item.sub}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {citySearchApi && (
                  <p className="text-xs text-gray-400 px-1 py-4 text-center">Type at least 2 letters to search cities</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}