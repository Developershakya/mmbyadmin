import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { fetchFareCalendarApi } from '../../lib/packageBuilder/searchApi.js';

const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

export default function FareCalendarStrip({
  origin,
  destination,
  selectedDate,
  onSelectDate,
  cabinClass = 1
}) {
  const [calendarFares, setCalendarFares] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!origin || !destination || !selectedDate) return;

    let isMounted = true;
    const loadFares = async () => {
      setLoading(true);
      try {
        const res = await fetchFareCalendarApi({
          origin,
          destination,
          departureDate: selectedDate,
          flightCabinClass: cabinClass
        });

        if (!isMounted) return;

        const rawList = res?.SearchResults || res?.data?.SearchResults || res?.fares || [];
        if (Array.isArray(rawList) && rawList.length > 0) {
          // Find lowest fare in the set
          const minFare = Math.min(...rawList.map((f) => Number(f.TotalFare || f.fare || 999999)));
          const formatted = rawList
            .filter((f) => f && (f.TotalFare || f.fare))
            .map((f) => {
              const dStr = f.DepartureDate ? f.DepartureDate.split('T')[0] : '';
              const fareVal = Number(f.TotalFare || f.fare || 0);
              return {
                date: dStr,
                fare: fareVal,
                airline: f.AirlineCode || '6E',
                isLowest: fareVal > 0 && fareVal === minFare
              };
            })
            .filter((f) => f.date);
          setCalendarFares(formatted);
        } else {
          setCalendarFares([]);
        }
      } catch (err) {
        // As per specification: If API fails, hide silently without mock data
        if (isMounted) {
          setCalendarFares([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFares();

    return () => {
      isMounted = false;
    };
  }, [origin, destination, selectedDate, cabinClass]);

  const formatDateLabel = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      return { dayName, dateFormatted: `${dayNum} ${month}` };
    } catch {
      return { dayName: 'Day', dateFormatted: dateStr };
    }
  };

  if (!calendarFares.length && !loading) return null;

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
      <div className="flex items-center justify-between text-xs px-1 text-slate-500">
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Fare Calendar (Lowest Fares Around Date)</span>
        </span>
        {loading && (
          <span className="flex items-center gap-1 text-blue-600 text-[11px]">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading fares...
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {calendarFares.map((item) => {
          const isSelected = item.date === selectedDate;
          const { dayName, dateFormatted } = formatDateLabel(item.date);

          return (
            <button
              key={item.date}
              type="button"
              onClick={() => onSelectDate(item.date)}
              className={`shrink-0 px-3 py-2 rounded-xl text-center transition cursor-pointer relative min-w-[90px] border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              {item.isLowest && (
                <span
                  className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    isSelected ? 'bg-amber-400 text-slate-900' : 'bg-emerald-600 text-white'
                  }`}
                >
                  Lowest
                </span>
              )}
              <div className={`text-[10px] font-medium ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                {dayName}, {dateFormatted}
              </div>
              <div className={`text-xs font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                {inr(item.fare)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
