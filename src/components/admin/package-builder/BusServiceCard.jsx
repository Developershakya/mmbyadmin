import React, { useState } from 'react';
import {
  Bus,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star
} from 'lucide-react';
import { searchBuses } from '../../../lib/api/buses.js';

export default function BusServiceCard({
  busData = {},
  onChange,
  defaultDate = ''
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const updateField = (field, value) => {
    onChange({
      ...busData,
      [field]: value
    });
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchResults(null);

    try {
      const res = await searchBuses({
        from: busData.from || 'Delhi Kashmiri Gate',
        to: busData.to || 'Manali Private Bus Stand',
        busType: busData.busType || 'ALL',
        date: busData.date || defaultDate
      });
      setSearchResults(res.buses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBus = (bus) => {
    onChange({
      ...busData,
      selectedBus: {
        id: bus.id,
        operator: bus.operator,
        busType: bus.busType,
        from: bus.from,
        to: bus.to,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        duration: bus.duration,
        price: bus.price,
        seatType: bus.seatType
      }
    });
    setSearchResults(null);
  };

  const selected = busData.selectedBus;

  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 md:p-5 border border-amber-200/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Bus className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">Intercity Bus / Volvo Sleeper</span>
            <span className="text-[11px] text-slate-500">Overnight luxury AC sleeper coach transport</span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          Volvo Coach
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Boarding From</label>
          <input
            type="text"
            value={busData.from || ''}
            onChange={(e) => updateField('from', e.target.value)}
            placeholder="e.g. Delhi Kashmiri Gate"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Dropping At</label>
          <input
            type="text"
            value={busData.to || ''}
            onChange={(e) => updateField('to', e.target.value)}
            placeholder="e.g. Manali Private Bus Stand"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Bus Coach Type</label>
          <select
            value={busData.busType || 'AC Sleeper'}
            onChange={(e) => updateField('busType', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer"
          >
            <option value="AC Sleeper">AC Sleeper (2+1)</option>
            <option value="Multi-Axle">Multi-Axle Luxury Sleeper</option>
            <option value="Semi-Sleeper">AC Semi-Sleeper (2+2)</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isSearching ? 'Searching Buses...' : 'Search Buses'}</span>
          </button>
        </div>
      </div>

      {searchResults && (
        <div className="bg-white rounded-xl p-3 border border-amber-300 shadow-sm space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">
              Available Sleeper Coaches ({searchResults.length})
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
            {searchResults.map((bus) => (
              <div
                key={bus.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{bus.operator}</span>
                  <span className="text-[11px] text-slate-500 block">
                    {bus.busType} • {bus.departureTime} → {bus.arrivalTime} ({bus.duration})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900 text-xs">
                    ₹{bus.price?.toLocaleString('en-IN')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectBus(bus)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] cursor-pointer"
                  >
                    Select Bus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            <div>
              <span className="font-bold text-slate-900 text-xs block">{selected.operator}</span>
              <span className="text-[11px] text-slate-500 block">
                {selected.from} → {selected.to} • {selected.departureTime} ({selected.duration})
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-extrabold text-amber-800 block">
              ₹{selected.price?.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400">{selected.seatType}</span>
          </div>
        </div>
      )}
    </div>
  );
}
