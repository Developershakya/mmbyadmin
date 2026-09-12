import React, { useState, useRef } from 'react';
import {
  X,
  Search,
  Loader2,
  Plane,
  Building2,
  Car,
  Bus,
  Check,
  Star,
  Clock,
  ArrowRight,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Edit3,
  Sparkles,
  Trash2
} from 'lucide-react';
import AutocompleteInput from './AutocompleteInput.jsx';
import {
  searchFlightsApi,
  searchHotelsApi,
  searchCabsApi,
  searchBusesApi
} from '../../lib/packageBuilder/searchApi.js';

// INR Currency Formatter
const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

/* =========================================================================
   1. FLIGHT SEARCH & MANUAL ENTRY MODAL (WITH IMAGE UPLOAD)
   ========================================================================= */
export function FlightSearchModal({
  isOpen,
  onClose,
  onSelectFlight,
  initialData = {},
  showToast
}) {
  const [activeTab, setActiveTab] = useState('api'); // 'api' | 'manual'

  // API Search State
  const [fromCode, setFromCode] = useState(initialData.from || 'DEL');
  const [fromName, setFromName] = useState(initialData.fromName || 'Delhi');
  const [toCode, setToCode] = useState(initialData.to || 'KUU');
  const [toName, setToName] = useState(initialData.toName || 'Bhuntar / Kullu');
  const [date, setDate] = useState(initialData.departureDate || '2026-07-07');
  const [pax, setPax] = useState(initialData.pax || 2);
  const [cabin, setCabin] = useState(initialData.cabin || 'Economy');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Manual Entry State
  const [manualAirline, setManualAirline] = useState(initialData.airline || 'IndiGo');
  const [manualFlightNumber, setManualFlightNumber] = useState(initialData.flightNumber || '6E 204');
  const [manualFrom, setManualFrom] = useState(initialData.fromName || initialData.from || 'Delhi (DEL)');
  const [manualTo, setManualTo] = useState(initialData.toName || initialData.to || 'Bhuntar / Kullu (KUU)');
  const [manualDeparture, setManualDeparture] = useState(initialData.departure || '09:20');
  const [manualArrival, setManualArrival] = useState(initialData.arrival || '11:35');
  const [manualDuration, setManualDuration] = useState(initialData.duration || '2h 15m');
  const [manualCabin, setManualCabin] = useState(initialData.cabin || 'Economy');
  const [manualFare, setManualFare] = useState(initialData.fare || 5500);
  const [manualTax, setManualTax] = useState(initialData.tax || 650);
  const [flightImage, setFlightImage] = useState(initialData.flightImage || '');
  const [flightImageName, setFlightImageName] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle local file image upload
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        if (showToast) showToast('Image file size must be under 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFlightImage(reader.result);
        setFlightImageName(file.name);
        if (showToast) showToast('Flight image attached successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async () => {
    if (!fromName.trim()) {
      setError('Origin airport is required.');
      return;
    }
    if (!toName.trim()) {
      setError('Destination airport is required.');
      return;
    }

    setError('');
    setLoading(true);
    setHasSearched(true);

    try {
      const flightResults = await searchFlightsApi({
        origin: fromCode || fromName.slice(0, 3).toUpperCase(),
        destination: toCode || toName.slice(0, 3).toUpperCase(),
        departureDate: date,
        adultCount: pax,
        flightCabinClass: cabin === 'Business' ? 4 : cabin === 'Premium Economy' ? 3 : 2
      });

      setResults(flightResults);
      if (flightResults.length === 0 && showToast) {
        showToast('No direct flights found for this route. Showing nearby connections or use Manual Form.', 'info');
      }
    } catch (err) {
      console.error('Flight search failed:', err);
      setError(err.message || 'Failed to search flights from SRDV API.');
      if (showToast) {
        showToast(`Flight API: ${err.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualFlight = () => {
    if (!manualAirline.trim()) {
      setError('Please provide Airline Name.');
      return;
    }
    if (!manualFrom.trim() || !manualTo.trim()) {
      setError('Please provide Origin and Destination airports.');
      return;
    }

    const payload = {
      airline: manualAirline.trim(),
      flightNumber: manualFlightNumber.trim() || 'Custom',
      from: manualFrom.length <= 4 ? manualFrom.toUpperCase() : manualFrom.slice(0, 3).toUpperCase(),
      fromName: manualFrom,
      to: manualTo.length <= 4 ? manualTo.toUpperCase() : manualTo.slice(0, 3).toUpperCase(),
      toName: manualTo,
      departure: manualDeparture,
      arrival: manualArrival,
      duration: manualDuration,
      cabin: manualCabin,
      fare: Number(manualFare) || 0,
      tax: Number(manualTax) || 0,
      flightImage: flightImage || null,
      isManual: true,
      apiSelected: false
    };

    onSelectFlight(payload);
    onClose();
    if (showToast) showToast('Flight added manually to itinerary!', 'success');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Plane className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Flight Details</h2>
              <p className="text-xs text-slate-500">Live API Search or Custom Manual Entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: API Search vs Manual Entry */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-200 shrink-0 bg-white">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-md">
            <button
              type="button"
              onClick={() => { setActiveTab('api'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'api'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search via API</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('manual'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Add Flight Manually</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* TAB 1: API SEARCH */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div className="lg:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Origin Airport <span className="text-red-500">*</span>
                  </label>
                  <AutocompleteInput
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    onSelect={(item) => {
                      setFromName(item.label);
                      setFromCode(item.code);
                    }}
                    suggestUrl="/api/cities/airports"
                    placeholder="Search origin (e.g. Delhi, DEL)"
                    iconType="airport"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Destination Airport <span className="text-red-500">*</span>
                  </label>
                  <AutocompleteInput
                    value={toName}
                    onChange={(e) => setToName(e.target.value)}
                    onSelect={(item) => {
                      setToName(item.label);
                      setToCode(item.code);
                    }}
                    suggestUrl="/api/cities/airports"
                    placeholder="Search destination (e.g. Kullu, KUU)"
                    iconType="airport"
                  />
                </div>

                <div className="col-span-1">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div className="col-span-1">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Passengers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={pax}
                    onChange={(e) => setPax(Number(e.target.value) || 1)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div className="col-span-1">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Cabin Class
                  </label>
                  <select
                    value={cabin}
                    onChange={(e) => setCabin(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  >
                    <option>Economy</option>
                    <option>Premium Economy</option>
                    <option>Business</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-75"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{loading ? 'Querying Live Airline GDS...' : 'Search Flights via API'}</span>
              </button>

              {/* Results Container */}
              <div className="space-y-3 pt-2">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-xs gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="font-medium">Fetching real-time flights &amp; published fares...</span>
                  </div>
                )}

                {!loading && hasSearched && results.length === 0 && (
                  <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <p className="text-xs text-slate-600">
                      No direct flights found for this route from the API.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('manual');
                        setManualFrom(fromName);
                        setManualTo(toName);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Add Flight Details Manually Instead</span>
                    </button>
                  </div>
                )}

                {!loading &&
                  results.map((flight) => (
                    <div
                      key={flight.id || flight.resultIndex}
                      className="flex flex-wrap items-center justify-between gap-4 border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition bg-white"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#0F172A] text-sm">
                            {flight.airline}
                          </p>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold">
                            {flight.flightNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">{flight.departure}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold text-slate-800">{flight.arrival}</span>
                          <span className="text-slate-300">·</span>
                          <span>{flight.duration}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-700 font-medium">{flight.cabin || cabin}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-[#0F172A] text-base">
                          {inr(flight.fare)}
                          <span className="text-xs font-normal text-slate-500"> / pax</span>
                        </p>
                        <p className="text-[11px] text-emerald-700 font-medium">Taxes: {inr(flight.tax || 650)}</p>
                      </div>

                      <button
                        onClick={() => {
                          onSelectFlight({
                            ...flight,
                            from: fromCode || fromName.slice(0, 3).toUpperCase(),
                            fromName,
                            to: toCode || toName.slice(0, 3).toUpperCase(),
                            toName,
                            cabin,
                            apiSelected: true
                          });
                          onClose();
                          if (showToast) {
                            showToast(`Added ${flight.airline} flight to day!`, 'success');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
                      >
                        Select Flight
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL ENTRY FORM WITH FLIGHT IMAGE UPLOAD */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs text-blue-900 leading-relaxed">
                <span className="font-bold">Manual Flight Entry:</span> Enter your flight details directly or upload a flight ticket/voucher image. Both data and image will be saved and rendered in the customer itinerary.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Airline Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualAirline}
                    onChange={(e) => setManualAirline(e.target.value)}
                    placeholder="e.g. IndiGo, Air India, Vistara"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Flight Number
                  </label>
                  <input
                    type="text"
                    value={manualFlightNumber}
                    onChange={(e) => setManualFlightNumber(e.target.value)}
                    placeholder="e.g. 6E 204"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Origin (From) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualFrom}
                    onChange={(e) => setManualFrom(e.target.value)}
                    placeholder="e.g. Delhi (DEL)"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Destination (To) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualTo}
                    onChange={(e) => setManualTo(e.target.value)}
                    placeholder="e.g. Bhuntar / Kullu (KUU)"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Departure Time
                  </label>
                  <input
                    type="text"
                    value={manualDeparture}
                    onChange={(e) => setManualDeparture(e.target.value)}
                    placeholder="e.g. 09:20 AM"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Arrival Time
                  </label>
                  <input
                    type="text"
                    value={manualArrival}
                    onChange={(e) => setManualArrival(e.target.value)}
                    placeholder="e.g. 11:35 AM"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    placeholder="e.g. 2h 15m"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Cabin Class
                  </label>
                  <select
                    value={manualCabin}
                    onChange={(e) => setManualCabin(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  >
                    <option>Economy</option>
                    <option>Premium Economy</option>
                    <option>Business</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Fare per Person (INR)
                  </label>
                  <input
                    type="number"
                    value={manualFare}
                    onChange={(e) => setManualFare(Number(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Taxes (INR)
                  </label>
                  <input
                    type="number"
                    value={manualTax}
                    onChange={(e) => setManualTax(Number(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* FLIGHT IMAGE UPLOAD SECTION */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-[#0F172A]">
                      Optional Flight Image / Ticket Upload
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">PNG, JPG, WebP up to 5MB</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 border border-dashed border-purple-300 hover:border-purple-500 bg-white rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50/50 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Browse Flight Image / Ticket</span>
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={flightImage && !flightImage.startsWith('data:') ? flightImage : ''}
                      onChange={(e) => setFlightImage(e.target.value)}
                      placeholder="Or enter Flight Image URL..."
                      className="w-full border border-slate-200 bg-white rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition"
                    />
                  </div>
                </div>

                {flightImage && (
                  <div className="relative inline-block mt-2 border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white p-1">
                    <img
                      src={flightImage}
                      alt="Flight Attachment"
                      className="h-28 w-auto object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => { setFlightImage(''); setFlightImageName(''); }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition cursor-pointer shadow-xs"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {flightImageName && (
                      <p className="text-[10px] text-slate-500 px-1 pt-1 truncate max-w-xs">{flightImageName}</p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddManualFlight}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Add Manual Flight to Day Itinerary</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. HOTEL SEARCH & MANUAL ENTRY MODAL
   ========================================================================= */
export function HotelSearchModal({
  isOpen,
  onClose,
  onSelectHotel,
  initialData = {},
  showToast
}) {
  const [activeTab, setActiveTab] = useState('api'); // 'api' | 'manual'

  // API Search State
  const [destination, setDestination] = useState(initialData.location || 'Manali');
  const [checkIn, setCheckIn] = useState(initialData.checkIn || '2026-07-07');
  const [checkOut, setCheckOut] = useState(initialData.checkOut || '2026-07-09');
  const [guests, setGuests] = useState(initialData.guests || 2);
  const [category, setCategory] = useState(initialData.category || 'Any');
  const [nights, setNights] = useState(initialData.nights || 2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Manual Entry State
  const [manualName, setManualName] = useState(initialData.name || 'Snow Valley Luxury Resort');
  const [manualLocation, setManualLocation] = useState(initialData.location || 'Manali');
  const [manualStars, setManualStars] = useState(initialData.stars || 4);
  const [manualRoom, setManualRoom] = useState(initialData.room || 'Deluxe Mountain View Room');
  const [manualMeal, setManualMeal] = useState(initialData.meal || 'Breakfast Included (CP Plan)');
  const [manualPrice, setManualPrice] = useState(initialData.price || 4200);
  const [manualNights, setManualNights] = useState(initialData.nights || 1);
  const [manualImage, setManualImage] = useState(
    initialData.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop'
  );
  const [hotelImageName, setHotelImageName] = useState('');
  const hotelFileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleHotelImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        if (showToast) showToast('Image file size must be under 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setManualImage(reader.result);
        setHotelImageName(file.name);
        if (showToast) showToast('Hotel photo attached!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async () => {
    if (!destination.trim()) {
      setError('Hotel destination is required.');
      return;
    }

    setError('');
    setLoading(true);
    setHasSearched(true);

    try {
      const starRating = category === '5 Star' ? 5 : category === '4 Star' ? 4 : category === '3 Star' ? 3 : 0;
      const hotelResults = await searchHotelsApi({
        destination,
        checkIn,
        checkOut,
        nights,
        guestCount: guests,
        starRating
      });

      setResults(hotelResults);
    } catch (err) {
      console.error('Hotel search failed:', err);
      setError(err.message || 'Failed to search hotels from SRDV API.');
      if (showToast) {
        showToast(`Hotel API: ${err.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualHotel = () => {
    if (!manualName.trim()) {
      setError('Hotel Name is required.');
      return;
    }

    const payload = {
      name: manualName.trim(),
      location: manualLocation.trim() || destination,
      stars: Number(manualStars) || 4,
      roomType: manualRoom,
      room: manualRoom,
      mealPlan: manualMeal,
      meal: manualMeal,
      price: Number(manualPrice) || 3500,
      nights: Number(manualNights) || 1,
      image: manualImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop',
      rating: 4.5,
      reviews: 950,
      isManual: true,
      apiSelected: false
    };

    onSelectHotel(payload);
    onClose();
    if (showToast) showToast(`Added ${manualName} to Day!`, 'success');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Hotel &amp; Accommodations</h2>
              <p className="text-xs text-slate-500">Live Hotel Search or Custom Manual Entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-200 shrink-0 bg-white">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-md">
            <button
              type="button"
              onClick={() => { setActiveTab('api'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'api'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search via API</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('manual'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Add Hotel Manually</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* TAB 1: API SEARCH */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Destination City <span className="text-red-500">*</span>
                  </label>
                  <AutocompleteInput
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onSelect={(item) => setDestination(item.label)}
                    suggestUrl="/api/cities/hotel"
                    placeholder="Search city (e.g. Manali, Goa, Jaipur)"
                    iconType="hotel"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Nights Stay
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value) || 1)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value) || 1)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Category / Rating
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  >
                    <option>Any</option>
                    <option>5 Star</option>
                    <option>4 Star</option>
                    <option>3 Star</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-75"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{loading ? 'Searching SRDV Hotels...' : 'Search Hotels via API'}</span>
              </button>

              {/* Results List */}
              <div className="space-y-3 pt-2">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-xs gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <span className="font-medium">Connecting to hotel inventory &amp; best rates...</span>
                  </div>
                )}

                {!loading && hasSearched && results.length === 0 && (
                  <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <p className="text-xs text-slate-600">
                      No hotels returned by API for "{destination}".
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('manual');
                        setManualLocation(destination);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Add Hotel Details Manually</span>
                    </button>
                  </div>
                )}

                {!loading &&
                  results.map((hotel) => (
                    <div
                      key={hotel.id || hotel.hotelCode}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200 rounded-2xl p-4 hover:border-indigo-400 hover:shadow-sm transition bg-white"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=300&auto=format&fit=crop'}
                          alt={hotel.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-100"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-[#0F172A] truncate">
                            {hotel.name}
                          </h4>
                          <div className="flex items-center gap-1 text-amber-500 text-xs mt-0.5">
                            {'★'.repeat(hotel.stars || 4)}
                            <span className="text-slate-500 ml-1 text-[11px]">
                              {hotel.rating || 4.2} ({hotel.reviews || 500} reviews)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {hotel.roomType || 'Deluxe Room'} · {hotel.mealPlan || 'Breakfast Included'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div>
                          <p className="font-bold text-[#0F172A] text-base text-right">
                            {inr(hotel.price)}
                            <span className="text-xs font-normal text-slate-500"> / night</span>
                          </p>
                          <span className="text-[10px] text-emerald-700 font-semibold block text-right">
                            Instant Confirmation
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            onSelectHotel({
                              ...hotel,
                              destination,
                              checkIn,
                              checkOut,
                              nights,
                              apiSelected: true
                            });
                            onClose();
                            if (showToast) {
                              showToast(`Added ${hotel.name} to Day!`, 'success');
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Select Hotel
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL ENTRY FORM */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/70 rounded-xl text-xs text-indigo-900 leading-relaxed">
                <span className="font-bold">Manual Hotel Entry:</span> Fill in the details of the hotel, resort, or homestay. It will be added to the itinerary and pricing automatically.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Hotel Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. goSTOPS Mussoorie Clock Tower"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Destination / City
                  </label>
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="e.g. Mussoorie / Manali"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Star Rating
                  </label>
                  <select
                    value={manualStars}
                    onChange={(e) => setManualStars(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  >
                    <option value={5}>5 Star Luxury</option>
                    <option value={4}>4 Star Premium</option>
                    <option value={3}>3 Star Standard</option>
                    <option value={2}>2 Star Budget</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Room Category
                  </label>
                  <input
                    type="text"
                    value={manualRoom}
                    onChange={(e) => setManualRoom(e.target.value)}
                    placeholder="e.g. 1 Super Deluxe Room, 2 Pax"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Meal Plan
                  </label>
                  <input
                    type="text"
                    value={manualMeal}
                    onChange={(e) => setManualMeal(e.target.value)}
                    placeholder="e.g. ROOM ONLY (EP) or Breakfast Included (CP)"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Price per Night (INR)
                  </label>
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(Number(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Hotel Photo (Upload File or Enter URL)
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={hotelFileInputRef}
                      onChange={handleHotelImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => hotelFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold cursor-pointer text-xs transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <input
                      type="text"
                      value={manualImage && !manualImage.startsWith('data:') ? manualImage : ''}
                      onChange={(e) => setManualImage(e.target.value)}
                      placeholder="Or paste image URL (https://...)"
                      className="flex-1 min-w-[200px] border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                    />
                  </div>

                  {manualImage && (
                    <div className="relative inline-block mt-1.5 border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white p-1">
                      <img
                        src={manualImage}
                        alt="Hotel Preview"
                        className="h-24 w-auto object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => { setManualImage(''); setHotelImageName(''); }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition cursor-pointer shadow-xs"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      {hotelImageName && (
                        <p className="text-[10px] text-slate-500 px-1 pt-0.5 truncate max-w-xs">{hotelImageName}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddManualHotel}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Add Manual Hotel to Day Itinerary</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. CAB / CAR SEARCH & MANUAL ENTRY MODAL
   ========================================================================= */
export function CabSearchModal({
  isOpen,
  onClose,
  onSelectCab,
  initialData = {},
  showToast
}) {
  const [activeTab, setActiveTab] = useState('api'); // 'api' | 'manual'

  // API Search State
  const [pickup, setPickup] = useState(initialData.pickup || 'Kullu Airport');
  const [drop, setDrop] = useState(initialData.drop || 'Manali Hotel');
  const [date, setDate] = useState(initialData.date || '2026-07-07');
  const [time, setTime] = useState(initialData.time || '12:30 PM');
  const [vehicleType, setVehicleType] = useState(initialData.category || 'Any');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Manual Entry State
  const [manualVehicle, setManualVehicle] = useState(initialData.vehicle || 'Toyota Etios / Dzire');
  const [manualCategory, setManualCategory] = useState(initialData.category || 'Sedan');
  const [manualSeats, setManualSeats] = useState(initialData.seats || 4);
  const [manualAc, setManualAc] = useState(true);
  const [manualPickup, setManualPickup] = useState(initialData.pickup || 'Mussoorie / Delhi');
  const [manualDrop, setManualDrop] = useState(initialData.drop || 'Khajjiar / Manali');
  const [manualPrice, setManualPrice] = useState(initialData.price || 1500);
  const [manualImage, setManualImage] = useState(initialData.image || initialData.voucherImage || '');
  const [cabImageName, setCabImageName] = useState('');
  const cabFileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleCabImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        if (showToast) showToast('Image file size must be under 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setManualImage(reader.result);
        setCabImageName(file.name);
        if (showToast) showToast('Cab voucher/photo attached!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async () => {
    if (!pickup.trim()) {
      setError('Pickup location is required.');
      return;
    }

    setError('');
    setLoading(true);
    setHasSearched(true);

    try {
      const cabResults = await searchCabsApi({
        pickup,
        drop: drop || pickup,
        date,
        time,
        vehicleType
      });

      setResults(cabResults);
    } catch (err) {
      console.error('Cab search failed:', err);
      setError(err.message || 'Failed to search cabs from SRDV API.');
      if (showToast) {
        showToast(`Cab API: ${err.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualCab = () => {
    if (!manualVehicle.trim()) {
      setError('Vehicle name is required.');
      return;
    }

    const payload = {
      vehicle: manualVehicle.trim(),
      category: manualCategory,
      seats: Number(manualSeats) || 4,
      ac: manualAc,
      pickup: manualPickup,
      drop: manualDrop,
      date,
      time,
      price: Number(manualPrice) || 1500,
      image: manualImage || '',
      voucherImage: manualImage || '',
      isManual: true,
      apiSelected: false
    };

    onSelectCab(payload);
    onClose();
    if (showToast) showToast(`Added ${manualVehicle} to Day!`, 'success');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Cab &amp; Private Transfers</h2>
              <p className="text-xs text-slate-500">Live Cab Search or Custom Private Car Entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-200 shrink-0 bg-white">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-md">
            <button
              type="button"
              onClick={() => { setActiveTab('api'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'api'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search via API</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('manual'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Add Cab Manually</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* TAB 1: API SEARCH */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Pickup Location <span className="text-red-500">*</span>
                  </label>
                  <AutocompleteInput
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    onSelect={(item) => setPickup(item.label)}
                    suggestUrl="/api/cities/cab"
                    placeholder="Pickup City / Landmark"
                    iconType="car"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Drop Destination <span className="text-red-500">*</span>
                  </label>
                  <AutocompleteInput
                    value={drop}
                    onChange={(e) => setDrop(e.target.value)}
                    onSelect={(item) => setDrop(item.label)}
                    suggestUrl="/api/cities/cab"
                    placeholder="Drop Destination"
                    iconType="car"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 12:30 PM"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  >
                    <option>Any</option>
                    <option>Sedan</option>
                    <option>SUV</option>
                    <option>Tempo Traveller</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-75"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{loading ? 'Searching Transport Fleet...' : 'Search Cabs via API'}</span>
              </button>

              {/* Results */}
              <div className="space-y-3 pt-2">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-xs gap-3">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    <span className="font-medium">Checking available transport fleet...</span>
                  </div>
                )}

                {!loading && hasSearched && results.length === 0 && (
                  <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <p className="text-xs text-slate-600">No cabs returned by API for this route.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('manual');
                        setManualPickup(pickup);
                        setManualDrop(drop);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Add Cab / Car Manually</span>
                    </button>
                  </div>
                )}

                {!loading &&
                  results.map((cab) => (
                    <div
                      key={cab.id || cab.carId}
                      className="flex items-center justify-between gap-4 border border-slate-200 rounded-xl p-3.5 hover:border-emerald-400 hover:shadow-sm transition bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <Car className="w-5 h-5" />
                        </span>
                        <div>
                          <p className="font-bold text-[#0F172A] text-sm">{cab.vehicle}</p>
                          <p className="text-xs text-slate-500">
                            {cab.category} · {cab.seats} Seats {cab.ac ? '· AC' : ''}
                          </p>
                        </div>
                      </div>

                      <p className="font-bold text-[#0F172A] text-base">{inr(cab.price)}</p>

                      <button
                        onClick={() => {
                          onSelectCab({
                            ...cab,
                            pickup,
                            drop,
                            date,
                            time,
                            apiSelected: true
                          });
                          onClose();
                          if (showToast) {
                            showToast(`Added cab "${cab.vehicle}" to Day!`, 'success');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
                      >
                        Select Cab
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL ENTRY FORM */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs text-emerald-900 leading-relaxed">
                <span className="font-bold">Manual Vehicle Entry:</span> Specify private AC cab, sedan, or SUV transfer.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Vehicle Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualVehicle}
                    onChange={(e) => setManualVehicle(e.target.value)}
                    placeholder="e.g. Toyota Innova Crysta / Sedan"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Category
                  </label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  >
                    <option>Sedan</option>
                    <option>SUV</option>
                    <option>Hatchback</option>
                    <option>Tempo Traveller</option>
                    <option>Luxury</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    value={manualPickup}
                    onChange={(e) => setManualPickup(e.target.value)}
                    placeholder="e.g. Mussoorie Hotel / Airport"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Drop Location
                  </label>
                  <input
                    type="text"
                    value={manualDrop}
                    onChange={(e) => setManualDrop(e.target.value)}
                    placeholder="e.g. Khajjiar / Resort"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={manualSeats}
                    onChange={(e) => setManualSeats(Number(e.target.value) || 4)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Rate / Transfer Price (INR)
                  </label>
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(Number(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    id="cab-ac-toggle"
                    type="checkbox"
                    checked={manualAc}
                    onChange={(e) => setManualAc(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-400 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="cab-ac-toggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Air Conditioned (AC Vehicle)
                  </label>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Cab Photo / Voucher Ticket (Optional)
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={cabFileInputRef}
                      onChange={handleCabImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => cabFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold cursor-pointer text-xs transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo / Voucher</span>
                    </button>
                    <input
                      type="text"
                      value={manualImage && !manualImage.startsWith('data:') ? manualImage : ''}
                      onChange={(e) => setManualImage(e.target.value)}
                      placeholder="Or paste photo/ticket URL (https://...)"
                      className="flex-1 min-w-[200px] border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                    />
                  </div>

                  {manualImage && (
                    <div className="relative inline-block mt-1.5 border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white p-1">
                      <img
                        src={manualImage}
                        alt="Cab Preview"
                        className="h-24 w-auto object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => { setManualImage(''); setCabImageName(''); }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition cursor-pointer shadow-xs"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      {cabImageName && (
                        <p className="text-[10px] text-slate-500 px-1 pt-0.5 truncate max-w-xs">{cabImageName}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddManualCab}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Add Manual Cab to Day Itinerary</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   4. BUS SEARCH & MANUAL ENTRY MODAL
   ========================================================================= */
export function BusSearchModal({
  isOpen,
  onClose,
  onSelectBus,
  initialData = {},
  showToast
}) {
  const [activeTab, setActiveTab] = useState('api'); // 'api' | 'manual'

  // API Search State
  const [from, setFrom] = useState(initialData.from || 'Delhi');
  const [to, setTo] = useState(initialData.to || 'Manali');
  const [date, setDate] = useState(initialData.date || '2026-07-07');
  const [pax, setPax] = useState(initialData.pax || 2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Manual Entry State
  const [manualOperator, setManualOperator] = useState(initialData.operator || 'Zingbus / HRTC Volvo');
  const [manualBusType, setManualBusType] = useState(initialData.busType || 'AC Volvo Semi-Sleeper (2+2)');
  const [manualFrom, setManualFrom] = useState(initialData.from || 'Delhi (Kashmere Gate)');
  const [manualTo, setManualTo] = useState(initialData.to || 'Manali / Mussoorie');
  const [manualDeparture, setManualDeparture] = useState(initialData.departure || '21:30');
  const [manualArrival, setManualArrival] = useState(initialData.arrival || '08:00');
  const [manualPrice, setManualPrice] = useState(initialData.price || 1200);
  const [manualImage, setManualImage] = useState(initialData.image || initialData.voucherImage || '');
  const [busImageName, setBusImageName] = useState('');
  const busFileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleBusImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        if (showToast) showToast('Image file size must be under 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setManualImage(reader.result);
        setBusImageName(file.name);
        if (showToast) showToast('Bus ticket/photo attached!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async () => {
    if (!from.trim()) {
      setError('Origin city is required.');
      return;
    }
    if (!to.trim()) {
      setError('Destination city is required.');
      return;
    }

    setError('');
    setLoading(true);
    setHasSearched(true);

    try {
      const busResults = await searchBusesApi({
        from,
        to,
        dateOfJourney: date,
        pax
      });

      setResults(busResults);
    } catch (err) {
      console.error('Bus search failed:', err);
      setError(err.message || 'Failed to search buses from SRDV API.');
      if (showToast) {
        showToast(`Bus API: ${err.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualBus = () => {
    if (!manualOperator.trim()) {
      setError('Bus operator name is required.');
      return;
    }

    const payload = {
      operator: manualOperator.trim(),
      busType: manualBusType,
      from: manualFrom,
      to: manualTo,
      departure: manualDeparture,
      arrival: manualArrival,
      price: Number(manualPrice) || 1200,
      date,
      image: manualImage || '',
      voucherImage: manualImage || '',
      isManual: true,
      apiSelected: false
    };

    onSelectBus(payload);
    onClose();
    if (showToast) showToast(`Added bus "${manualOperator}" to Day!`, 'success');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Bus className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Bus Services</h2>
              <p className="text-xs text-slate-500">Live Bus Inventory or Custom Manual Entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-200 shrink-0 bg-white">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-md">
            <button
              type="button"
              onClick={() => { setActiveTab('api'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'api'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search via API</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('manual'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Add Bus Manually</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* TAB 1: API SEARCH */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Origin City <span className="text-red-500">*</span>
                  </label>
                  <AutocompleteInput
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    onSelect={(item) => setFrom(item.label)}
                    suggestUrl="/api/cities/bus"
                    placeholder="Origin City"
                    iconType="bus"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Destination City <span className="text-red-500">*</span>
                  </label>
                  <AutocompleteInput
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    onSelect={(item) => setTo(item.label)}
                    suggestUrl="/api/cities/bus"
                    placeholder="Destination City"
                    iconType="bus"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Passengers</label>
                  <input
                    type="number"
                    min="1"
                    value={pax}
                    onChange={(e) => setPax(Number(e.target.value) || 1)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  />
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-75"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{loading ? 'Searching Bus Schedules...' : 'Search Buses via API'}</span>
              </button>

              {/* Results */}
              <div className="space-y-3 pt-2">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-xs gap-3">
                    <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                    <span className="font-medium">Querying bus routes &amp; seat availability...</span>
                  </div>
                )}

                {!loading && hasSearched && results.length === 0 && (
                  <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <p className="text-xs text-slate-600">No scheduled buses found for this route.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('manual');
                        setManualFrom(from);
                        setManualTo(to);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Add Bus Manually</span>
                    </button>
                  </div>
                )}

                {!loading &&
                  results.map((bus) => (
                    <div
                      key={bus.id || bus.busId}
                      className="flex items-center justify-between gap-4 border border-slate-200 rounded-xl p-3.5 hover:border-amber-400 hover:shadow-sm transition bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                          <Bus className="w-5 h-5" />
                        </span>
                        <div>
                          <p className="font-bold text-[#0F172A] text-sm">{bus.operator}</p>
                          <p className="text-xs text-slate-500">
                            {bus.busType} · {bus.departure} → {bus.arrival}
                          </p>
                        </div>
                      </div>

                      <p className="font-bold text-[#0F172A] text-base">
                        {inr(bus.price)}
                        <span className="text-xs font-normal text-slate-500"> / pax</span>
                      </p>

                      <button
                        onClick={() => {
                          onSelectBus({
                            ...bus,
                            from,
                            to,
                            date,
                            apiSelected: true
                          });
                          onClose();
                          if (showToast) {
                            showToast(`Added bus "${bus.operator}" to Day!`, 'success');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
                      >
                        Select Bus
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL ENTRY FORM */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 leading-relaxed">
                <span className="font-bold">Manual Bus Entry:</span> Specify luxury bus, Volvo sleeper, or state transport coach.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Bus Operator <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualOperator}
                    onChange={(e) => setManualOperator(e.target.value)}
                    placeholder="e.g. Zingbus, Intrcity, HRTC Volvo"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Bus Category / Type
                  </label>
                  <input
                    type="text"
                    value={manualBusType}
                    onChange={(e) => setManualBusType(e.target.value)}
                    placeholder="e.g. AC Volvo Multi-Axle Sleeper (2+1)"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Boarding Point (From)
                  </label>
                  <input
                    type="text"
                    value={manualFrom}
                    onChange={(e) => setManualFrom(e.target.value)}
                    placeholder="e.g. Delhi (Kashmere Gate ISBT)"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Dropping Point (To)
                  </label>
                  <input
                    type="text"
                    value={manualTo}
                    onChange={(e) => setManualTo(e.target.value)}
                    placeholder="e.g. Manali Bus Stand"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Departure Time
                  </label>
                  <input
                    type="text"
                    value={manualDeparture}
                    onChange={(e) => setManualDeparture(e.target.value)}
                    placeholder="e.g. 09:30 PM"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Arrival Time
                  </label>
                  <input
                    type="text"
                    value={manualArrival}
                    onChange={(e) => setManualArrival(e.target.value)}
                    placeholder="e.g. 08:00 AM"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Fare per Seat (INR)
                  </label>
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(Number(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Bus Photo / Ticket Voucher (Optional)
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={busFileInputRef}
                      onChange={handleBusImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => busFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold cursor-pointer text-xs transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo / Ticket</span>
                    </button>
                    <input
                      type="text"
                      value={manualImage && !manualImage.startsWith('data:') ? manualImage : ''}
                      onChange={(e) => setManualImage(e.target.value)}
                      placeholder="Or paste photo/ticket URL (https://...)"
                      className="flex-1 min-w-[200px] border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                    />
                  </div>

                  {manualImage && (
                    <div className="relative inline-block mt-1.5 border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white p-1">
                      <img
                        src={manualImage}
                        alt="Bus Preview"
                        className="h-24 w-auto object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => { setManualImage(''); setBusImageName(''); }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition cursor-pointer shadow-xs"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      {busImageName && (
                        <p className="text-[10px] text-slate-500 px-1 pt-0.5 truncate max-w-xs">{busImageName}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddManualBus}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Add Manual Bus to Day Itinerary</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
