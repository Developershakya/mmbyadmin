"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo, useRef } from 'react';
import LocationSearchBox from '../../components/LocationSearchBox';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import AirlineLogo from '../../components/booking/AirlineLogo';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
 
export default function FlightsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');
  const trip = searchParams.get('trip');
  const adults = searchParams.get('adults');
  const children = searchParams.get('children');
  const infants = searchParams.get('infants');
  const returnDate = searchParams.get('returnDate');
  const legs = searchParams.get('legs');
 
  const [flights, setFlights] = useState([]);
  const [dateStripPrices, setDateStripPrices] = useState({}); // { "2026-07-22": 6400, "2026-07-23": null (loading) }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
 
  // ⭐ NEW: tracks which flight is picked for each leg -> { 0: flightObj, 1: flightObj }
  const [selectedLegs, setSelectedLegs] = useState({});
 
  // Filter states
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortBy, setSortBy] = useState('recommended');
 
  const today = new Date();
  today.setHours(0, 0, 0, 0);
 
  // ---------------- Header (editable search bar) states ----------------
  const [headerFrom, setHeaderFrom] = useState(null);
  const [headerTo, setHeaderTo] = useState(null);
  const [headerDate, setHeaderDate] = useState(null);
  const [headerReturnDate, setHeaderReturnDate] = useState(null);
  const [headerTrip, setHeaderTrip] = useState('oneway');
  const [headerAdults, setHeaderAdults] = useState(1);
  const [headerChildren, setHeaderChildren] = useState(0);
  const [headerInfants, setHeaderInfants] = useState(0);
 
  const [openHeaderDeparture, setOpenHeaderDeparture] = useState(false);
  const [openHeaderReturn, setOpenHeaderReturn] = useState(false);
  const [headerTravelersOpen, setHeaderTravelersOpen] = useState(false);
  const [headerTripTypeOpen, setHeaderTripTypeOpen] = useState(false);
 
  useEffect(() => {
    // ⭐ Naya search shuru hone par purani selection clear kar do
    setSelectedLegs({});
 
    if (trip === 'multicity') {
      if (!legs) return;
    } else {
      if (!from || !to || !date) return;
    }
 
    async function fetchFlights() {
      try {
        setLoading(true);
        setError('');
 
        let segments = [];
        let journeyType = '1';
 
        if (trip === 'roundtrip') {
          journeyType = '2';
          segments = [
            { origin: from, destination: to, date: date },
            { origin: to, destination: from, date: returnDate },
          ];
        } else if (trip === 'multicity') {
          journeyType = '3';
          segments = (legs || '').split(',').map((leg) => {
            const parts = leg.split('-');
            const origin = parts[0];
            const destination = parts[1];
            const date = parts.slice(2).join('-');
            return { origin, destination, date };
          });
        } else {
          segments = [{ origin: from, destination: to, date: date }];
        }
 
        const res = await fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adultCount: Number(adults) || 1,
            childCount: Number(children) || 0,
            infantCount: Number(infants) || 0,
            journeyType,
            segments,
          })
        });
 
        if (!res.ok) {
          const body = await res.text();
          console.error('API status:', res.status, 'body:', body);
          throw new Error('Failed to fetch');
        }
 
        const data = await res.json();
 
        if (!data.success) {
          setError(data.message || 'Flights fetch failed, please try again.');
          setFlights([]);
          return;
        }
 
        setFlights(data.results || []);
      } catch (err) {
        console.error('fetchFlights error:', err);
        setError('Flights fetch failed, please try again.');
      } finally {
        setLoading(false);
      }
    }
 
    fetchFlights();
  }, [from, to, date, trip, adults, children, infants, returnDate, legs]);
 
  // ---------------- Header sync: URL query se DB lookup karke header states bharo ----------------
  async function lookupCity(code) {
    if (!code) return null;
    try {
      const res = await fetch(`/api/cities/airports?code=${encodeURIComponent(code)}`);
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const row = rows[0];
        return {
          code: row.airport_code,
          name: row.airport_city_name,
          sub: row.airport_name,
        };
      }
    } catch (err) {
      console.error('lookupCity error:', err);
    }
    return { code, name: code, sub: '' }; // fallback agar DB mein na mile
  }
 
  useEffect(() => {
    (async () => {
      const [fromCity, toCity] = await Promise.all([lookupCity(from), lookupCity(to)]);
      setHeaderFrom(fromCity);
      setHeaderTo(toCity);
    })();
 
    setHeaderDate(date && !isNaN(new Date(date).getTime()) ? new Date(date) : null);
    setHeaderReturnDate(returnDate && !isNaN(new Date(returnDate).getTime()) ? new Date(returnDate) : null);
    setHeaderTrip(trip || 'oneway');
    setHeaderAdults(Number(adults) || 1);
    setHeaderChildren(Number(children) || 0);
    setHeaderInfants(Number(infants) || 0);
  }, [from, to, date, trip, adults, children, infants, returnDate]);
 
  // Derived: airline counts for filter sidebar
 // Derived: airline counts for filter sidebar (naam + code dono store karo, logo ke liye)
  const airlineCounts = useMemo(() => {
    const counts = {};
    flights.forEach((f) => {
      const name = f.airline_name || 'Unknown';
      if (!counts[name]) {
        counts[name] = { count: 0, code: f.airline_code };
      }
      counts[name].count += 1;
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
 
  const onwardFlights = useMemo(() => visibleFlights.filter(f => f.legIndex === 0), [visibleFlights]);
  const returnFlights = useMemo(() => visibleFlights.filter(f => f.legIndex === 1), [visibleFlights]);
 
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
    router.push(`/flights?from=${from}&to=${to}&date=${newDate}&trip=${trip || 'oneway'}`);
  }
 
  function toISODate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
 
  // ---------------- Header search button ----------------
  function handleHeaderSearch() {
    if (!headerFrom || !headerTo) {
      alert('Please select From and To locations.');
      return;
    }
    if (headerTrip === 'roundtrip' && !headerReturnDate) {
      alert('Please select a return date for round trip.');
      return;
    }
    const dateStr = headerDate ? toISODate(headerDate) : '';
    const returnStr = headerReturnDate ? toISODate(headerReturnDate) : '';
    router.push(
      `/flights?from=${headerFrom.code}&to=${headerTo.code}&date=${dateStr}` +
      (headerTrip === 'roundtrip' ? `&returnDate=${returnStr}` : '') +
      `&trip=${headerTrip}&adults=${headerAdults}&children=${headerChildren}&infants=${headerInfants}`
    );
  }
 
  const dateStripRef = useRef(null);

  // ⭐ FIXED: ab offset ki jagah seedha "strip start date" track karte hain
  const [stripStart, setStripStart] = useState(null);

  // Jab bhi URL ka date change ho, strip ko us date ke -3 din se start karo (aaj se pehle kabhi nahi)
  useEffect(() => {
    if (!date || isNaN(new Date(date).getTime())) {
      setStripStart(null);
      return;
    }
    const base = new Date(date);
    let start = new Date(base);
    start.setDate(base.getDate() - 3);
    if (start < today) {
      start = new Date(today);
    }
    setStripStart(start);
  }, [date]);

  function scrollDateStrip(direction) {
    if (!stripStart) return;

    setStripStart((prev) => {
      let next = new Date(prev);
      next.setDate(prev.getDate() + (direction === 'left' ? -7 : 7));

      // ⭐ Yahi asli fix hai: left jaate waqt hamesha "today" se clamp karo,
      // isse chahe kitni baar right-left karo, aaj ka date hamesha reachable rahega
      if (next < today) {
        next = new Date(today);
      }
      return next;
    });
  }

  const dateStrip = useMemo(() => {
    if (!stripStart) return [];
    const days = [];
    for (let i = 0; i < 8; i++) {
      const d = new Date(stripStart);
      d.setDate(stripStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [stripStart]);

  // strip ka pehla date "today" hai to left arrow disable kar do
  const isAtStart = dateStrip.length > 0 && toISODate(dateStrip[0]) === toISODate(today);

  // ⭐ NEW: date-strip ke har date ka cheapest price fetch karo
useEffect(() => {
  if (trip === 'multicity' || dateStrip.length === 0) return;

  let cancelled = false;

  dateStrip.forEach(async (d) => {
    const iso = toISODate(d);

    // ⭐ NEW: agar already fetch ho chuka hai (ya fetch ho raha hai), dobara call mat karo
    if (dateStripPrices[iso] !== undefined) return;

    setDateStripPrices((prev) => ({ ...prev, [iso]: null }));

      try {
        // ⭐ FIXED: date-strip ko sirf onward leg ka price chahiye, isliye hamesha one-way search karo
        const journeyType = '1';
        const segments = [{ origin: from, destination: to, date: iso }];

        const res = await fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adultCount: Number(adults) || 1,
            childCount: Number(children) || 0,
            infantCount: Number(infants) || 0,
            journeyType,
            segments,
          }),
        });
        const data = await res.json();

        if (cancelled) return;

        if (data.success && data.results?.length > 0) {
          const onwardOnly = data.results.filter((r) => r.legIndex === 0);
          const minPrice = Math.min(...onwardOnly.map((r) => Number(r.price)));
          setDateStripPrices((prev) => ({ ...prev, [iso]: minPrice }));
        } else {
          setDateStripPrices((prev) => ({ ...prev, [iso]: 'none' }));
        }
      } catch (err) {
        if (!cancelled) setDateStripPrices((prev) => ({ ...prev, [iso]: 'none' }));
      }
    });

    return () => { cancelled = true; };
  }, [dateStrip, from, to, trip, adults, children, infants, returnDate]);
 
  function formatDateShort(d) {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).replace(' ', ' ');
  }
 
  function formatWeekday(d) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }
 
  const totalLegsNeeded =
    trip === 'multicity' ? (legs || '').split(',').length : trip === 'roundtrip' ? 2 : 1;

  const allLegsSelected = useMemo(() => {
    for (let i = 0; i < totalLegsNeeded; i++) {
      if (!selectedLegs[i]) return false;
    }
    return totalLegsNeeded > 0;
  }, [selectedLegs, totalLegsNeeded]);

  function selectFlight(legIndex, flight) {
    setSelectedLegs((prev) => ({ ...prev, [legIndex]: flight }));
  }
  // ⭐ NEW: goes to the booking page once every leg is picked
  function proceedToBooking() {
    if (!allLegsSelected) return;
    sessionStorage.setItem('selectedFlights', JSON.stringify(selectedLegs));
    router.push(
      `/flights/booking?trip=${trip || 'oneway'}&adults=${adults || 1}&children=${children || 0}&infants=${infants || 0}`
    );
  }
 
  return (
     <>
      <Header />
    <div className="bg-[#F4F6F9] font-sans antialiased text-gray-800 min-h-screen pb-24">
 
      {/* Search Bar Header */}
      <header className="bg-[#0B1523] text-white p-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
 
          {/* Trip Type */}
          <div className="flex-1 min-w-[110px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center relative">
            <label className="block text-[9px] uppercase text-gray-400 tracking-wider font-medium">Trip Type</label>
            <div
              className="flex justify-between items-center mt-0.5 cursor-pointer"
              onClick={() => setHeaderTripTypeOpen(!headerTripTypeOpen)}
            >
              <span className="text-xs font-bold capitalize text-white">
                {headerTrip === 'roundtrip' ? 'Round Trip' : headerTrip === 'multicity' ? 'Multi City' : 'One Way'}
              </span>
              <i className="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
            </div>
 
            {headerTripTypeOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-48 bg-white shadow-2xl rounded-xl border border-gray-100 z-30 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {[
                  { id: 'oneway', label: 'One Way' },
                  { id: 'roundtrip', label: 'Round Trip' },
                  { id: 'multicity', label: 'Multi City' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { setHeaderTrip(opt.id); setHeaderTripTypeOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-orange-50 transition ${
                      headerTrip === opt.id ? "text-orange-600 bg-orange-50" : "text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
 
          {/* From / To */}
          <div className="flex-[2.5] min-w-[320px] bg-[#1E2A38] rounded h-[54px] flex items-center relative px-4">
            <div className="flex-1 flex flex-col justify-center pr-4">
              <LocationSearchBox
                label="From"
                value={headerFrom}
                placeholder="Delhi"
                onSelect={setHeaderFrom}
                theme="dark"
                citySearchApi="/api/cities/airports"
              />
            </div>
<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-full">
              <div className="h-8 border-l border-gray-600/50 absolute pointer-events-none"></div>
              <button
                type="button"
                onClick={() => {
                  const temp = headerFrom;
                  setHeaderFrom(headerTo);
                  setHeaderTo(temp);
                }}
                className="bg-[#1E2A38] border border-gray-600 rounded-full w-6 h-6 flex items-center justify-center z-10 text-gray-300 hover:text-orange-500 hover:border-orange-500 transition cursor-pointer"
              >
                <i className="fa-solid fa-arrows-left-right text-[9px]"></i>
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center pl-8">
              <LocationSearchBox
                label="To"
                value={headerTo}
                placeholder="Leh"
                onSelect={setHeaderTo}
                theme="dark"
                align="right"
                citySearchApi="/api/cities/airports"
              />
            </div>
          </div>
 
          {/* Departure */}
          <div className="flex-1 min-w-[140px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center relative">
            <label
              className="block text-[9px] uppercase text-gray-400 tracking-wider font-medium cursor-pointer"
              onClick={() => { setOpenHeaderDeparture(!openHeaderDeparture); setOpenHeaderReturn(false); }}
            >
              Departure
            </label>
            <div
              className="text-xs font-black mt-0.5 flex justify-between items-center whitespace-nowrap cursor-pointer text-white"
              onClick={() => { setOpenHeaderDeparture(!openHeaderDeparture); setOpenHeaderReturn(false); }}
            >
              <span>{headerDate ? toISODate(headerDate) : '--'}</span>
              <i className="fa-regular fa-calendar text-[11px] text-gray-400 ml-1"></i>
            </div>
{openHeaderDeparture && (
  <div className="absolute top-full left-0 mt-2 p-2 bg-white shadow-2xl rounded-xl z-30 text-gray-900" onClick={(e) => e.stopPropagation()}>
    <DayPicker
      mode="single"
      selected={headerDate}
      onSelect={(d) => { setHeaderDate(d); setOpenHeaderDeparture(false); }}
      disabled={{ before: today }}
    />
  </div>
)}
          </div>
 
          {/* Return */}
          <div className="flex-1 min-w-[140px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center relative">
            <label
              className="block text-[9px] uppercase text-gray-400 tracking-wider font-medium cursor-pointer"
              onClick={() => { setOpenHeaderReturn(!openHeaderReturn); setOpenHeaderDeparture(false); }}
            >
              Return
            </label>
            <div
              className="text-[11px] mt-0.5 flex items-center gap-1 cursor-pointer whitespace-nowrap"
              onClick={() => { setOpenHeaderReturn(!openHeaderReturn); setOpenHeaderDeparture(false); }}
            >
              <i className="fa-regular fa-calendar text-[10px] text-gray-400"></i>
              <span className={headerReturnDate ? "text-white font-black text-xs" : "text-gray-400"}>
                {headerReturnDate ? toISODate(headerReturnDate) : 'Add return details'}
              </span>
            </div>
{openHeaderReturn && (
  <div className="absolute top-full right-0 mt-2 p-2 bg-white shadow-2xl rounded-xl z-30 text-gray-900" onClick={(e) => e.stopPropagation()}>
    <DayPicker
      mode="single"
      selected={headerReturnDate}
      onSelect={(d) => { setHeaderReturnDate(d); setHeaderTrip('roundtrip'); setOpenHeaderReturn(false); }}
      disabled={{ before: headerDate || today }}
    />
  </div>
)}
          </div>
 
          {/* Travellers & Class */}
          <div className="flex-1 min-w-[150px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center relative">
            <label className="block text-[9px] uppercase text-gray-400 tracking-wider font-medium">Travellers & Class</label>
            <div
              className="flex justify-between items-center mt-0.5 cursor-pointer"
              onClick={() => setHeaderTravelersOpen(!headerTravelersOpen)}
            >
              <span className="text-xs font-black whitespace-nowrap text-white">
                {headerAdults} Pass{headerAdults > 1 ? 'es' : ''}, Economy
              </span>
              <i className="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
            </div>
 
            {headerTravelersOpen && (
              <div
                className="absolute top-full right-0 mt-2 w-[380px] p-5 bg-white shadow-2xl rounded-xl border border-gray-100 z-30"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-5">
                  <p className="text-sm font-bold text-gray-800">Adults (12y +)</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setHeaderAdults(n)}
                        className={`w-9 h-9 rounded-md text-sm font-semibold transition ${
                          headerAdults === n ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
 
                <div className="flex gap-8 mb-5">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Children</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setHeaderChildren(n)}
                          className={`w-9 h-9 rounded-md text-sm font-semibold transition ${
                            headerChildren === n ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Infants</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setHeaderInfants(n)}
                          className={`w-9 h-9 rounded-md text-sm font-semibold transition ${
                            headerInfants === n ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
 
                <div className="flex justify-end">
                  <button
                    onClick={() => setHeaderTravelersOpen(false)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-md px-8 py-2.5 transition"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
 
          <button
            onClick={handleHeaderSearch}
            className="bg-gradient-to-r from-[#0B1523] to-orange-500 text-white text-base rounded-tr-full rounded-br-full px-6 h-[54px] ml-1.5 rounded font-black uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center shadow-md"
          >
            Search
          </button>
        </div>
      </header>
 
      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
 
        {/* Filters Sidebar - dynamic counts */}
        <aside className="w-1/4 bg-white p-5 rounded-lg shadow-sm h-fit hidden md:block sticky top-[90px] max-h-[calc(100vh-100px)] overflow-y-auto">
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
                <p className="text-xs text-gray-400">Airlines will appear here after you search.</p>
              )}
{Object.entries(airlineCounts).map(([name, data]) => (
                <label key={name} className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" className="accent-orange-500" checked={selectedAirlines.includes(name)} onChange={() => toggleAirline(name)} />
                    <AirlineLogo code={data.code} size={20} />
                    {name}
                  </span>
                  <span className="text-gray-400">{data.count}</span>
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => !isAtStart && scrollDateStrip('left')}
                disabled={isAtStart}
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition ${
                  isAtStart
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-50 pointer-events-none'
                    : 'bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-orange-600'
                }`}
              >
                <i className="fa-solid fa-chevron-left text-xs"></i>
              </button>

              <div
                ref={dateStripRef}
                className="flex-1 flex gap-1 text-center overflow-x-auto scroll-smooth"
                style={{ scrollbarWidth: 'none' }}
              >
                {dateStrip.map((d) => {
                  const iso = toISODate(d);
                  const isActive = iso === date;
                  const priceForDate = dateStripPrices[iso];
                  return (
                    <div
                      key={iso}
                      onClick={() => goToDate(iso)}
                      className={`flex-shrink-0 w-[100px] p-1.5 rounded cursor-pointer transition-colors ${
                        isActive ? 'bg-orange-500 text-white shadow-sm' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`text-[10px] uppercase font-medium ${isActive ? 'text-orange-100 font-bold' : 'text-gray-400'}`}>
                        {formatDateShort(d)}, {formatWeekday(d)}
                      </div>
                      <div className={`text-xs font-bold mt-0.5 ${isActive ? 'text-white' : 'text-gray-700'}`}>
                        {priceForDate === undefined || priceForDate === null
                          ? '...'
                          : priceForDate === 'none'
                          ? '—'
                          : `₹${priceForDate.toLocaleString()}`}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollDateStrip('right')}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition"
              >
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </button>
            </div>
          )}

          <div className="flex justify-between items-center text-sm pt-2">
            <div>
              <h1 className="text-base font-bold text-gray-900">
                {trip === 'multicity'
                  ? `Multi City: ${(legs || '').split(',').map(l => { const p = l.split('-'); return `${p[0]} → ${p[1]}`; }).join(' | ')}`
                  : <>Showing flights for {from} <i className="fa-solid fa-arrow-right text-xs mx-1"></i> {to}{trip === 'roundtrip' && returnDate ? <> &amp; back on {returnDate}</> : null}</>}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {trip !== 'multicity' ? `${date} • ` : ''}
                {Number(adults) || 1} Pass{(Number(adults) || 1) > 1 ? 'es' : ''}, Economy • {visibleFlights.length} results
              </p>
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
              Loading flights
            </div>
          )}
 
          {!loading && error && (
            <div className="bg-white rounded-lg shadow-sm border border-red-100 p-10 text-center text-red-500">
              {error}
            </div>
          )}
 
          {/* ONE WAY: flat list */}
          {!loading && !error && trip !== 'roundtrip' && trip !== 'multicity' && visibleFlights.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-gray-500">
              No flights found.
            </div>
          )}
 
          {!loading && !error && trip !== 'roundtrip' && trip !== 'multicity' && visibleFlights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              from={from}
              to={to}
              date={date}
              isExpanded={expandedId === flight.id}
              onToggle={() => setExpandedId(expandedId === flight.id ? null : flight.id)}
              isSelected={selectedLegs[0]?.id === flight.id}
              onSelect={() => selectFlight(0, flight)}
            />
          ))}
 
          {/* ROUND TRIP / MULTI CITY: show each leg in its own section */}
{!loading && !error && (trip === 'roundtrip' || trip === 'multicity') && (() => {
  const legMap = {};
  visibleFlights.forEach(f => {
    if (!legMap[f.legIndex]) legMap[f.legIndex] = [];
    legMap[f.legIndex].push(f);
  });
  const legCount = trip === 'roundtrip' ? 2 : (legs || '').split(',').length;
  const legLabels = trip === 'roundtrip'
    ? [`Onward: ${from} → ${to} (${date})`, `Return: ${to} → ${from} (${returnDate || ''})`]
    : (legs || '').split(',').map((l, i) => {
        const p = l.split('-');
        return `Leg ${i + 1}: ${p[0]} → ${p[1]} (${p.slice(2).join('-')})`;
      });

  return Array.from({ length: legCount }, (_, idx) => {
    const legFlights = legMap[idx] || [];
    const isCollapsed = !!selectedLegs[idx];   // ⭐ NEW

    return (
      <div key={idx} className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-blue-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <i className="fa-solid fa-plane text-[10px]"></i>
            {legLabels[idx] || `Leg ${idx + 1}`}
          </span>
          <span className="text-xs text-gray-400">{legFlights.length} results</span>
          {selectedLegs[idx] && (
            <>
              <span className="text-xs text-emerald-600 font-bold">
                ✓ Selected: {selectedLegs[idx].airline_name} ₹{Number(selectedLegs[idx].price).toLocaleString()}
              </span>
              <button
                onClick={() => setSelectedLegs(prev => { const n = { ...prev }; delete n[idx]; return n; })}
                className="text-xs text-orange-500 font-bold underline"
              >
                Change
              </button>
            </>
          )}
        </div>

        {legFlights.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            No flights found.
          </div>
        ) : (
          (isCollapsed ? legFlights.filter(f => f.id === selectedLegs[idx].id) : legFlights).map(flight => (
            <FlightCard
              key={flight.id}
              flight={flight}
              from={flight.origin_code}
              to={flight.destination_code}
              date={date}
              isExpanded={expandedId === flight.id}
              onToggle={() => setExpandedId(expandedId === flight.id ? null : flight.id)}
              isSelected={selectedLegs[idx]?.id === flight.id}
              onSelect={() => selectFlight(idx, flight)}
            />
          ))
        )}
      </div>
    );
  });
})()}
        </section>
      </main>

      {/* ⭐ NEW: progress indicator jab tak saare legs select nahi hote */}
      {(trip === 'roundtrip' || trip === 'multicity') && !allLegsSelected && Object.keys(selectedLegs).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 z-40 text-center text-xs text-gray-500">
          {Object.keys(selectedLegs).length} of {totalLegsNeeded} legs selected — select a flight for every leg to continue
        </div>
      )}

{allLegsSelected && (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 z-40">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="text-sm text-gray-600">
        {Object.keys(selectedLegs).length} leg(s) selected •{' '}
        <span className="font-bold text-gray-900">
          ₹ {Object.values(selectedLegs).reduce((sum, f) => sum + Number(f.price), 0).toLocaleString()}
        </span>{' '}
        per passenger
      </div>
      <button
        onClick={proceedToBooking}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm uppercase tracking-wide px-8 py-3 rounded-full transition"
      >
        Proceed to Book
      </button>
    </div>
  </div>
)}
    </div>
      <Footer />
    </>
  );
}
 
/** Reusable flight card component */
function FlightCard({ flight, from, to, date, isExpanded, onToggle, isSelected, onSelect }) {
  const [activeDetailTab, setActiveDetailTab] = useState('details');
  const [fareRuleText, setFareRuleText] = useState(null);
const [fareRuleLoading, setFareRuleLoading] = useState(false);
const [fareRuleError, setFareRuleError] = useState('');

async function loadFareRules() {
  if (fareRuleText || fareRuleLoading) return; // dobara fetch mat karo
  setFareRuleLoading(true);
  setFareRuleError('');
  try {
    const res = await fetch('/api/flights/farerule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        traceId: flight.traceId,
        resultIndex: flight.resultIndex,
        srdvType: flight.srdvType,
        srdvIndex: flight.srdvIndex,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setFareRuleText(data.fareRuleText);
    } else {
      setFareRuleError(data.message || 'Fare rules fetch failed.');
    }
  } catch (err) {
    setFareRuleError('Fare rules fetch failed.');
  } finally {
    setFareRuleLoading(false);
  }
} 
  return (
    <div className={`bg-white rounded-lg shadow-sm border overflow-hidden mb-3 ${isSelected ? 'border-orange-400 ring-1 ring-orange-300' : 'border-gray-100'}`}>
      <div className="p-5 flex flex-wrap items-center justify-between gap-4">
<div className="flex items-center gap-3 min-w-[120px]">
          <AirlineLogo code={flight.airline_code} size={32} />
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
          {/* ⭐ CHANGED: "View Price" -> "Select" (drives selectedLegs) */}
          <button
            onClick={onSelect}
            className={`text-xs font-bold px-5 py-2 rounded uppercase tracking-wider transition-colors ${
              isSelected ? 'bg-emerald-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {isSelected ? '✓ Selected' : 'Select'}
          </button>
          {flight.seats_left && (
            <span className="text-[11px] text-orange-600 font-medium">{flight.seats_left} seats left at this price</span>
          )}
          <button
            onClick={onToggle}
            className="text-[10px] text-orange-500 font-bold mt-1 flex items-center gap-0.5"
          >
            {isExpanded ? 'Hide' : 'View'} Flight Details
            <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-[8px]`}></i>
          </button>
        </div>
      </div>
 
      {isExpanded && (
        <div className="bg-gray-50 border-t border-gray-100">
          
<div className="flex gap-2 px-5 pt-3 border-b border-gray-200">
  {[
    { id: 'details', label: 'Flight Details' },
    { id: 'fare', label: 'Fare Summary' },
    { id: 'policy', label: 'Fare Rules' },
  ].map((tab) => (
    <button
      key={tab.id}
      type="button"
      onClick={() => {
        setActiveDetailTab(tab.id);
        if (tab.id === 'policy') loadFareRules();
      }}
      className={`px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-t transition-colors ${
        activeDetailTab === tab.id
          ? 'bg-orange-500 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
 {activeDetailTab === 'policy' && (
  <div>
    <div className="font-bold text-gray-900 mb-3">Fare Rules</div>

    {fareRuleLoading && (
      <p className="text-xs text-gray-400">Loading fare rules...</p>
    )}

    {!fareRuleLoading && fareRuleError && (
      <p className="text-xs text-red-500">{fareRuleError}</p>
    )}

    {!fareRuleLoading && !fareRuleError && fareRuleText && (
      <div
        className="text-xs text-gray-600 leading-relaxed whitespace-normal break-words max-w-full [&_table]:w-full [&_table]:my-2 [&_table]:border-collapse [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-gray-200 [&_td]:align-top [&_td]:break-words [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-100 [&_th]:text-left [&_th]:border [&_th]:border-gray-200"
        dangerouslySetInnerHTML={{ __html: fareRuleText }}
      />
    )}
  </div>
)}
          <div className="p-5 text-xs text-gray-600">
            {activeDetailTab === 'details' && (
              <div>
                <div className="font-bold text-gray-900 mb-3">
                  {flight.origin_code} → {flight.destination_code}{date ? `, ${date}` : ''}
                </div>
 
                {(flight.legDetails || []).map((leg, i) => (
                  <div key={i} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0 last:mb-0">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
<div className="flex items-start gap-3 col-span-2">
                        <AirlineLogo code={leg.airline_code} size={24} className="mt-0.5" />
                        <div>
                          <div className="font-bold text-gray-900">
                            {leg.airline_name}{' '}
                            <span className="font-normal text-gray-500 text-[11px]">{leg.flight_number}</span>
                            {leg.aircraft && (
                              <span className="ml-2 bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded">{leg.aircraft}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-6 mt-4">
                            <div>
                              <div className="text-sm font-bold text-gray-900">{leg.departure_time}</div>
                              <div className="text-gray-400 mt-1 text-[11px]">{leg.origin_airport}</div>
                              {leg.origin_terminal && (
                                <div className="text-gray-400 text-[11px]">{leg.origin_terminal}</div>
                              )}
                            </div>
                            <div className="text-center px-2">
                              <div className="text-gray-400 text-[11px]">{leg.duration}</div>
                              <div className="text-emerald-500 font-bold text-[11px] mt-1">Non Stop</div>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{leg.arrival_time}</div>
                              <div className="text-gray-400 mt-1 text-[11px]">{leg.destination_airport}</div>
                              {leg.destination_terminal && (
                                <div className="text-gray-400 text-[11px]">{leg.destination_terminal}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5 border-l pl-4 border-gray-100">
                        <div className="font-bold text-gray-900 uppercase text-[10px] tracking-wider mb-1">Baggage</div>
                        <div className="flex justify-between"><span>Check-in:</span><span className="font-medium text-gray-900">{leg.baggage}</span></div>
                        <div className="flex justify-between"><span>Cabin:</span><span className="font-medium text-gray-900">{leg.cabin_baggage}</span></div>
                      </div>
                      <div className="space-y-1.5 border-l pl-4 border-gray-100">
                        <div className="font-bold text-gray-900 uppercase text-[10px] tracking-wider mb-1">Class & Seats</div>
                        <div className="flex justify-between"><span>Cabin:</span><span className="font-medium text-gray-900">{leg.cabin_class}</span></div>
                        {leg.seats_left && (
                          <div className="flex justify-between"><span>Seats left:</span><span className="font-medium text-gray-900">{leg.seats_left}</span></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
 
                <div className="flex gap-2 mt-2">
                  <span className={`text-[11px] font-bold px-2 py-1 rounded ${flight.is_refundable ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {flight.is_refundable ? 'Refundable' : 'Non-Refundable'}
                  </span>
                </div>
              </div>
            )}
 
            {activeDetailTab === 'fare' && (
              <div className="max-w-sm">
                <div className="font-bold text-gray-900 mb-3">Fare Breakdown (per adult)</div>
                <div className="space-y-2 bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex justify-between"><span>Base Fare</span><span className="font-medium text-gray-900">₹ {Number(flight.base_fare || 0).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Tax & Surcharges</span><span className="font-medium text-gray-900">₹ {Number(flight.tax || 0).toLocaleString()}</span></div>
                  {flight.yq_tax > 0 && (
                    <div className="flex justify-between"><span>YQ Tax</span><span className="font-medium text-gray-900">₹ {Number(flight.yq_tax).toLocaleString()}</span></div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                    <span>Total</span><span>₹ {Number(flight.price).toLocaleString()}</span>
                  </div>
                </div>
 
                {flight.fareOptions?.length > 1 && (
                  <div className="mt-4">
                    <div className="font-bold text-gray-900 mb-2">Other Fare Options</div>
                    <div className="space-y-2">
                      {flight.fareOptions.map((fo, i) => (
                        <div key={i} className="flex justify-between items-center bg-white border border-gray-200 rounded px-3 py-2">
                          <span className="text-gray-600">{fo.source} {fo.is_refundable ? '(Refundable)' : '(Non-Refundable)'}</span>
                          <span className="font-bold text-gray-900">₹ {Number(fo.price).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}