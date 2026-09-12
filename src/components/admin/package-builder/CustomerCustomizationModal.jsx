import React, { useState } from 'react';
import {
  X,
  Plane,
  Hotel,
  Car,
  Camera,
  Compass,
  Utensils,
  Check,
  Star,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { mockFlights } from '../../../lib/mock/mockFlights.js';
import { mockHotels } from '../../../lib/mock/mockHotels.js';
import { mockCabs } from '../../../lib/mock/mockCabs.js';
import { mockActivities } from '../../../lib/mock/mockActivities.js';
import { mockMeals } from '../../../lib/mock/mockMeals.js';

export default function CustomerCustomizationModal({
  isOpen,
  onClose,
  serviceType,
  dayNumber,
  currentService,
  onApplyServiceChange
}) {
  const [selectedOption, setSelectedOption] = useState(null);

  if (!isOpen) return null;

  const handleSelect = (item) => {
    setSelectedOption(item);
  };

  const handleApply = () => {
    if (!selectedOption) {
      onClose();
      return;
    }

    onApplyServiceChange(serviceType, dayNumber, selectedOption);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center font-bold">
              {serviceType === 'flight' && <Plane className="w-5 h-5" />}
              {serviceType === 'hotel' && <Hotel className="w-5 h-5" />}
              {serviceType === 'cab' && <Car className="w-5 h-5" />}
              {serviceType === 'activity' && <Compass className="w-5 h-5" />}
              {serviceType === 'meal' && <Utensils className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 capitalize">
                Customize {serviceType} for Day {dayNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Pick your preferred airline, hotel room upgrade, or cab model. Live price updates instantly.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content depending on serviceType */}
        <div className="p-5 max-h-96 overflow-y-auto space-y-3">
          {/* FLIGHT OPTIONS */}
          {serviceType === 'flight' && (
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-700 block">Available Airline Flights for Day {dayNumber}:</span>
              {mockFlights.slice(0, 4).map((fl) => {
                const isCurrent = currentService?.selectedFlight?.id === fl.id;
                const isSelected = selectedOption?.id === fl.id || (!selectedOption && isCurrent);

                return (
                  <div
                    key={fl.id}
                    onClick={() => handleSelect(fl)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {fl.airlineCode}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                          <span>{fl.airline}</span>
                          <span className="text-slate-400 font-mono text-[11px]">({fl.flightNo})</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">Current</span>
                          )}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {fl.departureTime} → {fl.arrivalTime} • {fl.duration} • {fl.classType}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-extrabold text-slate-900 text-xs block">
                          ₹{fl.totalPrice?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400">Total fare</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* HOTEL OPTIONS */}
          {serviceType === 'hotel' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">Select Hotel & Stays:</span>
              {mockHotels.slice(0, 4).map((htl) => {
                const isCurrent = currentService?.selectedHotel?.id === htl.id;
                const isSelected = selectedOption?.id === htl.id || (!selectedOption && isCurrent);

                return (
                  <div
                    key={htl.id}
                    onClick={() => handleSelect(htl)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img
                      src={htl.image}
                      alt={htl.name}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs truncate">{htl.name}</span>
                          <span className="text-[10px] font-bold text-amber-600 flex items-center">
                            <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                            {htl.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">{htl.roomType} • {htl.mealPlan}</span>
                      </div>

                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                        <span className="font-extrabold text-slate-900 text-xs">
                          ₹{htl.pricePerNight?.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-400">/night</span>
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CAB OPTIONS */}
          {serviceType === 'cab' && (
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-700 block">Select Cab Category:</span>
              {mockCabs.map((cb) => {
                const isCurrent = currentService?.selectedCab?.id === cb.id;
                const isSelected = selectedOption?.id === cb.id || (!selectedOption && isCurrent);

                return (
                  <div
                    key={cb.id}
                    onClick={() => handleSelect(cb)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/40 ring-1 ring-purple-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{cb.name}</span>
                      <span className="text-[11px] text-slate-500 block">{cb.capacity} • Chauffeur Included</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-900 text-xs">
                        ₹{cb.totalPrice?.toLocaleString('en-IN')}
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ACTIVITY / MEAL OPTIONS */}
          {serviceType === 'activity' && (
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-700 block">Add or Upgrade Activity:</span>
              {mockActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => handleSelect(act)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{act.name}</span>
                    <span className="text-[11px] text-slate-500">{act.duration} • {act.description}</span>
                  </div>
                  <span className="font-bold text-indigo-700">₹{act.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 text-xs font-bold text-white bg-[#F97316] hover:bg-orange-600 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Update Price</span>
          </button>
        </div>
      </div>
    </div>
  );
}
