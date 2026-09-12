import React, { useState } from 'react';
import {
  Car,
  Search,
  CheckCircle2,
  Users,
  Luggage,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { searchCabs } from '../../../lib/api/cabs.js';

export default function CabServiceCard({
  cabData = {},
  onChange,
  defaultDate = ''
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const updateField = (field, value) => {
    onChange({
      ...cabData,
      [field]: value
    });
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchResults(null);

    try {
      const res = await searchCabs({
        pickup: cabData.pickup || 'Delhi Airport / Station',
        drop: cabData.drop || 'Manali Resort',
        cabType: cabData.cabType || 'ALL',
        date: cabData.date || defaultDate,
        passengers: cabData.passengers || 2
      });
      setSearchResults(res.cabs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCab = (cab) => {
    onChange({
      ...cabData,
      cabType: cab.name,
      selectedCab: {
        id: cab.id,
        name: cab.name,
        type: cab.type,
        capacity: cab.capacity,
        basePrice: cab.basePrice,
        tollTax: cab.tollTax,
        totalPrice: cab.totalPrice,
        driverAllowance: cab.driverAllowance,
        image: cab.image
      }
    });
    setSearchResults(null);
  };

  const selected = cabData.selectedCab;

  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 md:p-5 border border-purple-200/80 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">Cab & Private Chauffeured Transfers</span>
            <span className="text-[11px] text-slate-500">Pick-up, drop, intercity highway drive & local mountain transit</span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          Chauffeured Cab
        </span>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Pick-up Location</label>
          <input
            type="text"
            value={cabData.pickup || ''}
            onChange={(e) => updateField('pickup', e.target.value)}
            placeholder="e.g. Chandigarh Airport (IXC)"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Drop Location</label>
          <input
            type="text"
            value={cabData.drop || ''}
            onChange={(e) => updateField('drop', e.target.value)}
            placeholder="e.g. Manali Resort"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Pick-up Time</label>
          <input
            type="text"
            value={cabData.time || '08:00 AM'}
            onChange={(e) => updateField('time', e.target.value)}
            placeholder="08:00 AM"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Cab Category</label>
          <select
            value={cabData.cabType || 'Sedan'}
            onChange={(e) => updateField('cabType', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer"
          >
            <option value="Sedan">Sedan (Dzire / Etios)</option>
            <option value="SUV">SUV (Innova / Ertiga)</option>
            <option value="Tempo Traveller">Tempo Traveller (12-16 seater)</option>
            <option value="Luxury SUV">Luxury SUV (Fortuner 4x4)</option>
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Transfer Date</label>
          <input
            type="date"
            value={cabData.date || defaultDate}
            onChange={(e) => updateField('date', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isSearching ? 'Checking Fleet...' : 'Search Available Cabs'}</span>
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="bg-white rounded-xl p-3 border border-purple-300 shadow-sm space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">
              Verified Chauffeur Vehicles ({searchResults.length})
            </span>
            <button
              type="button"
              onClick={() => setSearchResults(null)}
              className="text-[11px] text-slate-400 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
            {searchResults.map((cab) => (
              <div
                key={cab.id}
                className="p-3 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/30 transition-all bg-white text-xs flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-slate-900 block text-xs">{cab.name}</span>
                  <span className="text-[11px] text-slate-500 block">{cab.capacity}</span>
                  <span className="text-[10px] text-purple-700 font-semibold block mt-0.5">
                    Driver Allowance & Toll: {cab.driverAllowance}
                  </span>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <span className="font-extrabold text-slate-900 text-xs">
                    ₹{cab.totalPrice?.toLocaleString('en-IN')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectCab(cab)}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                  >
                    Select Cab
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Cab */}
      {selected && (
        <div className="bg-white rounded-xl p-3.5 border border-purple-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs block">{selected.name}</span>
              <span className="text-[11px] text-slate-500 block">
                {cabData.pickup || 'Pick-up point'} → {cabData.drop || 'Drop point'} • at {cabData.time || '08:00 AM'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-extrabold text-purple-800 block">
              ₹{selected.totalPrice?.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400">All tolls & driver included</span>
          </div>
        </div>
      )}
    </div>
  );
}
