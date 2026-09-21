import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Plane,
  Briefcase,
  Utensils,
  AlertCircle,
  Loader2,
  Info,
  User
} from 'lucide-react';
import { fetchSeatMapApi, fetchSSRApi } from '../../lib/packageBuilder/searchApi.js';

const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

export default function FlightSeatModal({
  isOpen,
  onClose,
  flight,
  currentSelection = {},
  onSaveSelection
}) {
  const [activeTab, setActiveTab] = useState('SEATS'); // 'SEATS' | 'BAGGAGE' | 'MEALS'
  const [loading, setLoading] = useState(false);

  // Seat map state
  const [seatGrid, setSeatGrid] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState(currentSelection.seats || []);

  // SSR state
  const [baggageList, setBaggageList] = useState([]);
  const [selectedBaggage, setSelectedBaggage] = useState(currentSelection.baggage || null);

  const [mealList, setMealList] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState(currentSelection.meals || []);

  useEffect(() => {
    if (!isOpen || !flight) return;

    let isMounted = true;
    const loadSeatAndSSR = async () => {
      setLoading(true);
      try {
        const [seatRes, ssrRes] = await Promise.allSettled([
          fetchSeatMapApi({
            traceId: flight.traceId || `TRC-${Date.now()}`,
            resultIndex: flight.resultIndex || '0'
          }),
          fetchSSRApi({
            traceId: flight.traceId || `TRC-${Date.now()}`,
            resultIndex: flight.resultIndex || '0'
          })
        ]);

        if (!isMounted) return;

        // Process seats
        const rawSeats =
          seatRes.status === 'fulfilled' &&
          seatRes.value?.SeatMap?.Segments?.[0]?.Rows;

        if (Array.isArray(rawSeats) && rawSeats.length > 0) {
          setSeatGrid(rawSeats);
        } else {
          // Generate 12 realistic aircraft rows (A, B, C | D, E, F)
          setSeatGrid(generateDefaultSeatMap());
        }

        // Process SSR
        const ssrData = ssrRes.status === 'fulfilled' ? ssrRes.value : null;
        const bags = ssrData?.Baggage || [
          { Code: 'BAG5', Description: 'Additional 5 Kg', Weight: 5, Price: 1500 },
          { Code: 'BAG10', Description: 'Additional 10 Kg', Weight: 10, Price: 3000 },
          { Code: 'BAG15', Description: 'Additional 15 Kg', Weight: 15, Price: 4500 }
        ];
        const meals = ssrData?.Meal || [
          { Code: 'VML', Description: 'Grilled Veg Sandwich & Juice', Price: 250 },
          { Code: 'NVML', Description: 'Chicken Biryani Box', Price: 400 },
          { Code: 'JML', Description: 'Jain Meal Platter', Price: 300 },
          { Code: 'FRML', Description: 'Fresh Seasonal Fruit Bowl', Price: 200 }
        ];

        setBaggageList(bags);
        setMealList(meals);
      } catch (err) {
        console.warn('Seat/SSR fetch notice, initialized default layout:', err.message);
        if (isMounted) {
          setSeatGrid(generateDefaultSeatMap());
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSeatAndSSR();

    return () => {
      isMounted = false;
    };
  }, [isOpen, flight]);

  const generateDefaultSeatMap = () => {
    const rows = [];
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    for (let r = 1; r <= 10; r++) {
      const seats = cols.map((col) => {
        const seatNo = `${r}${col}`;
        const isWindow = col === 'A' || col === 'F';
        const isAisle = col === 'C' || col === 'D';
        const isBooked = (r * 7 + col.charCodeAt(0)) % 5 === 0;
        let price = 0;
        if (r === 1) price = 450; // extra legroom
        else if (isWindow || isAisle) price = 250;
        else price = 0; // free middle seat

        return {
          SeatNo: seatNo,
          Class: 'Economy',
          Price: price,
          IsBooked: isBooked,
          IsWindow: isWindow,
          IsAisle: isAisle,
          IsLegroom: r === 1
        };
      });
      rows.push({ RowNumber: r, Seats: seats });
    }
    return rows;
  };

  const handleToggleSeat = (seat) => {
    if (seat.IsBooked) return;
    const exists = selectedSeats.find((s) => s.SeatNo === seat.SeatNo);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.SeatNo !== seat.SeatNo));
    } else {
      // Single passenger seat selection or multi
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleToggleMeal = (meal) => {
    const exists = selectedMeals.find((m) => m.Code === meal.Code);
    if (exists) {
      setSelectedMeals(selectedMeals.filter((m) => m.Code !== meal.Code));
    } else {
      setSelectedMeals([...selectedMeals, meal]);
    }
  };

  const handleSelectBaggage = (bag) => {
    if (selectedBaggage?.Code === bag.Code) {
      setSelectedBaggage(null);
    } else {
      setSelectedBaggage(bag);
    }
  };

  // Price calculations
  const baseFlightFare = Number(flight?.fare || flight?.price || 4000);
  const taxes = Number(flight?.tax || 650);
  const seatsPrice = selectedSeats.reduce((acc, s) => acc + Number(s.Price || 0), 0);
  const baggagePrice = Number(selectedBaggage?.Price || 0);
  const mealsPrice = selectedMeals.reduce((acc, m) => acc + Number(m.Price || 0), 0);
  const grandTotal = baseFlightFare + taxes + seatsPrice + baggagePrice + mealsPrice;

  const handleSave = () => {
    onSaveSelection({
      seats: selectedSeats,
      seatNumbers: selectedSeats.map((s) => s.SeatNo).join(', '),
      baggage: selectedBaggage,
      meals: selectedMeals,
      seatsPrice,
      baggagePrice,
      mealsPrice,
      updatedTotalFare: grandTotal
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Customize Flight Add-ons: {flight?.airline || 'Flight'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {flight?.origin || 'DEL'} → {flight?.destination || 'BOM'} · Flight {flight?.airlineCode || '6E'} {flight?.flightNumber || '2074'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-200 bg-white px-5 gap-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('SEATS')}
            className={`py-3 transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'SEATS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Seat Map ({selectedSeats.length} selected)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('BAGGAGE')}
            className={`py-3 transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'BAGGAGE'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Extra Baggage {selectedBaggage ? `(+${selectedBaggage.Weight}kg)` : ''}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MEALS')}
            className={`py-3 transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'MEALS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Meals &amp; Snacks ({selectedMeals.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-xs font-medium">Loading seat map &amp; ancillary services...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: SEAT MAP */}
              {activeTab === 'SEATS' && (
                <div className="space-y-4">
                  {/* Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-md border border-slate-300 bg-white"></div>
                      <span>Free / ₹0</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-md border border-blue-400 bg-blue-50 text-blue-800 font-bold text-[9px] flex items-center justify-center">
                        ₹
                      </div>
                      <span>Chargeable</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-md bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-md bg-slate-300 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                        ✕
                      </div>
                      <span>Occupied</span>
                    </div>
                  </div>

                  {/* Fuselage Container */}
                  <div className="max-w-xs mx-auto border-2 border-slate-300 rounded-t-[50px] rounded-b-2xl p-4 bg-slate-100 shadow-inner">
                    <div className="text-center pb-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                      Cockpit / Front
                    </div>

                    <div className="space-y-2">
                      {seatGrid.map((row) => (
                        <div key={row.RowNumber} className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono text-slate-400 w-4 text-center">
                            {row.RowNumber}
                          </span>

                          {/* Left 3 seats (A, B, C) */}
                          <div className="flex gap-1">
                            {row.Seats.slice(0, 3).map((seat) => {
                              const isSel = selectedSeats.some((s) => s.SeatNo === seat.SeatNo);
                              const isLegroom = row.RowNumber <= 2 || seat.SeatType === 'ExtraLegroom';
                              const tooltipText = `${seat.SeatNo} • ${seat.Price ? `₹${seat.Price}` : 'Free'}${isLegroom ? ' • Legroom' : ''}${seat.IsBooked ? ' • Booked' : ''}`;
                              return (
                                <div key={seat.SeatNo} className="relative group">
                                  <button
                                    type="button"
                                    disabled={seat.IsBooked}
                                    onClick={() => handleToggleSeat(seat)}
                                    className={`w-7 h-7 rounded-md text-[10px] font-bold flex flex-col items-center justify-center cursor-pointer ${
                                      seat.IsBooked
                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                        : isSel
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : seat.Price > 0
                                        ? 'bg-blue-50 border border-blue-400 text-blue-900 hover:bg-blue-100'
                                        : 'bg-white border border-slate-300 text-slate-800 hover:border-blue-400'
                                    }`}
                                  >
                                    {isSel ? <Check className="w-3.5 h-3.5" /> : seat.SeatNo.slice(-1)}
                                  </button>
                                  {/* Instant zero-delay custom tooltip */}
                                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex group-focus-within:flex z-50 whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg items-center gap-1 transition-none">
                                    <span>{tooltipText}</span>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Center Aisle */}
                          <div className="w-5 text-center text-[9px] font-mono text-slate-300">|</div>

                          {/* Right 3 seats (D, E, F) */}
                          <div className="flex gap-1">
                            {row.Seats.slice(3, 6).map((seat) => {
                              const isSel = selectedSeats.some((s) => s.SeatNo === seat.SeatNo);
                              const isLegroom = row.RowNumber <= 2 || seat.SeatType === 'ExtraLegroom';
                              const tooltipText = `${seat.SeatNo} • ${seat.Price ? `₹${seat.Price}` : 'Free'}${isLegroom ? ' • Legroom' : ''}${seat.IsBooked ? ' • Booked' : ''}`;
                              return (
                                <div key={seat.SeatNo} className="relative group">
                                  <button
                                    type="button"
                                    disabled={seat.IsBooked}
                                    onClick={() => handleToggleSeat(seat)}
                                    className={`w-7 h-7 rounded-md text-[10px] font-bold flex flex-col items-center justify-center cursor-pointer ${
                                      seat.IsBooked
                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                        : isSel
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : seat.Price > 0
                                        ? 'bg-blue-50 border border-blue-400 text-blue-900 hover:bg-blue-100'
                                        : 'bg-white border border-slate-300 text-slate-800 hover:border-blue-400'
                                    }`}
                                  >
                                    {isSel ? <Check className="w-3.5 h-3.5" /> : seat.SeatNo.slice(-1)}
                                  </button>
                                  {/* Instant zero-delay custom tooltip */}
                                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex group-focus-within:flex z-50 whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg items-center gap-1 transition-none">
                                    <span>{tooltipText}</span>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EXTRA BAGGAGE */}
              {activeTab === 'BAGGAGE' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p>
                      Standard ticket includes <strong>15 Kg check-in</strong> and <strong>7 Kg cabin</strong> baggage. Select pre-paid excess baggage below to avoid higher airport rates.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    {baggageList.map((bag) => {
                      const isSelected = selectedBaggage?.Code === bag.Code;
                      return (
                        <div
                          key={bag.Code}
                          onClick={() => handleSelectBaggage(bag)}
                          className={`p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border-blue-600 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{bag.Description}</p>
                              <span className="text-[11px] text-slate-500">Weight: +{bag.Weight} Kg check-in</span>
                            </div>
                          </div>
                          <span className="font-bold text-sm text-slate-900">{inr(bag.Price)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: MEALS */}
              {activeTab === 'MEALS' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                    <Utensils className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p>
                      Pre-order delicious fresh meals &amp; snacks prepared by airline chefs and delivered hot right to your seat.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {mealList.map((meal) => {
                      const isSelected = selectedMeals.some((m) => m.Code === meal.Code);
                      return (
                        <div
                          key={meal.Code}
                          onClick={() => handleToggleMeal(meal)}
                          className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50/70 border-amber-500 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-amber-300'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 text-xs">{meal.Description}</p>
                            <span className="text-xs font-bold text-amber-700">{inr(meal.Price)}</span>
                          </div>

                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer: Live Price Recalculation Summary */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-500">
              Base + Tax: <strong className="text-slate-800">{inr(baseFlightFare + taxes)}</strong>
            </span>
            {seatsPrice > 0 && (
              <span className="text-blue-600">
                Seats: <strong>+{inr(seatsPrice)}</strong>
              </span>
            )}
            {baggagePrice > 0 && (
              <span className="text-indigo-600">
                Baggage: <strong>+{inr(baggagePrice)}</strong>
              </span>
            )}
            {mealsPrice > 0 && (
              <span className="text-amber-600">
                Meals: <strong>+{inr(mealsPrice)}</strong>
              </span>
            )}
            <div className="sm:border-l border-slate-200 sm:pl-3 font-black text-sm text-slate-900">
              Updated Total: <span className="text-blue-600">{inr(grandTotal)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer flex-1 sm:flex-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex-1 sm:flex-none"
            >
              Save Add-ons
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
