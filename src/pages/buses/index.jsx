import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function BusesPage() {
  const router = useRouter();
  const { from, to, date } = router.query;

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Search form states
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDate, setOpenDate] = useState(false);

  // Filter states
  const [selectedBusTypes, setSelectedBusTypes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState('recommended');

  // Cities list
  const indianCities = [
    "Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad",
    "Pune", "Jaipur", "Ahmedabad", "Lucknow", "Chandigarh", "Goa", "Agra",
    "Varanasi", "Patna", "Bhopal", "Indore", "Nagpur", "Surat", "Amritsar",
  ];

  // Load initial search parameters if provided
  useEffect(() => {
    if (router.isReady) {
      if (from) setSearchFrom(from);
      if (to) setSearchTo(to);
      if (date) {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
        }
      }
    }
  }, [router.isReady, from, to, date]);

  // Fetch buses when query parameters change
  useEffect(() => {
    if (!from || !to || !date) return;

    async function fetchBuses() {
      try {
        setLoading(true);
        setError('');

        const res = await fetch('/api/buses/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceCity: from,
            destinationCity: to,
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          console.error('Bus API status:', res.status, 'body:', body);
          throw new Error('Failed to fetch');
        }

        const data = await res.json();

        if (!data.success) {
          setError(data.message || 'Failed to load buses. Please try again later.');
          setBuses([]);
          return;
        }

        setBuses(data.results || []);
      } catch (err) {
        console.error('fetchBuses error:', err);
        setError('Failed to load buses. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchBuses();
  }, [from, to, date]);

  const busTypeCounts = useMemo(() => {
    const counts = {};
    buses.forEach((b) => {
      const type = b.bus_type || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [buses]);

  const visibleBuses = useMemo(() => {
    let result = [...buses];
    if (selectedBusTypes.length > 0) {
      result = result.filter((b) => selectedBusTypes.includes(b.bus_type));
    }
    result = result.filter((b) => Number(b.price) <= maxPrice);
    if (sortBy === 'price_low') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'departure_early') {
      result.sort((a, b) => (a.departure_time || '').localeCompare(b.departure_time || ''));
    }
    return result;
  }, [buses, selectedBusTypes, maxPrice, sortBy]);

  function toggleBusType(type) {
    setSelectedBusTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function resetFilters() {
    setSelectedBusTypes([]);
    setMaxPrice(5000);
  }

function handleSearch() {
  if (!searchFrom || !searchTo || !selectedDate) {
    alert("Please fill in all details");
    return;
  }

  const dateStr = selectedDate.toISOString().split("T")[0];

  router.push(
    `/buses?from=${encodeURIComponent(searchFrom)}&to=${encodeURIComponent(searchTo)}&date=${dateStr}`
  );
}

// Show search form if no results
if (!from || !to || !date) {
  return (
    <>
      <Header />

      <div className="bg-gradient-to-r from-orange-50 to-orange-100 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Search Buses
            </h1>

            <p className="text-lg text-gray-600">
              Safe and comfortable bus travel across India
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">

            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Search Bus Tickets
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">

              {/* From */}
              <div>
                <label className="text-xs uppercase font-semibold text-gray-600 block mb-2">
                  From
                </label>

                <select
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-gray-700 font-medium"
                >
                  <option value="">Select City</option>

                  {indianCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
// To
<div>
  <label className="text-xs uppercase font-semibold text-gray-600 block mb-2">
    To
  </label>

  <select
    value={searchTo}
    onChange={(e) => setSearchTo(e.target.value)}
    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-gray-700 font-medium"
  >
    <option value="">Select City</option>

    {indianCities.map((city) => (
      <option key={city} value={city}>
        {city}
      </option>
    ))}
  </select>
</div>


// Date
<div className="relative">
  <label className="text-xs uppercase font-semibold text-gray-600 block mb-2">
    Travel Date
  </label>

  <div
    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer bg-white flex items-center justify-between"
    onClick={() => setOpenDate(!openDate)}
  >
    <span className="text-gray-700 font-medium">
      {selectedDate
        ? selectedDate.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Select Date"}
    </span>

    <CalendarIcon className="w-5 h-5 text-orange-500" />
  </div>

  {openDate && (
    <div className="absolute mt-2 p-3 bg-white shadow-lg rounded-lg z-10 border-2 border-orange-200">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={(date) => {
          setSelectedDate(date);
          setOpenDate(false);
        }}
        disabled={{ before: new Date() }}
      />
    </div>
  )}
</div>


// Search Button
<div>
  <Button
    onClick={handleSearch}
    className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg uppercase tracking-wide transition-colors"
  >
    Search Buses
  </Button>
</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Show results page
  return (
    <>
      <Header />
      <div className="bg-[#F4F6F9] font-sans antialiased text-gray-800 min-h-screen">

        <header className="bg-[#0B1523] text-white p-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex-[2.5] min-w-[320px] bg-[#1E2A38] rounded h-[54px] flex items-center relative px-4">
              <div className="flex-1 flex flex-col justify-center pr-4">
                <label className="block text-[9px] uppercase text-orange-500 tracking-wider font-bold">From</label>
                <div className="text-xs font-black mt-0.5 whitespace-nowrap text-white">{from || '--'}</div>
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-full">
                <div className="h-8 border-l border-gray-600/50 absolute"></div>
                <div className="bg-[#1E2A38] border border-gray-600 rounded-full w-5 h-5 flex items-center justify-center z-10 text-gray-400">
                  ↔
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center pl-8">
                <label className="block text-[9px] uppercase text-orange-500 tracking-wider font-bold">To</label>
                <div className="text-xs font-black mt-0.5 whitespace-nowrap text-white">{to || '--'}</div>
              </div>
            </div>

            <div className="flex-1 min-w-[140px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center">
              <label className="block text-[9px] uppercase text-gray-400 tracking-wider font-medium">Travel Date</label>
              <div className="text-xs font-black mt-0.5 flex justify-between items-center whitespace-nowrap">
                <span>{date || '--'}</span>
                <CalendarIcon className="w-4 h-4 text-gray-400 ml-1" />
              </div>
            </div>

            <button
              onClick={() => router.push(`/buses?from=${from}&to=${to}&date=${date}`)}
              className="bg-gradient-to-r from-[#0B1523] to-orange-500 text-white text-base rounded px-6 h-[54px] ml-1.5 font-bold uppercase tracking-wider hover:opacity-95 transition-all"
            >
              Search
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

// Filter Sidebar
<aside className="w-1/4 bg-white p-5 rounded-lg shadow-sm h-fit hidden md:block">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-lg font-bold tracking-wide">Filters</h2>

    <button
      onClick={resetFilters}
      className="text-xs font-semibold text-orange-500 uppercase"
    >
      Reset
    </button>
  </div>

  <div className="mb-6">
    <h3 className="text-sm font-bold mb-3">Bus Type</h3>

    <div className="space-y-2 text-sm">
      {Object.keys(busTypeCounts).length === 0 && (
        <p className="text-xs text-gray-400">
          Bus types will appear here after searching
        </p>
      )}

      {Object.entries(busTypeCounts).map(([type, count]) => (
        <label
          key={type}
          className="flex items-center justify-between cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-orange-500"
              checked={selectedBusTypes.includes(type)}
              onChange={() => toggleBusType(type)}
            />

            {type}
          </span>

          <span className="text-gray-400">{count}</span>
        </label>
      ))}
    </div>
  </div>

  <hr className="my-4 border-gray-100" />

  <div>
    <h3 className="text-sm font-bold mb-2">Maximum Price</h3>

    <div className="text-xs text-gray-500 mb-2">
      ₹ {maxPrice.toLocaleString()}
    </div>

    <input
      type="range"
      className="w-full accent-orange-500"
      min="200"
      max="5000"
      step="100"
      value={maxPrice}
      onChange={(e) => setMaxPrice(Number(e.target.value))}
    />
  </div>
</aside>


<section className="w-full md:w-3/4 space-y-4">
  <div className="flex justify-between items-center text-sm pt-2">
    <div>
      <h1 className="text-base font-bold text-gray-900">
        Showing buses from {from} to {to}
      </h1>

      <p className="text-xs text-gray-500 mt-0.5">
        {date} • {visibleBuses.length} results
      </p>
    </div>

    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Sort:</span>
                >
<option value="recommended">Recommended</option>
<option value="price_low">Price: Low to High</option>
<option value="departure_early">Departure: Earliest</option>
</select>
</div>
</div>

{loading && (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-gray-500">
    Loading buses...
  </div>
)}

{!loading && error && (
  <div className="bg-white rounded-lg shadow-sm border border-red-100 p-10 text-center text-red-500">
    {error}
  </div>
)}

{!loading && !error && visibleBuses.length === 0 && (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-gray-500">
    No buses found for this route.
  </div>
)}

{!loading && !error && visibleBuses.map((bus) => (
  <BusCard
    key={bus.id}
    bus={bus}
    isExpanded={expandedId === bus.id}
    onToggle={() =>
      setExpandedId(expandedId === bus.id ? null : bus.id)
    }
  />
))}

function BusCard({ bus, isExpanded, onToggle }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-3">
      <div className="p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-[140px]">
          <div className="font-bold text-blue-900 text-base">{bus.operator_name}</div>
          <div className="text-xs text-gray-400">{bus.bus_type}</div>
        </div>

        <div className="text-center">
          <div className="text-lg font-bold">{bus.departure_time}</div>
          <div className="text-xs font-semibold text-gray-500">{bus.origin}</div>
        </div>

        <div className="text-center min-w-[100px]">
          <div className="text-xs text-gray-400">{bus.duration}</div>
          <div className="relative my-1 flex items-center justify-center">
            <div className="w-full border-t border-dashed border-gray-300 absolute"></div>
            <span className="relative bg-white px-2 z-10 text-emerald-500 text-xs font-bold">🚌</span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-lg font-bold">{bus.arrival_time}</div>
          <div className="text-xs font-semibold text-gray-500">{bus.destination}</div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">₹ {Number(bus.price).toLocaleString()}</div>
<div className="text-[10px] text-gray-400">Per Seat</div>
</div>

<div className="flex flex-col items-end gap-1">
  <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2 rounded uppercase tracking-wider transition-colors">
    View Seats
  </button>

  {bus.seats_available != null && (
    <span className="text-[11px] text-orange-600 font-medium">
      {bus.seats_available} seats left
    </span>
  )}

  <button
    onClick={onToggle}
    className="text-[10px] text-orange-500 font-bold mt-1 flex items-center gap-0.5"
  >
    {isExpanded ? "Hide" : "View"} Details
  </button>
</div>
</div>

{isExpanded && (
  <div className="p-5 bg-gray-50 text-xs text-gray-600 border-t border-gray-100">
    <div className="font-bold text-gray-900 mb-3">
      {bus.origin} → {bus.destination}
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <span className="text-gray-400 block">Operator</span>
        {bus.operator_name}
      </div>

      <div>
        <span className="text-gray-400 block">Bus Type</span>
        {bus.bus_type}
      </div>

      <div>
        <span className="text-gray-400 block">Rating</span>
        {bus.rating || "N/A"}
      </div>

      <div>
        <span className="text-gray-400 block">Available Seats</span>
        {bus.seats_available ?? "N/A"}
      </div>
    </div>
  </div>
)}
