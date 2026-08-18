import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

// BusCard Component
function BusCard({ bus, isExpanded, onToggle, onViewSeats }) {
  const [openPickupDrop, setOpenPickupDrop] = useState(false);
  const [openPolicies, setOpenPolicies] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-4 p-5">
      {/* Top Header & Core Bus Details */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-50">
        <div>
          <h3 className="font-bold text-blue-900 text-lg">{bus.operator_name}</h3>
          <span className="inline-block bg-blue-600 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded mt-1">
            {bus.bus_type}
          </span>
        </div>

        <div className="text-right">
          <div className="text-xl font-black text-gray-900">₹ {Number(bus.price).toLocaleString()}</div>
          <div className="text-[11px] text-gray-400">Per Seat</div>
        </div>
      </div>

      {/* Timing & Seats Left Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 text-xs text-gray-600">
        <div>
          <span className="font-semibold text-gray-800">Departure: </span>
          {bus.departure_time}
        </div>
        <div>
          <span className="font-semibold text-gray-800">Arrival: </span>
          {bus.arrival_time}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div>
          <span className="font-semibold">Available Seats: </span>
          {bus.seats_available ?? "N/A"}
        </div>
        <div>
          <span className="font-semibold">Max Seats per Ticket: </span>6
        </div>
      </div>

      {/* Action Toggle Links (Pick-Up & Drop / Policies) */}
      <div className="flex items-center gap-6 py-2">
        <button
          onClick={() => {
            setOpenPickupDrop(!openPickupDrop);
            if (!openPickupDrop) setOpenPolicies(false);
          }}
          className="text-xs font-bold text-gray-700 hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          🗺️ Pick-Up &amp; Drop {openPickupDrop ? "▲" : "▼"}
        </button>

        <button
          onClick={() => {
            setOpenPolicies(!openPolicies);
            if (!openPolicies) setOpenPickupDrop(false);
          }}
          className="text-xs font-bold text-gray-700 hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          📜 Policies {openPolicies ? "▲" : "▼"}
        </button>
      </div>

      {/* Expandable Box 1: Pick-Up & Drop (Inline Side-by-Side Design) */}
      {openPickupDrop && (
        <div className="mt-3 p-4 bg-gray-50/80 rounded-lg border border-gray-100 text-xs grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="font-bold text-gray-800 mb-2">Boarding Points:</p>
            <div className="space-y-1.5 text-gray-600 max-h-40 overflow-y-auto pr-1">
              {bus.boarding_points?.length > 0 ? (
                bus.boarding_points.map((p, i) => (
                  <div key={i}>
                    {p.CityPointLocation || p.CityPointName} -{" "}
                    <span className="text-gray-500">
                      {p.CityPointTime?.includes("T")
                        ? p.CityPointTime.split("T")[1]?.slice(0, 5)
                        : p.CityPointTime}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No boarding points available.</p>
              )}
            </div>
          </div>

          <div>
            <p className="font-bold text-gray-800 mb-2">Dropping Points:</p>
            <div className="space-y-1.5 text-gray-600 max-h-40 overflow-y-auto pr-1">
              {bus.dropping_points?.length > 0 ? (
                bus.dropping_points.map((p, i) => (
                  <div key={i}>
                    {p.CityPointLocation || p.CityPointName} -{" "}
                    <span className="text-gray-500">
                      {p.CityPointTime?.includes("T")
                        ? p.CityPointTime.split("T")[1]?.slice(0, 5)
                        : p.CityPointTime}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No dropping points available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expandable Box 2: Cancellation Policies (Inline List Design) */}
      {openPolicies && (
        <div className="mt-3 p-4 bg-gray-50/80 rounded-lg border border-gray-100 text-xs space-y-3">
          {bus.cancellation_policies?.length > 0 ? (
            bus.cancellation_policies.flat().map((p, i) => (
              <div key={i} className="pb-2 border-b border-gray-200/60 last:border-0 last:pb-0">
                <div className="text-gray-700">
                  <span className="font-semibold text-gray-900">Time: </span>
                  {p.PolicyString || "Standard Policy"}
                </div>
                <div className="text-gray-700 mt-0.5">
                  <span className="font-semibold text-gray-900">Cancellation Charge: </span>
                  ₹{p.CancellationCharge ?? "N/A"}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">Cancellation policy details not available.</p>
          )}
        </div>
      )}

      {/* Bottom Select Seats Button */}
      <div className="flex justify-end mt-4 pt-2">
        <button
          onClick={() => onViewSeats(bus)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded transition-colors"
        >
          Select Seats
        </button>
      </div>
    </div>
  );
}

export default function BusesPage() {
  const router = useRouter();
  const { from, to, date } = router.query;

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Search form states
  const [searchFrom, setSearchFrom] = useState('Noida');
  const [searchTo, setSearchTo] = useState('Mathura');
  const [selectedDate, setSelectedDate] = useState(new Date());
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
            journeyDate: date,
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

  async function handleViewSeats(bus) {
    try {
      const res = await fetch('/api/buses/seat-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traceId: bus.traceId, resultIndex: bus.resultIndex }),
      });
      const data = await res.json();
      console.log('SEAT LAYOUT RESULT:', data);

      if (data.success) {
        alert(`Seat layout endpoint mil gaya: "${data.endpoint}". Terminal check karo, poora response wahan print hoga.`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('handleViewSeats error:', err);
      alert('Kuch galat ho gaya, terminal check karo.');
    }
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

                {/* To */}
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

                {/* Date */}
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
                          if (date) setSelectedDate(date);
                          setOpenDate(false);
                        }}
                        disabled={{ before: new Date() }}
                      />
                    </div>
                  )}
                </div>

                {/* Search Button */}
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
        <Footer />
      </>
    );
  }

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
              onClick={() => {
                const dateStr = selectedDate ? selectedDate.toISOString().split("T")[0] : (date || new Date().toISOString().split("T")[0]);
                const currentFrom = searchFrom || from || 'Delhi';
                const currentTo = searchTo || to || 'Mathura';
                router.push(`/buses?from=${encodeURIComponent(currentFrom)}&to=${encodeURIComponent(currentTo)}&date=${dateStr}`);
              }}
              className="bg-gradient-to-r from-[#0B1523] to-orange-500 text-white text-base rounded px-6 h-[54px] ml-1.5 font-bold uppercase tracking-wider hover:opacity-95 transition-all"
            >
              Search
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
          {/* Filter Sidebar */}
          <aside className="w-1/4 bg-white p-5 rounded-lg shadow-sm hidden md:block sticky top-24 max-h-[calc(100vh-100px)] overflow-y-auto">
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
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-300 text-xs rounded px-2 py-1 font-medium focus:outline-none focus:border-orange-500"
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
                onToggle={() => setExpandedId(expandedId === bus.id ? null : bus.id)}
                onViewSeats={handleViewSeats}
              />
            ))}
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}