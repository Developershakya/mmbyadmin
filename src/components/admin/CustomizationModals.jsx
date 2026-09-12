import React, { useState } from 'react';
import {
  X,
  Plane,
  Hotel,
  Car,
  Compass,
  Check,
  Plus,
  Sliders,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

/**
 * Flight Customization Modal
 */
export function FlightCustomizationModal({
  isOpen,
  onClose,
  config,
  onSelectOption
}) {
  if (!isOpen || !config) return null;

  const current = config.flight.selectedOption;
  const alternatives = config.flight.alternatives || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Customize Flight Options</h3>
              <p className="text-xs text-slate-500">Select preferred airline timing and cabin class</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Flight */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Selected Flight</span>
          <div className="flex items-center justify-between mt-1">
            <div>
              <p className="font-bold text-slate-900">{current.airline} ({current.flightNo})</p>
              <p className="text-slate-500">{current.time} • {current.class} • {current.baggage}</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Current
            </span>
          </div>
        </div>

        {/* Available Alternatives */}
        <div className="mt-5 space-y-3">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Available Flight Alternatives</p>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {alternatives.map((alt) => {
              const isSelected = current.flightNo === alt.flightNo;
              return (
                <div
                  key={alt.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900">{alt.airline}</p>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                        {alt.flightNo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{alt.time} • {alt.class}</p>
                    <p className="text-[11px] text-slate-400">{alt.desc}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">
                      {alt.priceDiff === 0 ? 'Included' : `+₹${alt.priceDiff.toLocaleString('en-IN')}`}
                    </p>
                    <button
                      type="button"
                      disabled={isSelected}
                      onClick={() => {
                        onSelectOption('flight', {
                          airline: alt.airline.replace(' (Default)', ''),
                          flightNo: alt.flightNo,
                          time: alt.time,
                          class: alt.class,
                          baggage: alt.class.includes('Business') ? '30 kg Check-in' : '15 kg Check-in',
                          priceDiff: alt.priceDiff
                        });
                        onClose();
                      }}
                      className={`mt-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-[#F97316] text-white hover:bg-orange-600'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hotel Customization Modal
 */
export function HotelCustomizationModal({
  isOpen,
  onClose,
  config,
  onSelectOption
}) {
  if (!isOpen || !config) return null;

  const current = config.hotel.selectedOption;
  const alternatives = config.hotel.alternatives || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Customize Hotel & Stay</h3>
              <p className="text-xs text-slate-500">Select room category, star rating, or upgrade</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Hotel */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Selected Stay</span>
          <div className="flex items-center justify-between mt-1">
            <div>
              <p className="font-bold text-slate-900">{current.name}</p>
              <p className="text-slate-500">{current.room} • {current.rating} • {current.mealPlan}</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Current
            </span>
          </div>
        </div>

        {/* Available Alternatives */}
        <div className="mt-5 space-y-3">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Available Hotel Options</p>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {alternatives.map((alt) => {
              const isSelected = current.name.includes(alt.name.split(' (')[0]);
              return (
                <div
                  key={alt.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center gap-3.5 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <img
                    src={alt.image}
                    alt={alt.name}
                    className="w-16 h-16 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{alt.name}</p>
                    <p className="text-xs text-slate-500">{alt.rating} • {alt.room}</p>
                    <p className="text-[11px] text-slate-400">{alt.mealPlan}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-800">
                      {alt.priceDiff === 0 ? 'Included' : `+₹${alt.priceDiff.toLocaleString('en-IN')}`}
                    </p>
                    <button
                      type="button"
                      disabled={isSelected}
                      onClick={() => {
                        onSelectOption('hotel', {
                          name: alt.name.replace(' (Standard)', ''),
                          rating: alt.rating,
                          room: alt.room,
                          mealPlan: alt.mealPlan,
                          priceDiff: alt.priceDiff
                        });
                        onClose();
                      }}
                      className={`mt-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-[#F97316] text-white hover:bg-orange-600'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Cab Customization Modal
 */
export function CabCustomizationModal({
  isOpen,
  onClose,
  config,
  onSelectOption
}) {
  if (!isOpen || !config) return null;

  const current = config.cab.selectedOption;
  const alternatives = config.cab.alternatives || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Customize Vehicle / Cab</h3>
              <p className="text-xs text-slate-500">Select sedan, SUV, or luxury coach transfers</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Vehicle */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Selected Vehicle</span>
          <div className="flex items-center justify-between mt-1">
            <div>
              <p className="font-bold text-slate-900">{current.vehicle}</p>
              <p className="text-slate-500">{current.type} • {current.pickup} to {current.drop}</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Current
            </span>
          </div>
        </div>

        {/* Available Alternatives */}
        <div className="mt-5 space-y-3">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Available Vehicle Categories</p>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {alternatives.map((alt) => {
              const isSelected = current.vehicle.includes(alt.vehicle.split(' (')[0]);
              return (
                <div
                  key={alt.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{alt.vehicle}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{alt.type}</p>
                    <p className="text-[11px] text-slate-400">{alt.desc}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">
                      {alt.priceDiff === 0
                        ? 'Included'
                        : alt.priceDiff > 0
                        ? `+₹${alt.priceDiff.toLocaleString('en-IN')}`
                        : `-₹${Math.abs(alt.priceDiff).toLocaleString('en-IN')}`}
                    </p>
                    <button
                      type="button"
                      disabled={isSelected}
                      onClick={() => {
                        onSelectOption('cab', {
                          vehicle: alt.vehicle.replace(' (Included)', ''),
                          type: alt.type,
                          pickup: 'Port Blair Airport',
                          drop: 'Hotel & Sightseeing',
                          priceDiff: alt.priceDiff
                        });
                        onClose();
                      }}
                      className={`mt-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-[#F97316] text-white hover:bg-orange-600'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Sightseeing Customization Modal
 */
export function SightseeingCustomizationModal({
  isOpen,
  onClose,
  config,
  onToggleActivity
}) {
  if (!isOpen || !config) return null;

  const included = config.sightseeing.included || [];
  const optional = config.sightseeing.optionalActivities || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Configure Sightseeing & Tours</h3>
              <p className="text-xs text-slate-500">Manage included spots and optional excursions</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Included Sightseeing */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
            Standard Included Sightseeing
          </span>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {included.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Optional Add-on Activities */}
        <div className="mt-5 space-y-3">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Optional Add-on Adventure Activities
          </p>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {optional.map((act) => (
              <div
                key={act.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  act.selected
                    ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">{act.name}</p>
                  <p className="text-[11px] text-slate-500">{act.location}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-orange-600">
                    +₹{act.price.toLocaleString('en-IN')}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleActivity(act.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      act.selected
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {act.selected ? 'Added ✓' : '+ Add'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 cursor-pointer"
          >
            Save Excursions
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Customization Rules Modal (When Admin clicks "Edit" on service rules)
 */
export function CustomizationRulesModal({
  isOpen,
  onClose,
  serviceName = 'Flight',
  initialRules = {},
  onSaveRules
}) {
  const [rules, setRules] = useState({
    allowChange: true,
    allowReplacement: true,
    allowUpgrade: true,
    allowDowngrade: false,
    additionalCharge: 250,
    maxPriceDiff: 15000,
    availabilityRequired: true,
    ...initialRules
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-slate-900">{serviceName} Customization Rules</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs text-slate-700">
          {/* Toggles */}
          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <span className="font-semibold">Allow Customer Selection Change</span>
            <input
              type="checkbox"
              checked={rules.allowChange}
              onChange={(e) => setRules({ ...rules, allowChange: e.target.checked })}
              className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <span className="font-semibold">Allow Service Replacement</span>
            <input
              type="checkbox"
              checked={rules.allowReplacement}
              onChange={(e) => setRules({ ...rules, allowReplacement: e.target.checked })}
              className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <span className="font-semibold">Allow Upgrade (Higher Tier / Class)</span>
            <input
              type="checkbox"
              checked={rules.allowUpgrade}
              onChange={(e) => setRules({ ...rules, allowUpgrade: e.target.checked })}
              className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <span className="font-semibold">Allow Downgrade (Lower Tier / Economy)</span>
            <input
              type="checkbox"
              checked={rules.allowDowngrade}
              onChange={(e) => setRules({ ...rules, allowDowngrade: e.target.checked })}
              className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
            />
          </label>

          {/* Numeric fields */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Admin Convenience Charge (₹)
              </label>
              <input
                type="number"
                value={rules.additionalCharge}
                onChange={(e) => setRules({ ...rules, additionalCharge: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Max Allowed Price Diff (₹)
              </label>
              <input
                type="number"
                value={rules.maxPriceDiff}
                onChange={(e) => setRules({ ...rules, maxPriceDiff: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSaveRules(rules);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white text-xs font-semibold cursor-pointer shadow-2xs"
          >
            Save Rules
          </button>
        </div>
      </div>
    </div>
  );
}
