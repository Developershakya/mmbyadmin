"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

// BusCard Component
// BusCard Component
function BusCard({ bus, onViewSeats }) {
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('boarding'); // 'boarding' | 'policy'

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

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div>
          <span className="font-semibold">Available Seats: </span>
          {bus.seats_available ?? "N/A"}
        </div>
        <div>
          <span className="font-semibold">Max Seats per Ticket: </span>6
        </div>
      </div>

      {/* Bottom Row: View Details (left) + Select Seats (right) — flight jaisa layout */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
        >
          {showDetails ? 'Hide Bus Details' : 'View Details'} {showDetails ? '▲' : '▼'}
        </button>

        <button
          onClick={() => onViewSeats(bus)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded transition-colors"
        >
          Select Seats
        </button>
      </div>

      {/* Expandable Details Section — flight ke FLIGHT DETAILS / FARE SUMMARY jaisi tabs */}
      {showDetails && (
        <div className="mt-4">
          <div className="flex gap-6 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('boarding')}
              className={`text-xs font-bold uppercase tracking-wide pb-2 px-1 border-b-2 transition-colors ${
                activeTab === 'boarding'
                  ? 'text-orange-600 border-orange-500'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              Boarding &amp; Dropping
            </button>
            <button
              onClick={() => setActiveTab('policy')}
              className={`text-xs font-bold uppercase tracking-wide pb-2 px-1 border-b-2 transition-colors ${
                activeTab === 'policy'
                  ? 'text-orange-600 border-orange-500'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              Cancellation Policy
            </button>
          </div>

          {/* Tab Content: Boarding & Dropping */}
          {activeTab === 'boarding' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
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

          {/* Tab Content: Cancellation Policy */}
          {activeTab === 'policy' && (
            <div className="mt-4 text-xs space-y-3">
              {bus.cancellation_policies?.length > 0 ? (
                bus.cancellation_policies.flat().map((p, i) => (
                  <div key={i} className="pb-2 border-b border-gray-100 last:border-0 last:pb-0">
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
        </div>
      )}
    </div>
  );
}

function SeatMapModal({ bus, onClose }) {
  const router = useRouter();
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    async function fetchSeats() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/buses/seat-layout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ traceId: bus.traceId, resultIndex: bus.resultIndex }),
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.message || 'Seats load nahi ho paaye.');
          return;
        }
        setSeats(data.seats || []);
      } catch (err) {
        console.error('fetchSeats error:', err);
        setError('Seats load nahi ho paaye.');
      } finally {
        setLoading(false);
      }
    }
    fetchSeats();
  }, [bus]);

  function toggleSeat(seat) {
    if (!seat.isAvailable) return;
    setSelectedSeats((prev) =>
      prev.find((s) => s.seatIndex === seat.seatIndex)
        ? prev.filter((s) => s.seatIndex !== seat.seatIndex)
        : [...prev, seat]
    );
  }

  const rowNumbers = [...new Set(seats.map((s) => s.rowNo))].sort((a, b) => a - b);
  const totalPrice = selectedSeats.reduce((sum, s) => sum + Number(s.price || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ✕
        </button>
        <h2 className="text-lg font-bold text-center mb-1">{bus.operator_name}</h2>
        <p className="text-xs text-gray-500 text-center mb-5">{bus.bus_type} — Select Seats</p>

        {loading && <div className="text-center text-gray-500 py-10">Seats loading...</div>}
        {!loading && error && <div className="text-center text-red-500 py-10">{error}</div>}

        {!loading && !error && (
          <>
            <div className="flex justify-center gap-4 mb-4 text-[10px] text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 border border-green-400 inline-block rounded"></span> Available</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-300 inline-block rounded"></span> Booked</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 inline-block rounded"></span> Selected</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-pink-100 border border-pink-400 inline-block rounded"></span> Ladies</span>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 max-w-sm mx-auto">
              {rowNumbers.map((rowNo) => {
                const rowSeats = seats
                  .filter((s) => s.rowNo === rowNo)
                  .sort((a, b) => a.columnNo - b.columnNo);
                return (
                  <div key={rowNo} className="flex gap-2 justify-center mb-2">
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeats.find((s) => s.seatIndex === seat.seatIndex);
                      let bg = 'bg-green-100 border-green-400 text-green-700 cursor-pointer';
                      if (!seat.isAvailable) bg = 'bg-gray-300 border-gray-300 text-gray-400 cursor-not-allowed';
                      else if (isSelected) bg = 'bg-orange-500 border-orange-500 text-white cursor-pointer';
                      else if (seat.isLadies) bg = 'bg-pink-100 border-pink-400 text-pink-700 cursor-pointer';

                      return (
                        <button
                          key={seat.seatIndex}
                          onClick={() => toggleSeat(seat)}
                          disabled={!seat.isAvailable}
                          title={`₹${seat.price}`}
                          className={`w-9 h-9 text-[10px] font-bold border rounded flex items-center justify-center ${bg}`}
                        >
                          {seat.seatName}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="text-sm">
                <div className="text-gray-500">
                  {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
                  {selectedSeats.length > 0 && ` (${selectedSeats.map((s) => s.seatName).join(', ')})`}
                </div>
                <div className="text-xl font-bold text-green-600">₹{totalPrice.toLocaleString()}</div>
              </div>
<button
  disabled={selectedSeats.length === 0}
  onClick={() => {
    sessionStorage.setItem(
      'selectedBusBooking',
      JSON.stringify({
        bus,
        selectedSeats,
        totalPrice,
      })
    );
    router.push('/buses/booking');
  }}
  className={`font-bold text-sm px-6 py-3 rounded-lg transition-colors ${
    selectedSeats.length === 0
      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
      : 'bg-green-600 hover:bg-green-700 text-white'
  }`}
>
  {selectedSeats.length === 0 ? 'Select Seats to Continue' : '✓ Proceed to Book'}
</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default function BusesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedBusForSeats, setSelectedBusForSeats] = useState(null);

  // Search form states
  const [searchFrom, setSearchFrom] = useState('Noida');
  const [searchTo, setSearchTo] = useState('Mathura');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDate, setOpenDate] = useState(false);
  const [openFromList, setOpenFromList] = useState(false);  
const [openToList, setOpenToList] = useState(false);       

  // Filter states
  const [selectedBusTypes, setSelectedBusTypes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState('recommended');

  // Cities list
  // const indianCities = [
  //   "Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad",
  //   "Pune", "Jaipur", "Ahmedabad", "Lucknow", "Chandigarh", "Goa", "Agra",
  //   "Varanasi", "Patna", "Bhopal", "Indore", "Nagpur", "Surat", "Amritsar",
  // ];

  useEffect(() => {
    if (from) setSearchFrom(from);
    if (to) setSearchTo(to);
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
      }
    }
  }, [from, to, date]);

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

// ✅ FIXED CODE (Direct Modal target bus set karega)
function handleViewSeats(bus) {
  setSelectedBusForSeats(bus);
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
<div className="flex-[2.5] min-w-[320px] bg-[#1E2A38] rounded h-[54px] flex items-center px-4 gap-2">

  {/* FROM */}
  <div className="flex-1 relative">
    <button
      type="button"
      onClick={() => {
        setOpenFromList(!openFromList);
        setOpenToList(false);
        setOpenDate(false);
      }}
      className="flex flex-col justify-center text-left w-full"
    >
      <label className="block text-[9px] uppercase text-orange-500 tracking-wider font-bold">From</label>
      <div className="text-xs font-black mt-0.5 whitespace-nowrap text-white">{searchFrom || from || '--'}</div>
    </button>

    {openFromList && (
      <div className="absolute left-0 top-full mt-2 bg-white text-gray-800 rounded shadow-lg w-56 max-h-64 overflow-y-auto z-50">
        {indianCities.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => {
              setSearchFrom(city);
              setOpenFromList(false);
            }}
            className="block w-full text-left px-4 py-2 text-xs hover:bg-orange-50"
          >
            {city}
          </button>
        ))}
      </div>
    )}
  </div>

  {/* REVERSE BUTTON — ab flex ka normal item hai, kisi ke upar overlap nahi karega */}
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      setSearchFrom(searchTo);
      setSearchTo(searchFrom);
      setOpenFromList(false);
      setOpenToList(false);
    }}
    className="shrink-0 bg-[#1E2A38] border border-gray-600 rounded-full w-7 h-7 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-colors cursor-pointer"
  >
    ↔
  </button>

  {/* TO */}
  <div className="flex-1 relative">
    <button
      type="button"
      onClick={() => {
        setOpenToList(!openToList);
        setOpenFromList(false);
        setOpenDate(false);
      }}
      className="flex flex-col justify-center text-left w-full"
    >
      <label className="block text-[9px] uppercase text-orange-500 tracking-wider font-bold">To</label>
      <div className="text-xs font-black mt-0.5 whitespace-nowrap text-white">{searchTo || to || '--'}</div>
    </button>

    {openToList && (
      <div className="absolute left-0 top-full mt-2 bg-white text-gray-800 rounded shadow-lg w-56 max-h-64 overflow-y-auto z-50">
        {indianCities.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => {
              setSearchTo(city);
              setOpenToList(false);
            }}
            className="block w-full text-left px-4 py-2 text-xs hover:bg-orange-50"
          >
            {city}
          </button>
        ))}
      </div>
    )}
  </div>
</div>

    {/* TRAVEL DATE */}
    <div className="flex-1 min-w-[140px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] relative">
      <button
        type="button"
        onClick={() => {
          setOpenDate(!openDate);
          setOpenFromList(false);
          setOpenToList(false);
        }}
        className="flex flex-col justify-center w-full h-full text-left"
      >
        <label className="block text-[9px] uppercase text-gray-400 tracking-wider font-medium">Travel Date</label>
        <div className="text-xs font-black mt-0.5 flex justify-between items-center whitespace-nowrap">
          <span>{selectedDate ? selectedDate.toISOString().split('T')[0] : date || '--'}</span>
          <CalendarIcon className="w-4 h-4 text-gray-400 ml-1" />
        </div>
      </button>

      {openDate && (
        <div className="absolute right-0 top-full mt-2 p-3 bg-white shadow-lg rounded-lg z-50 border-2 border-orange-200">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(d) => {
              if (d) setSelectedDate(d);
              setOpenDate(false);
            }}
            disabled={{ before: new Date() }}
          />
        </div>
      )}
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
    key={bus.id || bus.resultIndex}
    bus={bus}
    onViewSeats={handleViewSeats}
  />
))}
          </section>
        </main>
      </div>
      <Footer />
      {selectedBusForSeats && (
  <SeatMapModal bus={selectedBusForSeats} onClose={() => setSelectedBusForSeats(null)} />
)}
    </>
  );
}