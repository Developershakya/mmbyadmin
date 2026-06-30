"use client";
import { useState, useRef, useEffect } from "react";
import {
  Plane,
  Hotel,
  Car,
  Bus,
  MapPin,
  Clock,
  ChevronDown,
  Search,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

/* ---------------------------------------------------------
   STATIC DATA
--------------------------------------------------------- */
const indianCities = [
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
  { code: "SIN", name: "Singapore", sub: "Changi Airport" },
  { code: "BKK", name: "Bangkok, Thailand", sub: "Suvarnabhumi Airport" },
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

/* ---------------------------------------------------------
   LocationSearchBox
   A reusable MakeMyTrip-style search dropdown.
   Click the trigger (label + value) -> opens a panel with:
   search input, Recent Searches, Visa-Free/Visa-on-Arrival
   Destinations, E-Visa Destinations, Popular Searches.
--------------------------------------------------------- */
function LocationSearchBox({ label, value, placeholder, onSelect, align = "left" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState([]);
  const boxRef = useRef(null);

  useEffect(() => {
    if (open) setRecents(getRecentSearches());
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allOptions = [
    ...indianCities,
    ...visaFreeDestinations,
    ...eVisaDestinations,
  ];

  const filtered = query
    ? allOptions.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.code.toLowerCase().includes(query.toLowerCase())
      )
    : null;

  function handleSelect(item) {
    onSelect(item);
    saveRecentSearch(item);
    setOpen(false);
    setQuery("");
  }

  return (
  <div
    className="relative w-full h-full"
    ref={boxRef}
  >
      <span className="text-xs uppercase tracking-wider text-gray-400 block mb-1">
        {label}
      </span>
 <button
  type="button"
  onClick={() => setOpen((prev) => !prev)}
  className="w-full h-full text-left block cursor-pointer"
>
        <div className="text-xl font-bold text-gray-800 truncate">
          {value ? value.name : placeholder}
        </div>
        {value?.sub && (
          <span className="text-xs text-gray-500 truncate block">
            {value.sub}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute mt-2 w-[340px] max-h-[420px] overflow-y-auto bg-white shadow-2xl rounded-xl border border-gray-100 z-30 p-3 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 mb-3 sticky top-0 bg-white">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              className="w-full text-sm outline-none"
            />
          </div>

          {filtered ? (
            <div>
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 px-1 py-4 text-center">
                  No destinations found
                </p>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-orange-50 transition text-left"
                  >
                    <span className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded bg-gray-100 text-xs font-bold text-gray-600">
                      {item.code}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-gray-800">
                        {item.name}
                      </span>
                      <span className="block text-[11px] text-gray-400">
                        {item.sub}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : (
            <>
              {recents.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-[11px] uppercase font-bold text-gray-400 tracking-wide px-1 mb-1">
                    Recent Searches
                  </h4>
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
                        <span className="block text-sm font-semibold text-gray-800">
                          {item.name}
                        </span>
                        <span className="block text-[11px] text-gray-400">
                          {item.sub}
                        </span>
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
                <h4 className="text-[11px] uppercase font-bold text-gray-400 tracking-wide px-1 mb-1">
                  E-Visa Destinations
                </h4>
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

              <div>
                <h4 className="text-[11px] uppercase font-bold text-gray-400 tracking-wide px-1 mb-1">
                  Popular Searches
                </h4>
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
                      <span className="block text-sm font-semibold text-gray-800">
                        {item.name}
                      </span>
                      <span className="block text-[11px] text-gray-400">
                        {item.sub}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   MAIN COMPONENT
--------------------------------------------------------- */
export default function HeroSection() {
  const [activeTab, setActiveTab] = useState("flights");
  const [tripType, setTripType] = useState("oneway");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState("");
  const [travelersOpen, setTravelersOpen] = useState(false);

  const displayValue = `${adults} Adult${adults > 1 ? "s" : ""}${
    children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""
  }${infants > 0 ? `, ${infants} Infant${infants > 1 ? "s" : ""}` : ""}`;

  // Dates
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(null);
  const [openDeparture, setOpenDeparture] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);

  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());
  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openCheckOut, setOpenCheckOut] = useState(false);

  const [travelDate, setTravelDate] = useState(new Date());
  const [openTravelDate, setOpenTravelDate] = useState(false);

  const [cabDate, setCabDate] = useState(new Date());
  const [openCabDate, setOpenCabDate] = useState(false);
  const [pickupTime, setPickupTime] = useState("10:00");

  // Location values now hold objects: { code, name, sub } | null
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [hotelDestination, setHotelDestination] = useState(null);
  const [rooms, setRooms] = useState("");

  const [holidayFrom, setHolidayFrom] = useState(null);
  const [holidayTo, setHolidayTo] = useState(null);

  const [busFrom, setBusFrom] = useState(null);
  const [busTo, setBusTo] = useState(null);

  const [cabTripType, setCabTripType] = useState("oneway");
  const [cabFrom, setCabFrom] = useState(null);
  const [cabTo, setCabTo] = useState(null);

  const tabs = [
    { id: "flights", label: "Flights", icon: Plane },
    { id: "hotels", label: "Hotels", icon: Hotel },
    { id: "holidays", label: "Holidays", icon: MapPin },
    { id: "buses", label: "Buses", icon: Bus },
    { id: "cabs", label: "Cabs", icon: Car },
  ];

  const formatWeekday = (date) =>
    date ? date.toLocaleDateString("en-US", { weekday: "long" }) : "";

  return (
    <section
      className="relative bg-cover bg-center h-[560px] flex items-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.35)), url('https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      <div className="max-w-7xl mx-auto w-full px-6 relative z-10 -mt-4">
        <h1 className="text-5xl font-bold text-white mb-2 tracking-wide">
          Make My Bharat Yatra
        </h1>
        <p className="text-white text-lg font-light mb-6 opacity-90">
          Flights • Hotels • Holiday Packages • Buses • Cabs
        </p>

        <div className="rounded-2xl shadow-2xl">
          {/* Tab Bar */}
          <div className="border-b border-gray-100">
            <div className="inline-flex bg-gradient-to-r from-[#7a3600]/90 to-[#a84b00]/90 rounded-t-xl overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-10 py-5 font-semibold transition ${
                      isActive
                        ? "bg-white text-orange-600 border-t-4 border-orange-500"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel */}
          <div className="relative rounded-b-xl bg-white p-6 pb-24">
            {/* ---------------- FLIGHTS ---------------- */}
            {activeTab === "flights" && (
              <div>
                <div className="flex flex-wrap space-x-6 mb-4 text-xs font-semibold text-gray-600">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tripType"
                      checked={tripType === "oneway"}
                      onChange={() => setTripType("oneway")}
                      className="accent-orange-600 w-4 h-4"
                    />
                    <span className={tripType === "oneway" ? "text-orange-600" : ""}>
                      One Way
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer hover:text-orange-600">
                    <input
                      type="radio"
                      name="tripType"
                      checked={tripType === "roundtrip"}
                      onChange={() => setTripType("roundtrip")}
                      className="accent-orange-600 w-4 h-4"
                    />
                    <span className={tripType === "roundtrip" ? "text-orange-600" : ""}>
                      Round Trip
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer hover:text-orange-600">
                    <input
                      type="radio"
                      name="tripType"
                      checked={tripType === "multicity"}
                      onChange={() => setTripType("multicity")}
                      className="accent-orange-600 w-4 h-4"
                    />
                    <span className={tripType === "multicity" ? "text-orange-600" : ""}>
                      Multi City
                    </span>
                  </label>
                  <span className="ml-auto text-gray-400 font-normal">
                    Book International and Domestic Flights
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
                  <div
  className="lg:col-span-3 p-4 hover:bg-gray-50/80 transition cursor-pointer"
  
>
                    <LocationSearchBox
                      label="From"
                      value={from}
                      placeholder="New Delhi"
                      onSelect={setFrom}
                    />
                  </div>

                  <div className="lg:col-span-3 p-4 lg:pl-6 hover:bg-gray-50/80 transition">
                    <LocationSearchBox
                      label="To"
                      value={to}
                      placeholder="Leh"
                      onSelect={setTo}
                    />
                  </div>

                  {/* Departure */}
                  <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50/80 transition relative">
                    <span
                      className="text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center justify-between"
                      onClick={() => {
                        setOpenDeparture(!openDeparture);
                        setOpenReturn(false);
                      }}
                    >
                      Departure <ChevronDown className="w-3 h-3" />
                    </span>
                    <div
                      onClick={() => {
                        setOpenDeparture(!openDeparture);
                        setOpenReturn(false);
                      }}
                    >
                      <div className="text-xl font-bold text-gray-800">
                        {departureDate ? departureDate.getDate() : "--"}{" "}
                        <span className="text-sm font-semibold">
                          {departureDate
                            ? departureDate.toLocaleDateString("en-GB", {
                                month: "short",
                                year: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatWeekday(departureDate)}
                      </span>
                    </div>

                    {openDeparture && (
                      <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20 left-0">
                        <DayPicker
                          mode="single"
                          selected={departureDate}
                          onSelect={(date) => {
                            setDepartureDate(date);
                            setOpenDeparture(false);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Return */}
                  <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50/80 transition relative">
                    <span
                      className="text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center justify-between"
                      onClick={() => {
                        if (tripType === "roundtrip") {
                          setOpenReturn(!openReturn);
                          setOpenDeparture(false);
                        }
                      }}
                    >
                      Return <ChevronDown className="w-3 h-3" />
                    </span>

                    {tripType === "roundtrip" ? (
                      <div
                        onClick={() => {
                          setOpenReturn(!openReturn);
                          setOpenDeparture(false);
                        }}
                      >
                        <div className="text-xl font-bold text-gray-800">
                          {returnDate ? returnDate.getDate() : "--"}{" "}
                          <span className="text-sm font-semibold">
                            {returnDate
                              ? returnDate.toLocaleDateString("en-GB", {
                                  month: "short",
                                  year: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatWeekday(returnDate)}
                        </span>
                      </div>
                    ) : (
                      <div
                        className="text-xs text-gray-400 font-medium mt-1 leading-tight"
                        onClick={() => setTripType("roundtrip")}
                      >
                        Tap to add return date for savings
                      </div>
                    )}

                    {openReturn && tripType === "roundtrip" && (
                      <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20 left-0">
                        <DayPicker
                          mode="single"
                          selected={returnDate}
                          onSelect={(date) => {
                            setReturnDate(date);
                            setOpenReturn(false);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Travelers & Class */}
                  <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50/80 transition relative">
                    <span
                      className="text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center justify-between"
                      onClick={() => setTravelersOpen(!travelersOpen)}
                    >
                      Travellers &amp; Class <ChevronDown className="w-3 h-3" />
                    </span>
                    <div
                      className="text-base font-bold text-gray-800 mt-0.5"
                      onClick={() => setTravelersOpen(!travelersOpen)}
                    >
                      {displayValue}
                      {travelClass ? `, ${travelClass}` : ", Economy"}
                    </div>

                    {travelersOpen && (
                      <div className="absolute right-0 mt-2 w-72 space-y-4 p-4 bg-white shadow-lg rounded-xl border border-gray-100 z-20">
                        <div className="flex items-center justify-between">
                          <label htmlFor="adultCount" className="text-sm text-gray-700">
                            Adults
                          </label>
                          <input
                            type="number"
                            id="adultCount"
                            min={1}
                            max={9}
                            value={adults}
                            onChange={(e) => setAdults(Number(e.target.value))}
                            onClick={(e) => e.stopPropagation()}
                            className="w-20 border border-gray-300 rounded-md px-3 py-2 text-center text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label htmlFor="childCount" className="text-sm text-gray-700">
                            Children
                          </label>
                          <input
                            type="number"
                            id="childCount"
                            min={0}
                            max={9}
                            value={children}
                            onChange={(e) => setChildren(Number(e.target.value))}
                            onClick={(e) => e.stopPropagation()}
                            className="w-20 border border-gray-300 rounded-md px-3 py-2 text-center text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label htmlFor="infantCount" className="text-sm text-gray-700">
                            Infants
                          </label>
                          <input
                            type="number"
                            id="infantCount"
                            min={0}
                            max={9}
                            value={infants}
                            onChange={(e) => setInfants(Number(e.target.value))}
                            onClick={(e) => e.stopPropagation()}
                            className="w-20 border border-gray-300 rounded-md px-3 py-2 text-center text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                        <div>
                          <label htmlFor="travelClass" className="text-sm text-gray-700">
                            Travel Class
                          </label>
                          <select
                            id="travelClass"
                            value={travelClass}
                            onChange={(e) => setTravelClass(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 mt-1"
                          >
                            <option value="">Choose Travel Class</option>
                            <option value="Economy">Economy</option>
                            <option value="Premium Economy">Premium Economy</option>
                            <option value="Business">Business</option>
                            <option value="First Class">First Class</option>
                          </select>
                        </div>
                        <button
                          onClick={() => setTravelersOpen(false)}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-md py-2 transition"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-bold text-gray-500 uppercase mr-2">
                      Special Fares:
                    </span>
                    {["Regular", "Student", "Armed Forces", "Senior Citizen"].map(
                      (fare, i) => (
                        <label key={fare} className="cursor-pointer">
                          <input
                            type="radio"
                            name="fare"
                            defaultChecked={i === 0}
                            className="peer hidden"
                          />
                          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 peer-checked:border-orange-500 peer-checked:bg-orange-50">
                            <div className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center">
                              <div className="hidden peer-checked:block w-2 h-2 rounded-full bg-orange-500" />
                            </div>
                            <span className="font-semibold text-sm">{fare}</span>
                          </div>
                        </label>
                      )
                    )}
                  </div>
                  <button className="absolute left-1/2 -translate-x-1/2 -bottom-18 bg-gradient-to-r from-[#9b3f00] via-[#c45100] to-[#ff5a00] text-white px-24 py-5 rounded-full font-bold text-2xl tracking-[3px] uppercase shadow-[0_15px_35px_rgba(0,0,0,.25)] hover:scale-105 transition">
                    Search Flights
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- HOTELS ---------------- */}
            {activeTab === "hotels" && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
                  <div className="lg:col-span-5 p-4 hover:bg-gray-50">
                    <LocationSearchBox
                      label="City, Area or Property Name"
                      value={hotelDestination}
                      placeholder="Goa, India"
                      onSelect={setHotelDestination}
                    />
                  </div>

                  <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50 relative">
                    <span
                      className="text-xs uppercase text-gray-400 block mb-1"
                      onClick={() => {
                        setOpenCheckIn(!openCheckIn);
                        setOpenCheckOut(false);
                      }}
                    >
                      Check-In
                    </span>
                    <div
                      className="text-xl font-bold text-gray-800"
                      onClick={() => {
                        setOpenCheckIn(!openCheckIn);
                        setOpenCheckOut(false);
                      }}
                    >
                      {checkIn ? checkIn.getDate() : "--"}{" "}
                      <span className="text-sm font-semibold">
                        {checkIn
                          ? checkIn.toLocaleDateString("en-GB", {
                              month: "short",
                              year: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    {openCheckIn && (
                      <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20">
                        <DayPicker
                          mode="single"
                          selected={checkIn}
                          onSelect={(date) => {
                            setCheckIn(date);
                            setOpenCheckIn(false);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50 relative">
                    <span
                      className="text-xs uppercase text-gray-400 block mb-1"
                      onClick={() => {
                        setOpenCheckOut(!openCheckOut);
                        setOpenCheckIn(false);
                      }}
                    >
                      Check-Out
                    </span>
                    <div
                      className="text-xl font-bold text-gray-800"
                      onClick={() => {
                        setOpenCheckOut(!openCheckOut);
                        setOpenCheckIn(false);
                      }}
                    >
                      {checkOut ? checkOut.getDate() : "--"}{" "}
                      <span className="text-sm font-semibold">
                        {checkOut
                          ? checkOut.toLocaleDateString("en-GB", {
                              month: "short",
                              year: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    {openCheckOut && (
                      <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20 right-0">
                        <DayPicker
                          mode="single"
                          selected={checkOut}
                          onSelect={(date) => {
                            setCheckOut(date);
                            setOpenCheckOut(false);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-3 p-4 cursor-pointer hover:bg-gray-50">
                    <span className="text-xs uppercase text-gray-400 block mb-1">
                      Rooms &amp; Guests
                    </span>
                    <select
                      value={rooms}
                      onChange={(e) => setRooms(e.target.value)}
                      className="w-full text-xl font-bold text-gray-800 bg-transparent outline-none cursor-pointer"
                    >
                      <option value="">1 Room, 2 Adults</option>
                      <option value="2-1">2 Adult 1 Room</option>
                      <option value="2-2">2 Adult 2 Room</option>
                      <option value="3-1">3 Adult 1 Room</option>
                      <option value="3-2">3 Adult 2 Room</option>
                      <option value="4-1">4 Adult 1 Room</option>
                      <option value="4-2">4 Adult 2 Room</option>
                    </select>
                  </div>
                </div>

               <button className="absolute left-1/2 -translate-x-1/2 -bottom-20 bg-gradient-to-r from-[#9b3f00] via-[#c45100] to-[#ff5a00] text-white px-24 py-5 rounded-full font-bold text-2xl tracking-[3px] uppercase shadow-[0_15px_35px_rgba(0,0,0,.25)] hover:scale-105 transition">
  Search Hotels
</button>
              </div>
            )}

            {/* ---------------- HOLIDAYS ---------------- */}
            {activeTab === "holidays" && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
                  <div className="lg:col-span-6 p-4 hover:bg-gray-50">
                    <LocationSearchBox
                      label="From City"
                      value={holidayFrom}
                      placeholder="New Delhi"
                      onSelect={setHolidayFrom}
                    />
                  </div>
                  <div className="lg:col-span-6 p-4 hover:bg-gray-50">
                    <LocationSearchBox
                      label="Where do you want to go?"
                      value={holidayTo}
                      placeholder="Kashmir, India"
                      onSelect={setHolidayTo}
                      align="right"
                    />
                  </div>
                </div>
               <button className="absolute left-1/2 -translate-x-1/2 -bottom-20 bg-gradient-to-r from-[#9b3f00] via-[#c45100] to-[#ff5a00] text-white px-24 py-5 rounded-full font-bold text-2xl tracking-[3px] uppercase shadow-[0_15px_35px_rgba(0,0,0,.25)] hover:scale-105 transition">
  Search Holidays
</button>
              </div>
            )}

            {/* ---------------- BUSES ---------------- */}
            {activeTab === "buses" && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
                  <div className="lg:col-span-4 p-4 hover:bg-gray-50">
                    <LocationSearchBox
                      label="From City"
                      value={busFrom}
                      placeholder="Delhi"
                      onSelect={setBusFrom}
                    />
                  </div>
                  <div className="lg:col-span-4 p-4 hover:bg-gray-50">
                    <LocationSearchBox
                      label="To City"
                      value={busTo}
                      placeholder="Manali"
                      onSelect={setBusTo}
                    />
                  </div>
                  <div className="lg:col-span-4 p-4 cursor-pointer hover:bg-gray-50 relative">
                    <span
                      className="text-xs uppercase text-gray-400 block mb-1"
                      onClick={() => setOpenTravelDate(!openTravelDate)}
                    >
                      Travel Date
                    </span>
                    <div
                      className="text-xl font-bold text-gray-800"
                      onClick={() => setOpenTravelDate(!openTravelDate)}
                    >
                      {travelDate ? travelDate.getDate() : "--"}{" "}
                      <span className="text-sm font-semibold">
                        {travelDate
                          ? travelDate.toLocaleDateString("en-GB", {
                              month: "short",
                              year: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    {openTravelDate && (
                      <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20 right-0">
                        <DayPicker
                          mode="single"
                          selected={travelDate}
                          onSelect={(date) => {
                            setTravelDate(date);
                            setOpenTravelDate(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
               <button className="absolute left-1/2 -translate-x-1/2 -bottom-20 bg-gradient-to-r from-[#9b3f00] via-[#c45100] to-[#ff5a00] text-white px-24 py-5 rounded-full font-bold text-2xl tracking-[3px] uppercase shadow-[0_15px_35px_rgba(0,0,0,.25)] hover:scale-105 transition">
  Search Buses
</button>
              </div>
            )}

            {/* ---------------- CABS ---------------- */}
            {activeTab === "cabs" && (
              <div>
                <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-black mb-4">
                  {[
                    { id: "oneway", label: "Outstation One-Way" },
                    { id: "round", label: "Outstation Round-Trip" },
                    { id: "airport", label: "Airport Transfers" },
                    { id: "hourly", label: "Hourly Rentals" },
                  ].map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2 cursor-pointer relative">
                      <input
                        type="radio"
                        name="cabTripType"
                        checked={cabTripType === opt.id}
                        onChange={() => setCabTripType(opt.id)}
                        className="accent-orange-600 w-4 h-4"
                      />
                      {opt.label}
                      {opt.id === "hourly" && (
                        <span className="absolute -top-3 -right-8 text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
                  <div className="lg:col-span-3 p-4 cursor-pointer hover:bg-gray-50">
                    <span className="text-xs uppercase text-gray-400 block mb-1">
                      Trip Type
                    </span>
                    <div className="text-xl font-bold text-gray-800">
                      {cabTripType === "oneway" && "Outstation One-Way"}
                      {cabTripType === "round" && "Outstation Round-Trip"}
                      {cabTripType === "airport" && "Airport Transfers"}
                      {cabTripType === "hourly" && "Hourly Rentals"}
                    </div>
                  </div>
                  <div className="lg:col-span-3 p-4 hover:bg-gray-50/80 transition cursor-pointer">
                    <LocationSearchBox
                      label="From Location"
                      value={cabFrom}
                      placeholder="Delhi NCR"
                      onSelect={setCabFrom}
                    />
                  </div>
                  <div className="lg:col-span-3 p-4 hover:bg-gray-50/80 transition cursor-pointer">
                    <LocationSearchBox
                      label="To Location"
                      value={cabTo}
                      placeholder="Agra"
                      onSelect={setCabTo}
                    />
                  </div>
                  <div className="lg:col-span-3 p-4 cursor-pointer hover:bg-gray-50 relative">
                    <span
                      className="text-xs uppercase text-gray-400 block mb-1"
                      onClick={() => setOpenCabDate(!openCabDate)}
                    >
                      Pickup Date &amp; Time
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="text-xl font-bold text-gray-800"
                        onClick={() => setOpenCabDate(!openCabDate)}
                      >
                        {cabDate ? cabDate.getDate() : "--"}{" "}
                        <span className="text-sm font-semibold">
                          {cabDate
                            ? cabDate.toLocaleDateString("en-GB", {
                                month: "short",
                              })
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 border-l pl-2 border-gray-200">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <input
                          type="time"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm font-semibold text-gray-800 outline-none w-[70px]"
                        />
                      </div>
                    </div>
                    {openCabDate && (
                      <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20 right-0">
                        <DayPicker
                          mode="single"
                          selected={cabDate}
                          onSelect={(date) => {
                            setCabDate(date);
                            setOpenCabDate(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <button className="absolute left-1/2 -translate-x-1/2 -bottom-18 bg-gradient-to-r from-[#9b3f00] via-[#c45100] to-[#ff5a00] text-white px-24 py-5 rounded-full font-bold text-2xl tracking-[3px] uppercase shadow-[0_15px_35px_rgba(0,0,0,.25)] hover:scale-105 transition">
  Search Cabs
</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}