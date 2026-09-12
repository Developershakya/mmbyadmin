import React, { useState } from 'react';
import {
  Plane,
  Search,
  CheckCircle2,
  AlertCircle,
  Sliders,
  ChevronDown,
  Clock,
  ShieldCheck,
  Luggage,
  Sparkles
} from 'lucide-react';
import { searchFlights, checkFlightAvailability } from '../../../lib/api/flights.js';

export default function FlightServiceCard({
  flightData = {},
  onChange,
  defaultDate = ''
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [showAdvancedRules, setShowAdvancedRules] = useState(false);

  const updateField = (field, value) => {
    onChange({
      ...flightData,
      [field]: value
    });
  };

  const updateRule = (ruleKey, value) => {
    onChange({
      ...flightData,
      rules: {
        ...(flightData.rules || {}),
        [ruleKey]: value
      }
    });
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchResults(null);
    setAvailabilityStatus(null);

    try {
      const res = await searchFlights({
        from: flightData.from || 'Delhi (DEL)',
        to: flightData.to || 'Chandigarh (IXC)',
        airline: flightData.airline || 'ALL',
        classType: flightData.classType || 'Economy',
        date: flightData.date || defaultDate
      });
      setSearchResults(res.flights || []);
    } catch (err) {
      console.error('Flight search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFlight = (flight) => {
    onChange({
      ...flightData,
      airline: flight.airline,
      classType: flight.classType,
      selectedFlight: {
        id: flight.id,
        airline: flight.airline,
        flightNo: flight.flightNo,
        from: flight.from,
        to: flight.to,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        duration: flight.duration,
        basePrice: flight.basePrice,
        taxes: flight.taxes,
        totalPrice: flight.totalPrice
      }
    });
    setSearchResults(null);
  };

  const handleCheckAvailability = async (flightId) => {
    if (!flightId) return;
    setCheckingAvailability(true);
    try {
      const res = await checkFlightAvailability(flightId);
      setAvailabilityStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const selected = flightData.selectedFlight;

  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 md:p-5 border border-blue-200/80 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center font-bold">
            <Plane className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">Flight Configuration</span>
            <span className="text-[11px] text-slate-500">Live API search & passenger route specifications</span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          Flight Connected
        </span>
      </div>

      {/* Flight Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Departure (From)</label>
          <input
            type="text"
            value={flightData.from || ''}
            onChange={(e) => updateField('from', e.target.value)}
            placeholder="Delhi (DEL)"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Arrival (To)</label>
          <input
            type="text"
            value={flightData.to || ''}
            onChange={(e) => updateField('to', e.target.value)}
            placeholder="Chandigarh (IXC) / Kullu"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Travel Date</label>
          <input
            type="date"
            value={flightData.date || defaultDate}
            onChange={(e) => updateField('date', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Preferred Airline</label>
          <select
            value={flightData.airline || 'ALL'}
            onChange={(e) => updateField('airline', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Airlines (Best Fare)</option>
            <option value="IndiGo">IndiGo</option>
            <option value="Air India">Air India</option>
            <option value="Vistara">Vistara</option>
            <option value="Akasa Air">Akasa Air</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Cabin Class</label>
          <select
            value={flightData.classType || 'Economy'}
            onChange={(e) => updateField('classType', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer"
          >
            <option value="Economy">Economy</option>
            <option value="Premium Economy">Premium Economy</option>
            <option value="Business">Business</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Baggage Allowance</label>
          <input
            type="text"
            value={flightData.baggage || '15 kg Check-in, 7 kg Cabin'}
            onChange={(e) => updateField('baggage', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Passengers</label>
          <input
            type="number"
            min={1}
            value={flightData.passengers || 2}
            onChange={(e) => updateField('passengers', Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isSearching ? 'Querying Flights API...' : 'Search Flights'}</span>
          </button>
        </div>
      </div>

      {/* Search Results Dropdown/Listing */}
      {searchResults && (
        <div className="bg-white rounded-xl p-3 border border-blue-300 shadow-sm space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">
              Live Available Flights ({searchResults.length} options found)
            </span>
            <button
              type="button"
              onClick={() => setSearchResults(null)}
              className="text-[11px] text-slate-400 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {searchResults.map((flight) => (
              <div
                key={flight.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                    {flight.airlineCode || 'FL'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{flight.airline}</span>
                      <span className="text-[11px] text-slate-500 font-mono">({flight.flightNo})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{flight.departureTime} → {flight.arrivalTime}</span>
                      <span>•</span>
                      <span>{flight.duration}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">{flight.stops}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 block text-xs">
                      ₹{flight.totalPrice?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400">incl. ₹{flight.taxes} taxes</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectFlight(flight)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer shadow-2xs"
                  >
                    Select Flight
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Flight Card */}
      {selected && (
        <div className="bg-white rounded-xl p-3.5 border border-emerald-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-900">Selected Itinerary Flight</span>
            </div>
            <button
              type="button"
              onClick={() => handleCheckAvailability(selected.id)}
              disabled={checkingAvailability}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>{checkingAvailability ? 'Checking live seat GDS...' : 'Check Availability'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-emerald-50/40 rounded-lg border border-emerald-100 text-xs">
            <div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>{selected.airline}</span>
                <span className="text-slate-500 font-mono text-xs">{selected.flightNo}</span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                {selected.from} → {selected.to} • {selected.departureTime} - {selected.arrivalTime} ({selected.duration || '1h 15m'})
              </p>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200">
              <span className="text-[10px] text-slate-500 block">Total Live Cost</span>
              <span className="text-sm font-extrabold text-emerald-800">
                ₹{selected.totalPrice?.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block">(Base ₹{selected.basePrice} + Tax ₹{selected.taxes})</span>
            </div>
          </div>

          {/* Availability response toast */}
          {availabilityStatus && (
            <div className="p-2.5 rounded-lg bg-emerald-100/90 text-emerald-900 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{availabilityStatus.message} Live flight connector status: OK.</span>
            </div>
          )}
        </div>
      )}

      {/* Customer Customization Rules */}
      <div className="pt-2 border-t border-slate-200/80">
        <button
          type="button"
          onClick={() => setShowAdvancedRules(!showAdvancedRules)}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-blue-600 cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Customer Flight Customization Controls</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedRules ? 'rotate-180' : ''}`} />
        </button>

        {showAdvancedRules && (
          <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs animate-fadeIn">
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={flightData.rules?.allowCustomerChange ?? true}
                onChange={(e) => updateRule('allowCustomerChange', e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span>Allow Customer to Change Flight</span>
            </label>

            <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={flightData.rules?.allowAirlineChange ?? true}
                onChange={(e) => updateRule('allowAirlineChange', e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span>Allow Airline Change</span>
            </label>

            <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={flightData.rules?.allowTimeChange ?? true}
                onChange={(e) => updateRule('allowTimeChange', e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span>Allow Timing Change</span>
            </label>

            <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={flightData.rules?.allowClassUpgrade ?? true}
                onChange={(e) => updateRule('allowClassUpgrade', e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span>Allow Class Upgrade</span>
            </label>

            <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={flightData.rules?.allowRouteChange ?? false}
                onChange={(e) => updateRule('allowRouteChange', e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span>Allow Route Change</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
