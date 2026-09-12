import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Calendar,
  Moon,
  Star,
  CheckCircle2,
  Plane,
  Hotel,
  Car,
  Bus,
  Camera,
  Compass,
  Utensils,
  Sparkles,
  Sliders,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import CustomerCustomizationModal from './CustomerCustomizationModal.jsx';

export default function PackagePreview({
  packageData,
  onChangePackage,
  onNext,
  onPrev
}) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    serviceType: null,
    dayNumber: 1,
    currentService: null
  });

  const days = packageData.days || [];
  const servicesConfig = packageData.servicesConfig || {};

  // Calculate dynamic live total price
  const customerTotal = useMemo(() => {
    let subtotal = 0;
    days.forEach((day) => {
      const s = day.services || {};
      if (s.flight?.enabled && s.flight.selectedFlight) subtotal += Number(s.flight.selectedFlight.totalPrice) || 0;
      if (s.hotel?.enabled && s.hotel.selectedHotel) subtotal += Number(s.hotel.selectedHotel.pricePerNight) || 0;
      if (s.cab?.enabled && s.cab.selectedCab) subtotal += Number(s.cab.selectedCab.totalPrice) || 0;
      if (s.bus?.enabled && s.bus.selectedBus) subtotal += Number(s.bus.selectedBus.price) || 0;
      if (s.sightseeing?.enabled && Array.isArray(s.sightseeing.items)) {
        s.sightseeing.items.forEach(i => subtotal += Number(i.ticketPrice) || 0);
      }
      if (s.activity?.enabled && Array.isArray(s.activity.items)) {
        s.activity.items.forEach(i => { if (i.isIncluded) subtotal += Number(i.price) || 0; });
      }
      if (s.meal?.enabled && Array.isArray(s.meal.items)) {
        s.meal.items.forEach(i => { if (i.isIncluded) subtotal += Number(i.price) || 0; });
      }
    });

    const tax = Math.round(subtotal * 0.05);
    const markup = Number(packageData.pricing?.markup) || 2500;
    const discount = Number(packageData.pricing?.discount) || 1500;
    return subtotal + tax + markup - discount;
  }, [days, packageData.pricing]);

  const handleOpenCustomization = (serviceType, dayNumber, currentService) => {
    setModalState({
      isOpen: true,
      serviceType,
      dayNumber,
      currentService
    });
  };

  const handleApplyCustomization = (serviceType, dayNumber, selectedOption) => {
    const dayIndex = days.findIndex(d => (d.dayNumber || 1) === dayNumber);
    if (dayIndex === -1) return;

    const targetDay = JSON.parse(JSON.stringify(days[dayIndex]));

    if (serviceType === 'flight') {
      targetDay.services.flight.selectedFlight = selectedOption;
      targetDay.services.flight.airline = selectedOption.airline;
    } else if (serviceType === 'hotel') {
      targetDay.services.hotel.selectedHotel = selectedOption;
      targetDay.services.hotel.hotelName = selectedOption.name;
    } else if (serviceType === 'cab') {
      targetDay.services.cab.selectedCab = selectedOption;
      targetDay.services.cab.cabType = selectedOption.name;
    }

    const updatedDays = [...days];
    updatedDays[dayIndex] = targetDay;

    onChangePackage({
      ...packageData,
      days: updatedDays
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Customer Preview Notice Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-[#F97316] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block">Live Customer Brochure & Customization Simulator</span>
            <span className="text-[11px] text-slate-400">
              Click any orange "[Change]" button to simulate customer booking choices and live price updates.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Simulated Booking Total:</span>
          <span className="text-base font-black text-[#F97316]">₹{customerTotal?.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Hero Package Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="relative h-72 sm:h-80 w-full">
          <img
            src={packageData.heroImage || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80'}
            alt={packageData.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-between p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#F97316] text-white font-bold text-xs shadow-xs">
                {packageData.packageType || 'Customizable'} Package
              </span>
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>4.8 (120+ Verified Reviews)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-white/90 text-xs font-medium mb-1">
                <MapPin className="w-4 h-4 text-[#F97316]" />
                <span>{packageData.destination || 'Manali, Himachal Pradesh'}</span>
                <span>•</span>
                <span>Starting from {packageData.startCity || 'Delhi'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{packageData.name}</h1>
              <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-2xl line-clamp-2">
                {packageData.shortDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Spec Ribbon */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#F97316]" />
              <span>{packageData.duration || '3 Days'} / {packageData.nights || '2 Nights'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Hotel className="w-4 h-4 text-emerald-600" />
              <span>{packageData.hotelRules?.category || '4 Star'} Luxury Stay</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-orange-600" />
              <span>{packageData.hotelRules?.mealPlan || 'Breakfast + Dinner'}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-500">Starting from</span>
            <span className="text-2xl font-black text-slate-900">
              ₹{customerTotal?.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-400">/ person</span>
          </div>
        </div>

        {/* Key Highlights */}
        <div className="p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Package Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {(packageData.highlights || []).map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Day by Day Customer Itinerary Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Detailed Day-by-Day Itinerary</h2>
          <span className="text-xs text-slate-500">{days.length} Days Experience</span>
        </div>

        <div className="space-y-4">
          {days.map((day, dIdx) => {
            const s = day.services || {};
            const dNum = day.dayNumber || dIdx + 1;

            return (
              <div
                key={day.id || dIdx}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
              >
                {/* Day Header */}
                <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-orange-100 text-[#F97316] font-black text-xs flex items-center justify-center">
                      D{dNum}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{day.title}</h4>
                      <span className="text-[11px] text-slate-500">{day.location}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Day Description */}
                  {day.description && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      {day.description}
                    </p>
                  )}

                  {/* Services Included in this day */}
                  <div className="space-y-3">
                    {/* FLIGHT */}
                    {s.flight?.enabled && (
                      <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Plane className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              Flight: {s.flight.selectedFlight?.airline || 'Scheduled Flight'} ({s.flight.selectedFlight?.flightNo || 'Auto-selected'})
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {s.flight.from || 'Origin'} → {s.flight.to || 'Destination'} • {s.flight.selectedFlight?.departureTime || 'Morning'}
                            </span>
                          </div>
                        </div>

                        {servicesConfig.flight?.customizable ? (
                          <button
                            type="button"
                            onClick={() => handleOpenCustomization('flight', dNum, s.flight)}
                            className="px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-orange-600 text-white font-bold text-[11px] cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Change Flight</span>
                          </button>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px]">
                            Included
                          </span>
                        )}
                      </div>
                    )}

                    {/* HOTEL */}
                    {s.hotel?.enabled && (
                      <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Hotel className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              Hotel: {s.hotel.selectedHotel?.name || s.hotel.hotelName || 'Comfort Mountain Resort'}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {s.hotel.category || '4 Star'} • {s.hotel.roomType || 'Deluxe Room'} ({s.hotel.mealPlan || 'Breakfast Included'})
                            </span>
                          </div>
                        </div>

                        {servicesConfig.hotel?.customizable ? (
                          <button
                            type="button"
                            onClick={() => handleOpenCustomization('hotel', dNum, s.hotel)}
                            className="px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-orange-600 text-white font-bold text-[11px] cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Change Hotel</span>
                          </button>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px]">
                            Included
                          </span>
                        )}
                      </div>
                    )}

                    {/* CAB */}
                    {s.cab?.enabled && (
                      <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/30 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Car className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              Transfer: {s.cab.selectedCab?.name || s.cab.cabType || 'Private Chauffeured Cab'}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {s.cab.pickup || 'Pickup'} → {s.cab.drop || 'Drop'}
                            </span>
                          </div>
                        </div>

                        {servicesConfig.cab?.customizable ? (
                          <button
                            type="button"
                            onClick={() => handleOpenCustomization('cab', dNum, s.cab)}
                            className="px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-orange-600 text-white font-bold text-[11px] cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Upgrade Cab</span>
                          </button>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px]">
                            Included
                          </span>
                        )}
                      </div>
                    )}

                    {/* SIGHTSEEING */}
                    {s.sightseeing?.enabled && s.sightseeing.items?.length > 0 && (
                      <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            <Camera className="w-4 h-4 text-rose-600" />
                            <span>Sightseeing Excursions ({s.sightseeing.items.length} Attractions)</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px]">
                            Included
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {s.sightseeing.items.map((spot, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                              <img src={spot.image} alt={spot.name} className="w-9 h-9 rounded-md object-cover" />
                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 text-[11px] block truncate">{spot.name}</span>
                                <span className="text-[10px] text-slate-400">{spot.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ACTIVITIES */}
                    {s.activity?.enabled && s.activity.items?.length > 0 && (
                      <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            <Compass className="w-4 h-4 text-indigo-600" />
                            <span>Adventure Activities</span>
                          </div>
                          {servicesConfig.activity?.customizable && (
                            <button
                              type="button"
                              onClick={() => handleOpenCustomization('activity', dNum, s.activity)}
                              className="px-2.5 py-1 rounded-md bg-[#F97316] text-white font-bold text-[10px] cursor-pointer"
                            >
                              + Add Activity
                            </button>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          {s.activity.items.map((act, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                              <span className="font-bold text-slate-800">{act.name} ({act.duration})</span>
                              <span className="font-bold text-indigo-700">₹{act.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MEALS */}
                    {s.meal?.enabled && s.meal.items?.length > 0 && (
                      <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/30 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <Utensils className="w-4 h-4 text-[#F97316]" />
                          <div>
                            <span className="font-bold text-slate-900 block">
                              Meals: {s.meal.items.map(m => m.name).join(', ')}
                            </span>
                            <span className="text-[11px] text-slate-500">Curated dining experience</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px]">
                          Included
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Customization Modal */}
      <CustomerCustomizationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        serviceType={modalState.serviceType}
        dayNumber={modalState.dayNumber}
        currentService={modalState.currentService}
        onApplyServiceChange={handleApplyCustomization}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
        >
          ← Back to Pricing & Rules
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
        >
          <span>Ready to Publish</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
