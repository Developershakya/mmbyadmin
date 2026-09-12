import React, { useMemo } from 'react';
import {
  DollarSign,
  Calculator,
  ShieldCheck,
  Plane,
  Hotel,
  Car,
  Bus,
  Camera,
  Compass,
  Utensils,
  ArrowRight,
  TrendingUp,
  Tag,
  Percent
} from 'lucide-react';

export default function PackagePricing({
  packageData,
  onChange,
  onNext,
  onPrev
}) {
  const days = packageData.days || [];

  // Live service breakdown calculation
  const calculatedCosts = useMemo(() => {
    let flightCost = 0;
    let hotelCost = 0;
    let cabCost = 0;
    let busCost = 0;
    let sightseeingCost = 0;
    let activityCost = 0;
    let mealCost = 0;

    days.forEach((day) => {
      const s = day.services || {};

      // Flights
      if (s.flight?.enabled && s.flight.selectedFlight) {
        flightCost += Number(s.flight.selectedFlight.totalPrice) || 0;
      }

      // Hotels
      if (s.hotel?.enabled && s.hotel.selectedHotel) {
        hotelCost += Number(s.hotel.selectedHotel.pricePerNight) || 0;
      }

      // Cabs
      if (s.cab?.enabled && s.cab.selectedCab) {
        cabCost += Number(s.cab.selectedCab.totalPrice) || 0;
      }

      // Buses
      if (s.bus?.enabled && s.bus.selectedBus) {
        busCost += Number(s.bus.selectedBus.price) || 0;
      }

      // Sightseeing ticket fees
      if (s.sightseeing?.enabled && Array.isArray(s.sightseeing.items)) {
        s.sightseeing.items.forEach((item) => {
          sightseeingCost += Number(item.ticketPrice) || 0;
        });
      }

      // Activities
      if (s.activity?.enabled && Array.isArray(s.activity.items)) {
        s.activity.items.forEach((item) => {
          if (item.isIncluded) {
            activityCost += Number(item.price) || 0;
          }
        });
      }

      // Meals
      if (s.meal?.enabled && Array.isArray(s.meal.items)) {
        s.meal.items.forEach((item) => {
          if (item.isIncluded) {
            mealCost += Number(item.price) || 0;
          }
        });
      }
    });

    const subtotal = flightCost + hotelCost + cabCost + busCost + sightseeingCost + activityCost + mealCost;
    return {
      flightCost,
      hotelCost,
      cabCost,
      busCost,
      sightseeingCost,
      activityCost,
      mealCost,
      subtotal
    };
  }, [days]);

  const pricing = packageData.pricing || {};
  const currentMarkup = Number(pricing.markup) || 2500;
  const currentDiscount = Number(pricing.discount) || 1500;
  const currentTaxes = Math.round(calculatedCosts.subtotal * 0.05); // 5% GST on tour packages
  const finalCalculatedPrice = calculatedCosts.subtotal + currentTaxes + currentMarkup - currentDiscount;

  const updatePricing = (field, value) => {
    onChange({
      ...packageData,
      pricing: {
        ...pricing,
        [field]: Number(value) || 0
      }
    });
  };

  const updateCustomizationRule = (serviceKey, isCustomizable) => {
    onChange({
      ...packageData,
      servicesConfig: {
        ...(packageData.servicesConfig || {}),
        [serviceKey]: {
          ...(packageData.servicesConfig?.[serviceKey] || { enabled: true }),
          customizable: isCustomizable
        }
      }
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Live Price Calculation System */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F97316]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Dynamic Package Price Calculation</h2>
              <p className="text-xs text-slate-500">
                Calculated live from services configured across all {days.length} days of this itinerary.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Starting From Price
            </span>
            <span className="text-2xl font-black text-slate-900">
              ₹{finalCalculatedPrice?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Flight', cost: calculatedCosts.flightCost, icon: Plane, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Hotel Stays', cost: calculatedCosts.hotelCost, icon: Hotel, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Cabs', cost: calculatedCosts.cabCost, icon: Car, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Bus', cost: calculatedCosts.busCost, icon: Bus, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Sightseeing', cost: calculatedCosts.sightseeingCost, icon: Camera, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'Activities', cost: calculatedCosts.activityCost, icon: Compass, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Meals', cost: calculatedCosts.mealCost, icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-50' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                <div className={`w-7 h-7 mx-auto rounded-lg ${item.bg} flex items-center justify-center ${item.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 block truncate">{item.label}</span>
                <span className="text-xs font-black text-slate-900 block">
                  ₹{item.cost?.toLocaleString('en-IN')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Pricing Adjustments Equation */}
        <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">Service Subtotal</span>
            <span className="text-base font-extrabold text-slate-800">
              ₹{calculatedCosts.subtotal?.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Estimated Taxes (5% GST)</label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={currentTaxes}
                readOnly
                className="w-full pl-6 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Company Markup / Margin (₹)</label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={currentMarkup}
                onChange={(e) => updatePricing('markup', e.target.value)}
                className="w-full pl-6 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Promotional Discount (₹)</label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={currentDiscount}
                onChange={(e) => updatePricing('discount', e.target.value)}
                className="w-full pl-6 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Customer Customization Rules Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Customer Customization Governance Rules</h2>
            <p className="text-xs text-slate-500">
              Define which parts of the package the customer can swap or upgrade when booking online.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Current Package Status</th>
                <th className="py-3 px-4">Customer Customization</th>
                <th className="py-3 px-4">Customer Experience Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { key: 'flight', name: 'Flight Service', desc: 'Customer can search alternate airlines, timings, or cabin class' },
                { key: 'hotel', name: 'Hotel & Stays', desc: 'Customer can pick alternate hotels matching category rules or upgrade' },
                { key: 'cab', name: 'Private Cabs', desc: 'Customer can upgrade vehicle from Sedan to Innova Crysta or Tempo' },
                { key: 'bus', name: 'Bus / Volvo', desc: 'Customer can change boarding stops or sleeper seat preference' },
                { key: 'sightseeing', name: 'Sightseeing Tours', desc: 'Customer can add or uncheck optional sightseeing spots' },
                { key: 'activity', name: 'Adventure Activities', desc: 'Customer can add optional paragliding, rafting, or skiing passes' },
                { key: 'meal', name: 'Curated Meals', desc: 'Customer can select meal plan (CP, MAP, AP) or special cuisine' }
              ].map((svc) => {
                const config = packageData.servicesConfig?.[svc.key] || { enabled: true, customizable: false };
                return (
                  <tr key={svc.key} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{svc.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        config.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {config.enabled ? 'Enabled in Itinerary' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => updateCustomizationRule(svc.key, !config.customizable)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                          config.customizable
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {config.customizable ? 'Customizable: ON' : 'Locked / Fixed: OFF'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{svc.desc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
        >
          ← Back to Itinerary Builder
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
        >
          <span>Preview as Customer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
