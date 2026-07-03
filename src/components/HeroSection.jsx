"use client";
import { useRouter } from "next/router";
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
import { FaPlane, FaHotel, FaMapMarkerAlt, FaBus, FaCar } from "react-icons/fa";
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
function LocationSearchBox({ label, value, placeholder, onSelect, align = "left", showAllSections = true }) {
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
      className="relative w-full h-full cursor-pointer"
      ref={boxRef}
      onClick={() => setOpen((prev) => !prev)}
    >
      <span className="text-xs uppercase tracking-wider text-gray-400 block mb-1">
        {label}
      </span>
      <div className="pointer-events-none">
        <div className="text-xl font-bold text-gray-800 truncate">
          {value ? value.name : placeholder}
        </div>
        {value?.sub && (
          <span className="text-xs text-gray-500 truncate block">
            {value.code}, {value.sub}
          </span>
        )}
      </div>

      {open && (
        <div
          className={`absolute mt-2 w-[340px] bg-white shadow-2xl rounded-xl border border-gray-100 z-30 flex flex-col overflow-hidden ${
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
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              className="w-full text-sm outline-none"
            />
          </div>

          <div className="overflow-y-auto px-3 pb-3">
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
                {showAllSections && (
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
                  </>
                )}

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
        </div>
      )}
    </div>
  );
}
function RoomsGuestsBox({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const rooms = value?.rooms ?? 1;
  const adults = value?.adults ?? 2;
  const children = value?.children ?? 0;

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function update(patch) {
    onChange({ rooms, adults, children, ...patch });
  }

  function Counter({ label, sub, val, min, onDec, onInc }) {
    return (
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDec(); }}
            disabled={val <= min}
            className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:border-orange-400 hover:text-orange-500 transition"
          >
            –
          </button>
          <span className="w-5 text-center font-semibold text-gray-800">{val}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onInc(); }}
            className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 font-bold hover:border-orange-400 hover:text-orange-500 transition"
          >
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full cursor-pointer" ref={boxRef}>
      <span className="text-xs uppercase text-gray-400 block mb-1">Rooms &amp; Guests</span>
      <div onClick={() => setOpen((p) => !p)}>
        <div className="text-xl font-bold text-gray-800 flex items-center gap-1">
          {rooms} Room{rooms > 1 ? "s" : ""}, {adults} Adult{adults > 1 ? "s" : ""}
          {children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white shadow-2xl rounded-xl border border-gray-100 z-30 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Counter label="Room" val={rooms} min={1}
            onDec={() => update({ rooms: Math.max(1, rooms - 1) })}
            onInc={() => update({ rooms: Math.min(9, rooms + 1) })} />
          <div className="border-t border-gray-100" />
          <Counter label="Adults" val={adults} min={1}
            onDec={() => update({ adults: Math.max(1, adults - 1) })}
            onInc={() => update({ adults: Math.min(20, adults + 1) })} />
          <div className="border-t border-gray-100" />
          <Counter label="Children" sub="0 - 17 Years Old" val={children} min={0}
            onDec={() => update({ children: Math.max(0, children - 1) })}
            onInc={() => update({ children: Math.min(10, children + 1) })} />
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">
            Please provide the right number of children along with their correct age for the best options and prices.
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg py-2.5 transition"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
/* ---------------------------------------------------------
   MAIN COMPONENT
--------------------------------------------------------- */
export default function HeroSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("flights");
  const [tripType, setTripType] = useState("oneway");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState("");
const [openMultiDate, setOpenMultiDate] = useState(null); // index of open date picker
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
  const [openPrice, setOpenPrice] = useState(false);

const [priceRange, setPriceRange] = useState("₹0-₹1500");

  const [travelDate, setTravelDate] = useState(new Date());
  const [openTravelDate, setOpenTravelDate] = useState(false);

  // Location values now hold objects: { code, name, sub } | null
const [from, setFrom] = useState(
  indianCities.find((c) => c.code === "DEL")
);
const [to, setTo] = useState(
  indianCities.find((c) => c.code === "IXL")
);

const [multiCityLegs, setMultiCityLegs] = useState([
  { from: from, to: to, date: new Date() },
  { from: to, to: null, date: new Date(Date.now() + 86400000) },
]);
const [hotelDestination, setHotelDestination] = useState(null);
const [roomsGuests, setRoomsGuests] = useState({
  rooms: 1,
  adults: 2,
  children: 0,
});

  const [holidayFrom, setHolidayFrom] = useState(null);
  const [holidayTo, setHolidayTo] = useState(null);
const [holidayDepartureDate, setHolidayDepartureDate] = useState("");

const [showRoomDropdown, setShowRoomDropdown] = useState(false);
const [holidayRooms, setHolidayRooms] = useState({
  rooms: 1,
  adults: 2,
  children: 0,
});

  const [busFrom, setBusFrom] = useState(null);
  const [busTo, setBusTo] = useState(null);

  const [cabTripType, setCabTripType] = useState("oneway");
  const [cabFrom, setCabFrom] = useState(null);
  const [cabTo, setCabTo] = useState(null);
  const [cabDate, setCabDate] = useState(null);        // departure date
const [cabReturnDate, setCabReturnDate] = useState(null); // round-trip return date
const [pickupTime, setPickupTime] = useState("10:00");
const [dropTime, setDropTime] = useState("");         // round-trip drop time
const [cabPackage, setCabPackage] = useState("1hr-10km"); // hourly rental package
const [openCabDate, setOpenCabDate] = useState(false);
const [openReturnDate, setOpenReturnDate] = useState(false);          

const tabs = [
  { id: "flights", label: "Flights", icon: FaPlane },
  { id: "hotels", label: "Hotels", icon: FaHotel },
  { id: "holidays", label: "Holidays", icon: FaMapMarkerAlt },
  { id: "buses", label: "Buses", icon: FaBus },
  { id: "cabs", label: "Cabs", icon: FaCar },
];
  const searchLabels = {
  flights: "Search Flights",
  hotels: "Search Hotels",
  holidays: "Search Holidays",
  buses: "Search Buses",
  cabs: "Search Cabs",
};
function handleSearch() {
if (activeTab === "flights") {
  if (tripType === "multicity") {
    // Validate all legs have From, To and Date filled
    const incomplete = multiCityLegs.some((leg) => !leg.from || !leg.to || !leg.date);
    if (incomplete) {
      alert("Please fill From, To and Date for all cities.");
      return;
    }

    // Build query string for multiple legs
    const legsParam = multiCityLegs
      .map(
        (leg) =>
          `${leg.from.code}-${leg.to.code}-${leg.date.toISOString().split("T")[0]}`
      )
      .join(",");

    router.push(`/flights?trip=multicity&legs=${legsParam}`);
  } else {
    if (!from || !to) {
      alert("Please select From and To locations.");
      return;
    }
    router.push(
      `/flights?from=${from.code}&to=${to.code}&date=${departureDate?.toISOString().split("T")[0]}&trip=${tripType}`
    );
  }
}
  else if (activeTab === "hotels") {
    if (!hotelDestination) {
      alert("Please select a destination.");
      return;
    }
    router.push(
      `/hotels?destination=${hotelDestination.code}&checkin=${checkIn?.toISOString().split("T")[0]}&checkout=${checkOut?.toISOString().split("T")[0]}`
    );
  } else if (activeTab === "holidays") {
    if (!holidayFrom || !holidayTo) {
      alert("Please select From and To.");
      return;
    }
    router.push(`/holidays?from=${holidayFrom.code}&to=${holidayTo.code}`);
  } else if (activeTab === "buses") {
    if (!busFrom || !busTo) {
      alert("Please select From and To cities.");
      return;
    }
    router.push(
      `/buses?from=${busFrom.code}&to=${busTo.code}&date=${travelDate?.toISOString().split("T")[0]}`
    );
  } else if (activeTab === "cabs") {
    if (!cabFrom || !cabTo) {
      alert("Please select pickup and drop locations.");
      return;
    }
    router.push(
      `/cabs?from=${cabFrom.code}&to=${cabTo.code}&type=${cabTripType}`
    );
  }
}

  const formatWeekday = (date) =>
    date ? date.toLocaleDateString("en-US", { weekday: "long" }) : "";

  return (
    <section
      className="relative bg-cover bg-center min-h-[560px] flex items-center pb-16"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.35)), url('https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      <div className="max-w-7xl mx-auto w-full px-12 relative z-10 -mt-4">
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
<div className="relative rounded-b-xl bg-white p-6 pb-28">
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

{tripType !== "multicity" ? (
  <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
    <div className="lg:col-span-2 p-4 hover:bg-gray-50/80 transition cursor-pointer">
      <LocationSearchBox label="From" value={from} placeholder="New Delhi" onSelect={setFrom} />
    </div>

    <div className="lg:col-span-2 p-4 hover:bg-gray-50/80 transition">
      <LocationSearchBox label="To" value={to} placeholder="Leh" onSelect={setTo} />
    </div>

    {/* Departure */}
    <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50/80 transition relative">
      <span
        className="text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center justify-between"
        onClick={() => { setOpenDeparture(!openDeparture); setOpenReturn(false); }}
      >
        Departure <ChevronDown className="w-3 h-3" />
      </span>
      <div onClick={() => { setOpenDeparture(!openDeparture); setOpenReturn(false); }}>
        <div className="text-xl font-bold text-gray-800">
          {departureDate ? departureDate.getDate() : "--"}{" "}
          <span className="text-sm font-semibold">
            {departureDate ? departureDate.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }) : ""}
          </span>
        </div>
        <span className="text-xs text-gray-500">{formatWeekday(departureDate)}</span>
      </div>
      {openDeparture && (
        <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20 left-0">
          <DayPicker mode="single" selected={departureDate} onSelect={(date) => { setDepartureDate(date); setOpenDeparture(false); }} />
        </div>
      )}
    </div>

    {/* Return — sirf roundtrip mein */}
    {tripType === "roundtrip" && (
      <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50/80 transition relative">
        <span
          className="text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center justify-between"
          onClick={() => { setOpenReturn(!openReturn); setOpenDeparture(false); }}
        >
          Return <ChevronDown className="w-3 h-3" />
        </span>
        <div onClick={() => { setOpenReturn(!openReturn); setOpenDeparture(false); }}>
          <div className="text-xl font-bold text-gray-800">
            {returnDate ? returnDate.getDate() : "--"}{" "}
            <span className="text-sm font-semibold">
              {returnDate ? returnDate.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }) : ""}
            </span>
          </div>
          <span className="text-xs text-gray-500">{formatWeekday(returnDate)}</span>
        </div>
        {openReturn && (
          <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20 left-0">
            <DayPicker mode="single" selected={returnDate} onSelect={(date) => { setReturnDate(date); setOpenReturn(false); }} />
          </div>
        )}
      </div>
    )}

    {/* Tap to add return — sirf oneway mein */}
    {tripType === "oneway" && (
      <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50/80 transition" onClick={() => setTripType("roundtrip")}>
        <span className="text-xs uppercase tracking-wider text-gray-400 mb-1 block">Return</span>
        <div className="text-xs text-gray-400 font-medium mt-1 leading-tight">
          Tap to add return date for savings
        </div>
      </div>
    )}

    {/* Travellers */}
    <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50/80 transition relative">
      <span
        className="text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center justify-between"
        onClick={() => setTravelersOpen(!travelersOpen)}
      >
        Travellers <ChevronDown className="w-3 h-3" />
      </span>
      <div className="text-base font-bold text-gray-800 mt-0.5" onClick={() => setTravelersOpen(!travelersOpen)}>
        {displayValue}
      </div>

      {travelersOpen && (
        <div className="absolute right-0 mt-2 w-72 space-y-4 p-4 bg-white shadow-lg rounded-xl border border-gray-100 z-20">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Adults</label>
            <input type="number" min={1} max={9} value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              className="w-20 border border-gray-300 rounded-md px-3 py-2 text-center text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Children</label>
            <input type="number" min={0} max={9} value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              className="w-20 border border-gray-300 rounded-md px-3 py-2 text-center text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Infants</label>
            <input type="number" min={0} max={9} value={infants}
              onChange={(e) => setInfants(Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              className="w-20 border border-gray-300 rounded-md px-3 py-2 text-center text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <button onClick={() => setTravelersOpen(false)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-md py-2 transition">
            Done
          </button>
        </div>
      )}
    </div>

    {/* Cabin Class */}
    <div className="lg:col-span-2 p-4 hover:bg-gray-50/80 transition">
      <span className="text-xs uppercase tracking-wider text-gray-400 mb-1 block">Cabin Class</span>
      <select
        value={travelClass}
        onChange={(e) => setTravelClass(e.target.value)}
        className="text-base font-bold text-gray-800 outline-none bg-transparent w-full"
      >
        <option value="Economy">Economy</option>
        <option value="Premium Economy">Premium Economy</option>
        <option value="Business">Business</option>
        <option value="First Class">First Class</option>
      </select>
    </div>
  </div>
) : (
  /* -------- MULTI CITY -------- */
  <div className="space-y-3 mb-6">
    {multiCityLegs.map((leg, idx) => (
      <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        <div className="lg:col-span-4 p-4 hover:bg-gray-50/80 transition">
          <LocationSearchBox
            label="From"
            value={leg.from}
            placeholder="Delhi"
            onSelect={(val) => {
              const updated = [...multiCityLegs];
              updated[idx].from = val;
              setMultiCityLegs(updated);
            }}
          />
        </div>
        <div className="lg:col-span-4 p-4 hover:bg-gray-50/80 transition">
          <LocationSearchBox
            label="To"
            value={leg.to}
            placeholder="Select City"
            onSelect={(val) => {
              const updated = [...multiCityLegs];
              updated[idx].to = val;
              setMultiCityLegs(updated);
            }}
          />
        </div>
        <div className="lg:col-span-3 p-4 cursor-pointer hover:bg-gray-50 relative"
          onClick={() => setOpenMultiDate(openMultiDate === idx ? null : idx)}>
          <span className="text-xs uppercase text-gray-400 block mb-1">Departure</span>
          <div className="text-xl font-bold text-gray-800">
            {leg.date ? leg.date.getDate() : "--"}{" "}
            <span className="text-sm font-semibold">
              {leg.date ? leg.date.toLocaleDateString("en-GB", { month: "short" }) : ""}
            </span>
          </div>
          {openMultiDate === idx && (
            <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20">
              <DayPicker mode="single" selected={leg.date} onSelect={(d) => {
                const updated = [...multiCityLegs];
                updated[idx].date = d;
                setMultiCityLegs(updated);
                setOpenMultiDate(null);
              }} />
            </div>
          )}
        </div>
        <div className="lg:col-span-1 p-4 flex items-center justify-center">
          {idx === multiCityLegs.length - 1 && idx > 1 && (
            <button
              onClick={() => setMultiCityLegs(multiCityLegs.filter((_, i) => i !== idx))}
              className="text-red-500 text-xs font-semibold"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    ))}
    <button
      onClick={() =>
        setMultiCityLegs([...multiCityLegs, { from: multiCityLegs[multiCityLegs.length - 1].to, to: null, date: new Date() }])
      }
      className="text-orange-600 border border-orange-500 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-orange-50 transition"
    >
      + Add Another City
    </button>
  </div>
)}
  </div>
            )}

            {/* ---------------- HOTELS ---------------- */}
            {activeTab === "hotels" && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
                  <div className="lg:col-span-4 p-4 hover:bg-gray-50">
                    <LocationSearchBox
                      label="City, Area or Property Name"
                      value={hotelDestination}
                      placeholder="Goa, India"
                      onSelect={setHotelDestination}
                      showAllSections={false}
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

               <div className="lg:col-span-2 p-4 hover:bg-gray-50">
  <RoomsGuestsBox
    value={roomsGuests}
    onChange={setRoomsGuests}
  />
</div>
<div className="lg:col-span-2 p-4 hover:bg-gray-50 relative">

  <span
    className="text-xs uppercase text-gray-400 block mb-1 cursor-pointer"
    onClick={() => setOpenPrice(!openPrice)}
  >
    Price Per Night
  </span>

  <div
    className="text-lg font-bold text-gray-800 cursor-pointer"
    onClick={() => setOpenPrice(!openPrice)}
  >
    {priceRange}
  </div>

  {openPrice && (
    <div className="absolute right-0 mt-2 w-52 bg-white border rounded-xl shadow-lg z-30">

      {[
        "₹0-₹1500",
        "₹1500-₹2500",
        "₹2500-₹5000",
        "₹5000+",
      ].map((price) => (
        <div
          key={price}
          className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            setPriceRange(price);
            setOpenPrice(false);
          }}
        >
          {price}
        </div>
      ))}

    </div>
  )}

</div>
                </div>
              </div>
            )}

            {/* ---------------- HOLIDAYS ---------------- */}
{activeTab === "holidays" && (
  <div>
    <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">

      {/* From City */}
      <div className="lg:col-span-3 p-4 hover:bg-gray-50">
        <LocationSearchBox
          label="From City"
          value={holidayFrom}
          placeholder="New Delhi"
          onSelect={setHolidayFrom}
          showAllSections={false}
        />
      </div>

      {/* Destination */}
      <div className="lg:col-span-3 p-4 hover:bg-gray-50">
        <LocationSearchBox
          label="To City/Country/Category"
          value={holidayTo}
          placeholder="Goa"
          onSelect={setHolidayTo}
          align="right"
          showAllSections={false}
        />
      </div>

      {/* Departure Date */}
      <div className="lg:col-span-3 p-4 hover:bg-gray-50 cursor-pointer">
        <p className="text-xs text-gray-500 mb-1">Departure Date</p>
        <input
          type="date"
          value={holidayDepartureDate}
          onChange={(e) => setHolidayDepartureDate(e.target.value)}
          className="w-full outline-none bg-transparent font-semibold"
        />
      </div>

      {/* Rooms & Guests */}
      <div className="lg:col-span-3 p-4 hover:bg-gray-50 relative">
        <p className="text-xs text-gray-500 mb-1">Rooms & Guests</p>

        <div
          className="font-semibold cursor-pointer"
          onClick={() => setShowRoomDropdown(!showRoomDropdown)}
        >
          {holidayRooms.rooms} Room, {holidayRooms.adults} Adults
        </div>

{showRoomDropdown && (
  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border p-4 z-50">

    <div className="flex justify-between items-center mb-4">
      <span className="font-medium">Rooms</span>

      <div className="flex items-center gap-3">
        <button
          onClick={() =>
            setHolidayRooms({
              ...holidayRooms,
              rooms: Math.max(1, holidayRooms.rooms - 1),
            })
          }
          className="w-8 h-8 rounded-full border"
        >
          -
        </button>

        <span>{holidayRooms.rooms}</span>

        <button
          onClick={() =>
            setHolidayRooms({
              ...holidayRooms,
              rooms: holidayRooms.rooms + 1,
            })
          }
          className="w-8 h-8 rounded-full border"
        >
          +
        </button>
      </div>
    </div>

    <div className="flex justify-between items-center mb-4">
      <span className="font-medium">Adults</span>

      <div className="flex items-center gap-3">
        <button
          onClick={() =>
            setHolidayRooms({
              ...holidayRooms,
              adults: Math.max(1, holidayRooms.adults - 1),
            })
          }
          className="w-8 h-8 rounded-full border"
        >
          -
        </button>

        <span>{holidayRooms.adults}</span>

        <button
          onClick={() =>
            setHolidayRooms({
              ...holidayRooms,
              adults: holidayRooms.adults + 1,
            })
          }
          className="w-8 h-8 rounded-full border"
        >
          +
        </button>
      </div>
    </div>

    <button
      onClick={() => setShowRoomDropdown(false)}
      className="w-full bg-orange-500 text-white rounded-lg py-2"
    >
      Apply
    </button>

  </div>
)}
  
      </div>


    </div>
  </div>
)}

            {/* ---------------- BUSES ---------------- */}
            {activeTab === "buses" && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
                  <div className="lg:col-span-5 p-4 hover:bg-gray-50">
                    <LocationSearchBox
                      label="From City"
                      value={busFrom}
                      placeholder="Delhi"
                      onSelect={setBusFrom}
                      showAllSections={false}
                    />
                  </div>
                  <div className="lg:col-span-5 p-4 hover:bg-gray-50">
                    <LocationSearchBox
                      label="To City"
                      value={busTo}
                      placeholder="Manali"
                      onSelect={setBusTo}
                      showAllSections={false}
                    />
                  </div>
                  <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50 relative">
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
              </div>
            )}

{/* ---------------- CABS ---------------- */}
{activeTab === "cabs" && (
  <div>
    {/* Trip type radio buttons */}
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
        </label>
      ))}
    </div>

    {/* -------- OUTSTATION ONE-WAY -------- */}
    {cabTripType === "oneway" && (
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
        <div className="lg:col-span-3 p-4 hover:bg-gray-50/80 transition cursor-pointer">
          <LocationSearchBox label="From" value={cabFrom} placeholder="Mumbai" onSelect={setCabFrom} showAllSections={false}/>
        </div>
        <div className="lg:col-span-3 p-4 hover:bg-gray-50/80 transition cursor-pointer">
          <LocationSearchBox label="To" value={cabTo} placeholder="Pune" onSelect={setCabTo} showAllSections={false} />
        </div>
        <div className="lg:col-span-3 p-4 cursor-pointer hover:bg-gray-50 relative" onClick={() => setOpenCabDate(!openCabDate)}>
          <span className="text-xs uppercase text-gray-400 block mb-1">Departure</span>
          <div className="text-xl font-bold text-gray-800">
            {cabDate ? cabDate.getDate() : "--"}{" "}
            <span className="text-sm font-semibold">
              {cabDate ? cabDate.toLocaleDateString("en-GB", { month: "short" }) : ""}
            </span>
          </div>
          {openCabDate && (
            <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20">
              <DayPicker mode="single" selected={cabDate} onSelect={(d) => { setCabDate(d); setOpenCabDate(false); }} />
            </div>
          )}
        </div>
        <div className="lg:col-span-3 p-4 bg-gray-50/50">
          <span className="text-xs uppercase text-gray-400 block mb-1">Pickup-Time</span>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-orange-500" />
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="text-xl font-bold text-gray-800 outline-none bg-transparent"
            />
          </div>
        </div>
      </div>
    )}

    {/* -------- OUTSTATION ROUND-TRIP -------- */}
    {cabTripType === "round" && (
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
        <div className="lg:col-span-2 p-4 hover:bg-gray-50/80 transition cursor-pointer">
          <LocationSearchBox label="From" value={cabFrom} placeholder="Mumbai" onSelect={setCabFrom} showAllSections={false}/>
        </div>
        <div className="lg:col-span-2 p-4 hover:bg-gray-50/80 transition cursor-pointer">
          <LocationSearchBox label="To" value={cabTo} placeholder="Pune" onSelect={setCabTo} showAllSections={false} />
        </div>
        <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50 relative" onClick={() => setOpenCabDate(!openCabDate)}>
          <span className="text-xs uppercase text-gray-400 block mb-1">Departure</span>
          <div className="text-xl font-bold text-gray-800">
            {cabDate ? cabDate.getDate() : "--"}{" "}
            <span className="text-sm font-semibold">
              {cabDate ? cabDate.toLocaleDateString("en-GB", { month: "short" }) : ""}
            </span>
          </div>
          {openCabDate && (
            <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20">
              <DayPicker mode="single" selected={cabDate} onSelect={(d) => { setCabDate(d); setOpenCabDate(false); }} />
            </div>
          )}
        </div>
        <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50 relative" onClick={() => setOpenReturnDate(!openReturnDate)}>
          <span className="text-xs uppercase text-gray-400 block mb-1">Return</span>
          <div className="text-xl font-bold text-gray-800">
            {cabReturnDate ? cabReturnDate.getDate() : "--"}{" "}
            <span className="text-sm font-semibold">
              {cabReturnDate ? cabReturnDate.toLocaleDateString("en-GB", { month: "short" }) : ""}
            </span>
          </div>
          {openReturnDate && (
            <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20">
              <DayPicker mode="single" selected={cabReturnDate} onSelect={(d) => { setCabReturnDate(d); setOpenReturnDate(false); }} />
            </div>
          )}
        </div>
        <div className="lg:col-span-2 p-4">
          <span className="text-xs uppercase text-gray-400 block mb-1">Pickup-Time</span>
          <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}
            className="text-xl font-bold text-gray-800 outline-none bg-transparent" />
        </div>
        <div className="lg:col-span-2 p-4">
          <span className="text-xs uppercase text-gray-400 block mb-1">Drop Time</span>
          <input type="time" value={dropTime} onChange={(e) => setDropTime(e.target.value)}
            className="text-xl font-bold text-gray-800 outline-none bg-transparent" />
        </div>
      </div>
    )}

    {/* -------- AIRPORT TRANSFERS -------- */}
    {cabTripType === "airport" && (
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
        <div className="lg:col-span-3 p-4 hover:bg-gray-50/80 transition cursor-pointer">
          <LocationSearchBox label="From" value={cabFrom} placeholder="Pick up Location" onSelect={setCabFrom} showAllSections={false} />
        </div>
        <div className="lg:col-span-3 p-4 hover:bg-gray-50/80 transition cursor-pointer">
          <LocationSearchBox label="To" value={cabTo} placeholder="Drop Location" onSelect={setCabTo} showAllSections={false}/>
        </div>
        <div className="lg:col-span-3 p-4 cursor-pointer hover:bg-gray-50 relative" onClick={() => setOpenCabDate(!openCabDate)}>
          <span className="text-xs uppercase text-gray-400 block mb-1">Departure</span>
          <div className="text-xl font-bold text-gray-800">
            {cabDate ? cabDate.getDate() : "--"}{" "}
            <span className="text-sm font-semibold">
              {cabDate ? cabDate.toLocaleDateString("en-GB", { month: "short" }) : ""}
            </span>
          </div>
          {openCabDate && (
            <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20">
              <DayPicker mode="single" selected={cabDate} onSelect={(d) => { setCabDate(d); setOpenCabDate(false); }} />
            </div>
          )}
        </div>
        <div className="lg:col-span-3 p-4">
          <span className="text-xs uppercase text-gray-400 block mb-1">Pickup-Time</span>
          <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}
            className="text-xl font-bold text-gray-800 outline-none bg-transparent" />
          <p className="text-[11px] text-gray-400 mt-1">pick up time as per journey city timezone</p>
        </div>
      </div>
    )}

    {/* -------- HOURLY RENTALS -------- */}
    {cabTripType === "hourly" && (
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
        <div className="lg:col-span-4 p-4 hover:bg-gray-50/80 transition cursor-pointer">
          <LocationSearchBox label="Pickup Location" value={cabFrom} placeholder="Bangalore" onSelect={setCabFrom}showAllSections={false} />
        </div>
        <div className="lg:col-span-3 p-4 cursor-pointer hover:bg-gray-50 relative" onClick={() => setOpenCabDate(!openCabDate)}>
          <span className="text-xs uppercase text-gray-400 block mb-1">Pickup Date</span>
          <div className="text-xl font-bold text-gray-800">
            {cabDate ? cabDate.getDate() : "--"}{" "}
            <span className="text-sm font-semibold">
              {cabDate ? cabDate.toLocaleDateString("en-GB", { month: "short" }) : ""}
            </span>
          </div>
          {openCabDate && (
            <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20">
              <DayPicker mode="single" selected={cabDate} onSelect={(d) => { setCabDate(d); setOpenCabDate(false); }} />
            </div>
          )}
        </div>
        <div className="lg:col-span-2 p-4">
          <span className="text-xs uppercase text-gray-400 block mb-1">Pickup-Time</span>
          <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}
            className="text-xl font-bold text-gray-800 outline-none bg-transparent" />
        </div>
        <div className="lg:col-span-3 p-4">
          <span className="text-xs uppercase text-gray-400 block mb-1">Select Package</span>
          <select
            value={cabPackage}
            onChange={(e) => setCabPackage(e.target.value)}
            className="text-xl font-bold text-gray-800 outline-none bg-transparent w-full"
          >
            <option value="1hr-10km">1 hrs 10 kms</option>
            <option value="4hr-40km">4 hrs 40 kms</option>
            <option value="8hr-80km">8 hrs 80 kms</option>
          </select>
        </div>
      </div>
    )}
  </div>
)}
</div>

{/* ✅ SINGLE SEARCH BUTTON — sabhi tabs ke liye ek hi jagah */}
<button
  onClick={handleSearch}
  className="absolute left-1/2 -translate-x-1/2 -bottom-9 bg-gradient-to-r from-[#9b3f00] via-[#c45100] to-[#ff5a00] text-white px-24 py-5 rounded-full font-bold text-2xl tracking-[3px] uppercase shadow-[0_15px_35px_rgba(0,0,0,.25)] hover:scale-105 transition"
>
  {searchLabels[activeTab]}
</button>
</div>
        </div>
  
    </section>
  );
}