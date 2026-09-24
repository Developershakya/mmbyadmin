import React from 'react';
import {
  Plus,
  Calendar,
  Layers,
  Sparkles,
  MapPin,
  ArrowRight,
  Info
} from 'lucide-react';
import DayCard from './DayCard.jsx';

export default function ItineraryBuilder({
  packageData,
  onChange,
  onNext,
  onPrev
}) {
  const days = packageData.days || [];

  const handleUpdateDay = (index, updatedDay) => {
    const updated = [...days];
    updated[index] = updatedDay;
    onChange({
      ...packageData,
      days: updated
    });
  };

  const handleAddDay = () => {
    const newDayNumber = days.length + 1;
    const destination = packageData.destination || 'Manali';

    const newDay = {
      id: `day-${Date.now()}`,
      dayNumber: newDayNumber,
      title: `Day ${newDayNumber} — Exploration in ${destination}`,
      location: destination,
      description: `Enjoy a full day exploring local mountain attractions, cultural heritage, and scenic vistas in ${destination}.`,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80',
      services: {
        flight: { enabled: false, customizable: false },
        hotel: {
          enabled: true,
          customizable: true,
          city: destination,
          category: packageData.hotelRules?.category || '4 Star',
          roomType: packageData.hotelRules?.roomType || 'Deluxe Mountain View',
          mealPlan: packageData.hotelRules?.mealPlan || 'Breakfast + Dinner',
          selectedHotel: {
            id: 'HTL-MNL-001',
            name: 'Hotel Snow Valley Resorts',
            city: destination,
            category: packageData.hotelRules?.category || '4 Star',
            pricePerNight: 4500,
            taxes: 540,
            totalPerNight: 5040,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80'
          }
        },
        cab: {
          enabled: true,
          customizable: false,
          pickup: 'Hotel Lobby',
          drop: 'Local Sightseeing Tour',
          cabType: 'Sedan (Maruti Dzire / Toyota Etios)',
          selectedCab: {
            id: 'CAB-SED-01',
            name: 'Sedan (Maruti Dzire / Toyota Etios)',
            type: 'Sedan',
            basePrice: 2500,
            totalPrice: 2800
          }
        },
        bus: { enabled: false, customizable: false },
        sightseeing: { enabled: true, customizable: true, items: [] },
        activity: { enabled: false, customizable: false, items: [] },
        meal: { enabled: true, customizable: true, items: [] }
      }
    };

    const updated = [...days, newDay];
    onChange({
      ...packageData,
      days: updated,
      duration: `${updated.length} Days`,
      durationDays: updated.length,
      nights: `${Math.max(1, updated.length - 1)} Nights`,
      nightsCount: Math.max(1, updated.length - 1)
    });
  };

  const handleDuplicateDay = (index) => {
    const target = days[index];
    const duplicated = JSON.parse(JSON.stringify(target));
    duplicated.id = `day-${Date.now()}`;
    duplicated.dayNumber = days.length + 1;
    duplicated.title = `${target.title} (Copy)`;

    const updated = [...days];
    updated.splice(index + 1, 0, duplicated);

    // Re-index day numbers
    const reindexed = updated.map((d, i) => ({ ...d, dayNumber: i + 1 }));

    onChange({
      ...packageData,
      days: reindexed,
      duration: `${reindexed.length} Days`,
      durationDays: reindexed.length,
      nights: `${Math.max(1, reindexed.length - 1)} Nights`,
      nightsCount: Math.max(1, reindexed.length - 1)
    });
  };

  const handleDeleteDay = (index) => {
    if (days.length <= 1) {
      alert('Package must contain at least 1 day itinerary.');
      return;
    }
    const updated = days.filter((_, i) => i !== index);
    const reindexed = updated.map((d, i) => ({ ...d, dayNumber: i + 1 }));

    onChange({
      ...packageData,
      days: reindexed,
      duration: `${reindexed.length} Days`,
      durationDays: reindexed.length,
      nights: `${Math.max(1, reindexed.length - 1)} Nights`,
      nightsCount: Math.max(1, reindexed.length - 1)
    });
  };

  const handleMoveDay = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= days.length) return;
    const updated = [...days];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    const reindexed = updated.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    onChange({
      ...packageData,
      days: reindexed
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Itinerary Action Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F97316]">
              Day-By-Day Itinerary Architecture
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              {days.length} Days Total
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">
            Configure Services & Schedules for Every Day
          </h2>
          <p className="text-xs text-slate-500">
            Add or remove services independently per day (Flight, Hotel, Cab, Sightseeing, Activities, Meals).
          </p>
        </div>

        {/* Large Add Day Button */}
        <button
          id="btn-add-itinerary-day"
          type="button"
          onClick={handleAddDay}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-[#F97316]" />
          <span>+ Add Day {days.length + 1}</span>
        </button>
      </div>

      {/* Days List */}
      <div className="space-y-5">
        {days.map((day, index) => (
          <DayCard
            key={day.id || index}
            day={day}
            dayIndex={index}
            totalDays={days.length}
            packageHotelRules={packageData.hotelRules}
            packageDestination={packageData.destination}
            onChange={(updatedDay) => handleUpdateDay(index, updatedDay)}
            onDuplicate={handleDuplicateDay}
            onDelete={handleDeleteDay}
            onMove={handleMoveDay}
          />
        ))}
      </div>

      {/* Large Bottom Add Day Trigger */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={handleAddDay}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#F97316] bg-white hover:bg-orange-50/20 text-slate-600 hover:text-[#F97316] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Day (Day {days.length + 1})</span>
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
        >
          ← Back to Package Info
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
        >
          <span>Continue to Pricing & Rules</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
