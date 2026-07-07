import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';

export default function FlightsPage() {
  const router = useRouter();
  const { from, to, date, trip } = router.query;

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Filter states
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => {
    if (!router.isReady) return;
    if (!from || !to || !date) return;

    async function fetchFlights() {
      try {
        setLoading(true);
        setError('');
const res = await fetch(
  `/api/flights/search?from=${from}&to=${to}&date=${date}&trip=${trip}`
);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const list = data.flights || data.data || (Array.isArray(data) ? data : []);
        setFlights(list);
      } catch (err) {
        setError('Flights fetch nahi ho paaye. Baad me try karo.');
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();
  }, [router.isReady, from, to, date, trip]);

  // Derived: airline counts for filter sidebar
  const airlineCounts = useMemo(() => {
    const counts = {};
    flights.forEach((f) => {
      const name = f.airline_name || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    return counts;
  }, [flights]);

  // Derived: stop counts for filter sidebar
  const stopCounts = useMemo(() => {
    const counts = { nonstop: 0, onestop: 0, multistop: 0 };
    flights.forEach((f) => {
      if (f.stops === 0) counts.nonstop++;
      else if (f.stops === 1) counts.onestop++;
      else counts.multistop++;
    });
    return counts;
  }, [flights]);

  // Apply filters + sorting
  const visibleFlights = useMemo(() => {
    let result = [...flights];

    if (selectedStops.length > 0) {
      result = result.filter((f) => {
        if (selectedStops.includes('nonstop') && f.stops === 0) return true;
        if (selectedStops.includes('onestop') && f.stops === 1) return true;
        if (selectedStops.includes('multistop') && f.stops >= 2) return true;
        return false;
      });
    }

    if (selectedAirlines.length > 0) {
      result = result.filter((f) => selectedAirlines.includes(f.airline_name));
    }

    result = result.filter((f) => Number(f.price) <= maxPrice);

    if (sortBy === 'price_low') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'duration') {
      result.sort((a, b) => (a.duration_minutes || 0) - (b.duration_minutes || 0));
    }

    return result;
  }, [flights, selectedStops, selectedAirlines, maxPrice, sortBy]);

  function toggleStop(key) {
    setSelectedStops((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  }

  function toggleAirline(name) {
    setSelectedAirlines((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  }

  function resetFilters() {
    setSelectedStops([]);
    setSelectedAirlines([]);
    setMaxPrice(50000);
  }

  function goToDate(newDate) {
    router.push(`/flight?from=${from}&to=${to}&date=${newDate}&trip=${trip || 'oneway'}`);
  }

  // Generate a 7-day date strip centered on selected date
const dateStrip = useMemo(() => {
  if (!date || date === 'undefined' || isNaN(new Date(date).getTime())) return [];
  const base = new Date(date);
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push(d);
  }
  return days;
}, [date]);

  function formatDateShort(d) {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).replace(' ', ' ');
  }

  function formatWeekday(d) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }

  function toISODate(d) {
    return d.toISOString().split('T')[0];
  }

  return (
    <div className="bg-[#F4F6F9] font-sans antialiased text-gray-800 min-h-screen">

      {/* Search Bar Header */}
      <header className="bg-[#0B1523] text-white p-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">

          <div className="flex-1 min-w-[110px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center">
            <label className="block text-[9px] uppercase text-gray-400 tracking-wider font-medium">Trip Type</label>
            <div className="flex justify-between items-center mt-0.5 cursor-pointer">
              <span className="text-xs font-bold capitalize">{trip === 'roundtrip' ? 'Round Trip' : 'One Way'}</span>
              <i className="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
            </div>
          </div>

          <div className="flex-[2.5] min-w-[320px] bg-[#1E2A38] rounded h-[54px] flex items-center relative px-4">
            <div className="flex-1 flex flex-col justify-center pr-4">
              <label className="block text-[9px] uppercase text-orange-500 tracking-wider font-bold">From</label>
              <div className="text-xs font-black mt-0.5 whitespace-nowrap text-white">{from || '--'}</div>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-full">
              <div className="h-8 border-l border-gray-600/50 absolute"></div>
              <div className="bg-[#1E2A38] border border-gray-600 rounded-full w-5 h-5 flex items-center justify-center z-10 cursor-pointer text-gray-400 hover:text-white transition-colors">
                <i className="fa-solid fa-arrows-left-right text-[9px]"></i>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center pl-8">
              <label className="block text-[9px] uppercase text-orange-500 tracking-wider font-bold">To</label>
              <div className="text-xs font-black mt-0.5 whitespace-nowrap text-white">{to || '--'}</div>
            </div>
          </div>

          <div className="flex-1 min-w-[140px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center">
            <label className="block text-[9px] uppercase text-gray-400 tracking-wider font-medium">Departure</label>
            <div className="text-xs font-black mt-0.5 flex justify-between items-center whitespace-nowrap">
              <span>{date || '--'}</span>
              <i className="fa-regular fa-calendar text-[11px] text-gray-400 ml-1"></i>
            </div>
          </div>

          <div className="flex-1 min-w-[140px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center opacity-60">
            <label className="block text-[9px] uppercase text-gray-400 tracking-wider font-medium">Return</label>
            <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1 cursor-pointer whitespace-nowrap">
              <i className="fa-regular fa-calendar text-[10px]"></i> <span>Add return details</span>
            </div>
          </div>

          <div className="flex-1 min-w-[150px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center">
            <label className="block text-[9px] uppercase text-gray-400 tracking-wider font-medium">Travellers & Class</label>
            <div className="flex justify-between items-center mt-0.5 cursor-pointer">
              <span className="text-xs font-black whitespace-nowrap">1 Pass, Economy</span>
              <i className="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
            </div>
          </div>

          <button
            onClick={() => router.push(`/flight?from=${from}&to=${to}&date=${date}&trip=${trip || 'oneway'}`)}
            className="bg-gradient-to-r from-[#0B1523] to-orange-500 text-white text-base rounded-tr-full rounded-br-full px-6 h-[54px] ml-1.5 rounded font-black uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center shadow-md"
          >
            Search
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        {/* Filters Sidebar - dynamic counts */}
        <aside className="w-1/4 bg-white p-5 rounded-lg shadow-sm h-fit hidden md:block">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold tracking-wide">FILTERS</h2>
            <button onClick={resetFilters} className="text-xs font-semibold text-orange-500 uppercase">Reset</button>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold mb-3">Stops</h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2">
                  <input type="checkbox" className="accent-orange-500" checked={selectedStops.includes('nonstop')} onChange={() => toggleStop('nonstop')} /> Non Stop
                </span>
                <span className="text-gray-400">{stopCounts.nonstop}</span>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2">
                  <input type="checkbox" className="accent-orange-500" checked={selectedStops.includes('onestop')} onChange={() => toggleStop('onestop')} /> 1 Stop
                </span>
                <span className="text-gray-400">{stopCounts.onestop}</span>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2">
                  <input type="checkbox" className="accent-orange-500" checked={selectedStops.includes('multistop')} onChange={() => toggleStop('multistop')} /> 2+ Stops
                </span>
                <span className="text-gray-400">{stopCounts.multistop}</span>
              </label>
            </div>
          </div>

          <hr className="my-4 border-gray-100" />

          <div className="mb-6">
            <h3 className="text-sm font-bold mb-3">Airlines</h3>
            <div className="space-y-2 text-sm">
              {Object.keys(airlineCounts).length === 0 && (
                <p className="text-xs text-gray-400">Search karne ke baad airlines yahan dikhengi</p>
              )}
              {Object.entries(airlineCounts).map(([name, count]) => (
                <label key={name} className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" className="accent-orange-500" checked={selectedAirlines.includes(name)} onChange={() => toggleAirline(name)} /> {name}
                  </span>
                  <span className="text-gray-400">{count}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="my-4 border-gray-100" />

          <div>
            <h3 className="text-sm font-bold mb-2">Max Price</h3>
            <div className="text-xs text-gray-500 mb-2">Up to ₹ {maxPrice.toLocaleString()}</div>
            <input
              type="range"
              className="w-full accent-orange-500"
              min="1000"
              max="50000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>
        </aside>

        {/* Results Section */}
        <section className="w-full md:w-3/4 space-y-4">

          {/* Date strip - navigates by changing the date query param */}
          {date && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2 flex items-center gap-1 overflow-x-auto">
              <div className="flex-1 grid grid-cols-7 gap-1 text-center min-w-[500px]">
                {dateStrip.map((d) => {
                  const iso = toISODate(d);
                  const isActive = iso === date;
                  return (
                    <div
                      key={iso}
                      onClick={() => goToDate(iso)}
                      className={`p-1.5 rounded cursor-pointer transition-colors ${
                        isActive ? 'bg-orange-500 text-white shadow-sm' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`text-[10px] uppercase font-medium ${isActive ? 'text-orange-100 font-bold' : 'text-gray-400'}`}>
                        {formatDateShort(d)}, {formatWeekday(d)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-sm pt-2">
            <div>
              <h1 className="text-base font-bold text-gray-900">
                Showing flights for {from} <i className="fa-solid fa-arrow-right text-xs mx-1"></i> {to}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">{date} • 1 Pass, Economy • {visibleFlights.length} results</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded p-1.5 bg-white text-xs font-semibold outline-none"
              >
                <option value="recommended">Recommended</option>
                <option value="price_low">Price: Low to High</option>
                <option value="duration">Duration: Shortest</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-gray-500">
              Flights load ho rahe hain...
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-lg shadow-sm border border-red-100 p-10 text-center text-red-500">
              {error}
            </div>
          )}

          {!loading && !error && visibleFlights.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-gray-500">
              Is route ke liye koi flight nahi mila.
            </div>
          )}

          {!loading && !error && visibleFlights.map((flight) => {
            const isExpanded = expandedId === flight.id;
            return (
              <div key={flight.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-[120px]">
                    <div className="w-8 h-8 bg-blue-900 text-white font-black flex items-center justify-center text-xs rounded">
                      {flight.airline_code || 'FL'}
                    </div>
                    <div>
                      <div className="font-bold text-blue-900 text-base">{flight.airline_name}</div>
                      <div className="text-xs text-gray-400">{flight.flight_number}</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold">{flight.departure_time}</div>
                    <div className="text-xs font-semibold text-gray-500">{flight.origin_code}</div>
                  </div>

                  <div className="text-center min-w-[100px]">
                    <div className="text-xs text-gray-400">{flight.duration}</div>
                    <div className="relative my-1 flex items-center justify-center">
                      <div className="w-full border-t border-dashed border-gray-300 absolute"></div>
                      <i className="fa-solid fa-plane text-xs text-emerald-500 relative bg-white px-2 z-10"></i>
                    </div>
                    <div className="text-xs font-bold text-emerald-500">
                      {flight.stops === 0 ? 'Non Stop' : `${flight.stops} Stop`}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold">{flight.arrival_time}</div>
                    <div className="text-xs font-semibold text-gray-500">{flight.destination_code}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">₹ {Number(flight.price).toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400">per adult</div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2 rounded uppercase tracking-wider transition-colors">
                      View Price
                    </button>
                    {flight.seats_left && (
                      <span className="text-[11px] text-orange-600 font-medium">{flight.seats_left} seats left at this price</span>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : flight.id)}
                      className="text-[10px] text-orange-500 font-bold mt-1 flex items-center gap-0.5"
                    >
                      {isExpanded ? 'Hide' : 'View'} Flight Details
                      <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-[8px]`}></i>
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 bg-gray-50 text-xs text-gray-600 border-t border-gray-100">
                    <div className="font-bold text-gray-900 mb-3">
                      {from} to {to}, {date}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                      <div className="flex items-start gap-3 col-span-2">
                        <div className="w-6 h-6 bg-blue-900 text-white font-black flex items-center justify-center text-[10px] rounded mt-0.5">
                          {flight.airline_code || 'FL'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {flight.airline_name}{' '}
                            <span className="font-normal text-gray-500 text-[11px]">{flight.flight_number}</span>
                            {flight.aircraft && (
                              <span className="ml-2 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-500">{flight.aircraft}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-6 mt-4 relative">
                            <div>
                              <div className="text-sm font-bold text-gray-900">{flight.departure_time}</div>
                              <div className="text-gray-400 mt-1 text-[11px]">{flight.origin_airport || flight.origin_code}</div>
                            </div>
                            <div className="text-center px-2">
                              <div className="text-gray-400 text-[11px]">{flight.duration}</div>
                              <div className="text-emerald-500 font-bold text-[11px] mt-1">
                                {flight.stops === 0 ? 'Non Stop' : `${flight.stops} Stop`}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{flight.arrival_time}</div>
                              <div className="text-gray-400 mt-1 text-[11px]">{flight.destination_airport || flight.destination_code}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 border-l pl-4 border-gray-100">
                        <div className="font-bold text-gray-900 uppercase text-[10px] tracking-wider mb-1">Baggage</div>
                        <div className="flex justify-between"><span>Check-in:</span><span className="font-medium text-gray-900">{flight.baggage || 'N/A'}</span></div>
                      </div>

                      <div className="space-y-1.5 border-l pl-4 border-gray-100">
                        <div className="font-bold text-gray-900 uppercase text-[10px] tracking-wider mb-1">Cabin</div>
                        <div className="flex justify-between"><span>Allowance:</span><span className="font-medium text-gray-900">{flight.cabin_baggage || 'N/A'}</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}