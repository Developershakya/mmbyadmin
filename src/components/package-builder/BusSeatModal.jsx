import React, { useState, useEffect } from 'react';
import {
  X,
  Bus,
  Check,
  MapPin,
  Clock,
  ShieldAlert,
  Loader2,
  User,
  AlertCircle
} from 'lucide-react';
import {
  fetchBusSeatLayoutApi,
  fetchBusBoardingDetailsApi,
  blockBusSeatsApi
} from '../../lib/packageBuilder/searchApi.js';
import { normalizeSrdvContext } from '../../lib/srdvContext.js';

const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

export default function BusSeatModal({
  isOpen,
  onClose,
  bus,
  currentSelection = {},
  onSaveSelection
}) {
  const [loading, setLoading] = useState(false);
  const [activeDeck, setActiveDeck] = useState('LOWER'); // 'LOWER' | 'UPPER'

  // Seats state
  const [lowerSeats, setLowerSeats] = useState([]);
  const [upperSeats, setUpperSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState(currentSelection.seats || []);

  // Boarding & Dropping state
  const [boardingPoints, setBoardingPoints] = useState([]);
  const [droppingPoints, setDroppingPoints] = useState([]);
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState(currentSelection.boardingPoint || null);
  const [selectedDroppingPoint, setSelectedDroppingPoint] = useState(currentSelection.droppingPoint || null);

  useEffect(() => {
    if (!isOpen || !bus) return;

    let isMounted = true;
    const loadBusDetails = async () => {
      setLoading(true);
      try {
        const srdvCtx = normalizeSrdvContext(bus);
        const [layoutRes, bpRes] = await Promise.allSettled([
          fetchBusSeatLayoutApi(srdvCtx),
          fetchBusBoardingDetailsApi(srdvCtx)
        ]);

        if (!isMounted) return;

        // Process seats layout
        const rawSeats =
          layoutRes.status === 'fulfilled' &&
          (layoutRes.value?.SeatLayout?.Seats || layoutRes.value?.data?.SeatLayout?.Seats);

        if (Array.isArray(rawSeats) && rawSeats.length > 0) {
          setLowerSeats(rawSeats.filter((s) => !s.IsUpper));
          setUpperSeats(rawSeats.filter((s) => s.IsUpper));
        } else {
          setLowerSeats([]);
          setUpperSeats([]);
        }

        // Process Boarding & Dropping points
        const bpData = bpRes.status === 'fulfilled' ? bpRes.value : null;
        const bPoints = Array.isArray(bpData?.BoardingPoints)
          ? bpData.BoardingPoints
          : (Array.isArray(bus.boardingPoints) ? bus.boardingPoints : []);
        const dPoints = Array.isArray(bpData?.DroppingPoints)
          ? bpData.DroppingPoints
          : (Array.isArray(bus.droppingPoints) ? bus.droppingPoints : []);

        setBoardingPoints(bPoints);
        setDroppingPoints(dPoints);

        if (!selectedBoardingPoint && bPoints.length > 0) {
          setSelectedBoardingPoint(bPoints[0]);
        }
        if (!selectedDroppingPoint && dPoints.length > 0) {
          setSelectedDroppingPoint(dPoints[0]);
        }
      } catch (err) {
        console.warn('Bus seat layout notice:', err.message);
        if (isMounted) {
          setLowerSeats([]);
          setUpperSeats([]);
          setBoardingPoints(Array.isArray(bus.boardingPoints) ? bus.boardingPoints : []);
          setDroppingPoints(Array.isArray(bus.droppingPoints) ? bus.droppingPoints : []);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBusDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, bus]);

  const handleToggleSeat = (seat) => {
    if (seat.IsBooked) return;
    const exists = selectedSeats.find((s) => s.SeatNo === seat.SeatNo);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.SeatNo !== seat.SeatNo));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const totalSeatsPrice = selectedSeats.reduce((acc, s) => acc + Number(s.Fare || bus.fare || 1400), 0);

  const handleSave = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least 1 bus seat to continue.');
      return;
    }

    onSaveSelection({
      seats: selectedSeats,
      seatNumbers: selectedSeats.map((s) => s.SeatNo).join(', '),
      boardingPoint: selectedBoardingPoint,
      droppingPoint: selectedDroppingPoint,
      totalSeatsPrice,
      updatedTotalFare: totalSeatsPrice
    });

    onClose();
  };

  if (!isOpen) return null;

  const currentDeckSeats = activeDeck === 'LOWER' ? lowerSeats : upperSeats;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-blue-600 shrink-0" />
              <h3 className="font-bold text-slate-900 text-base">
                Select Bus Seats: {bus?.operator || 'Bus Operator'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {bus?.busType || 'AC Multi-Axle Sleeper'} · {bus?.origin || 'Delhi'} → {bus?.destination || 'Manali'}
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {loading && !lowerSeats.length ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-xs font-medium">Loading seat layout &amp; boarding points...</p>
            </div>
          ) : (
            <>
              {/* Deck Toggle & Legend */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setActiveDeck('LOWER')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeDeck === 'LOWER' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Lower Deck (Seater)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDeck('UPPER')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeDeck === 'UPPER' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upper Deck (Sleeper)
                  </button>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded border border-slate-300 bg-white"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded border border-rose-300 bg-rose-50"></div>
                    <span>Female</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-600 text-white"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded bg-slate-300"></div>
                    <span>Booked</span>
                  </div>
                </div>
              </div>

              {/* Bus Coach Layout Graphic or Empty State */}
              {currentDeckSeats.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <Bus className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-sm">Seat Layout Unavailable</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Live seat layout is not provided by the bus operator for this service. Seats will be allocated directly by the operator upon boarding.
                  </p>
                </div>
              ) : (
                <div className="max-w-xs mx-auto border-2 border-slate-300 rounded-3xl p-4 bg-slate-100 shadow-inner space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Back</span>
                    <span>Driver Cabin 🛞</span>
                  </div>

                  {/* Seats Grid */}
                  <div className="space-y-2.5">
                    {Array.from(new Set(currentDeckSeats.map((s) => s.Row || 1))).sort((a, b) => a - b).map((rowNum) => {
                      const rowSeats = currentDeckSeats.filter((s) => (s.Row || 1) === rowNum);
                      const leftSeats = rowSeats.filter((s) => (s.Column || 1) <= 2);
                      const rightSeats = rowSeats.filter((s) => (s.Column || 1) > 2);

                      return (
                        <div key={rowNum} className="flex items-center justify-between gap-1">
                          {/* Left Side (2 seats) */}
                          <div className="flex gap-2">
                            {leftSeats.map((seat) => {
                              const isSel = selectedSeats.some((s) => s.SeatNo === seat.SeatNo);
                              const isSleeper = seat.IsSleeper;
                              const tooltipText = `Seat ${seat.SeatNo} • ${inr(seat.Fare)}${seat.IsLadies ? ' • Ladies' : ''}${seat.IsBooked ? ' • Booked' : ''}`;

                              return (
                                <div key={seat.SeatNo} className="relative group">
                                  <button
                                    type="button"
                                    disabled={seat.IsBooked}
                                    onClick={() => handleToggleSeat(seat)}
                                    className={`rounded-lg font-bold text-[10px] flex flex-col items-center justify-center transition cursor-pointer ${
                                      isSleeper ? 'w-10 h-14' : 'w-9 h-9'
                                    } ${
                                      seat.IsBooked
                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                        : isSel
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : seat.IsLadies
                                        ? 'bg-rose-50 border border-rose-300 text-rose-800 hover:bg-rose-100'
                                        : 'bg-white border border-slate-300 text-slate-800 hover:border-blue-400'
                                    }`}
                                  >
                                    {isSel ? <Check className="w-3.5 h-3.5" /> : seat.SeatNo}
                                    <span className="text-[8px] font-normal opacity-80 mt-0.5">
                                      {inr(seat.Fare)}
                                    </span>
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

                          {/* Gangway / Aisle */}
                          <div className="w-6 text-center text-[9px] font-mono text-slate-300">|</div>

                          {/* Right Side (Single seat) */}
                          <div className="flex gap-2">
                            {rightSeats.map((seat) => {
                              const isSel = selectedSeats.some((s) => s.SeatNo === seat.SeatNo);
                              const isSleeper = seat.IsSleeper;
                              const tooltipText = `Seat ${seat.SeatNo} • ${inr(seat.Fare)}${seat.IsLadies ? ' • Ladies' : ''}${seat.IsBooked ? ' • Booked' : ''}`;

                              return (
                                <div key={seat.SeatNo} className="relative group">
                                  <button
                                    type="button"
                                    disabled={seat.IsBooked}
                                    onClick={() => handleToggleSeat(seat)}
                                    className={`rounded-lg font-bold text-[10px] flex flex-col items-center justify-center transition cursor-pointer ${
                                      isSleeper ? 'w-10 h-14' : 'w-9 h-9'
                                    } ${
                                      seat.IsBooked
                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                        : isSel
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : seat.IsLadies
                                        ? 'bg-rose-50 border border-rose-300 text-rose-800 hover:bg-rose-100'
                                        : 'bg-white border border-slate-300 text-slate-800 hover:border-blue-400'
                                    }`}
                                  >
                                    {isSel ? <Check className="w-3.5 h-3.5" /> : seat.SeatNo}
                                    <span className="text-[8px] font-normal opacity-80 mt-0.5">
                                      {inr(seat.Fare)}
                                    </span>
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
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Boarding and Dropping Points Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                {/* Boarding Point */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Boarding Point</span>
                  </label>
                  {boardingPoints.length > 0 ? (
                    <select
                      value={selectedBoardingPoint?.CityPointIndex || ''}
                      onChange={(e) => {
                        const found = boardingPoints.find((p) => p.CityPointIndex === e.target.value);
                        setSelectedBoardingPoint(found);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {boardingPoints.map((bp) => (
                        <option key={bp.CityPointIndex} value={bp.CityPointIndex}>
                          {bp.CityPointTime ? `${bp.CityPointTime} - ` : ''}{bp.CityPointName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs italic">
                      Pickup: {bus?.origin || 'Main origin terminal'}
                    </div>
                  )}
                </div>

                {/* Dropping Point */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dropping Point</span>
                  </label>
                  {droppingPoints.length > 0 ? (
                    <select
                      value={selectedDroppingPoint?.CityPointIndex || ''}
                      onChange={(e) => {
                        const found = droppingPoints.find((p) => p.CityPointIndex === e.target.value);
                        setSelectedDroppingPoint(found);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {droppingPoints.map((dp) => (
                        <option key={dp.CityPointIndex} value={dp.CityPointIndex}>
                          {dp.CityPointTime ? `${dp.CityPointTime} - ` : ''}{dp.CityPointName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs italic">
                      Drop-off: {bus?.destination || 'Main destination stand'}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-slate-500 text-xs block">
              Selected ({selectedSeats.length}): {selectedSeats.map((s) => s.SeatNo).join(', ') || 'None'}
            </span>
            <span className="text-base font-black text-emerald-600">{inr(totalSeatsPrice)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Confirm Bus Seats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
