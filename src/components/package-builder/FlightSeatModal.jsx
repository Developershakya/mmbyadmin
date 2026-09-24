import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Plane,
  Briefcase,
  Utensils,
  AlertCircle,
  Loader2,
  Info,
  Armchair,
  Luggage,
} from "lucide-react";

// ErrorCode "0" + khali message = SUCCESS, error nahi. Ye hi single source of truth hai error ke liye.
const getSrdvErrorMessage = (payload) => {
  const error = payload?.Error;
  if (error && typeof error === "object") {
    const codeValue = error.ErrorCode ?? error.errorCode;
    const code = Number(codeValue ?? 0);
    const message = String(error.ErrorMessage || error.message || "").trim();
    if (code !== 0 || message) {
      return `Error Code: ${codeValue ?? "Unknown"}\n\n${message || "SRDV returned an error."}`;
    }
  }
  if (payload?.error) return payload.error;
  return null;
};

const readJsonResponse = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const fetchDirectSrdv = async (path, payload) => {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await readJsonResponse(response);
  const srdvErr = getSrdvErrorMessage(data || {});
  if (!response.ok || srdvErr) {
    const err = new Error(
      srdvErr ||
        data?.message ||
        `Request failed with status ${response.status}`,
    );
    err.status = response.status;
    err.payload = data;
    throw err;
  }
  return data;
};

const inr = (n) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

/* ---------- Real Seat Map mapper ----------
   payload.Results = [
     { FromAirportCode, ToAirportCode, AirlineName, AirlineCode, AirlineNumber, TotalRow, TotalColumn,
       Seats: { Row1: { Column1: {SeatNumber,IsBooked,IsLegroom,IsAisle,Amount,Code}, Column2:{...} }, Row2:{...} } },
     { ... another leg ... }
   ]
*/
const mapSeatMapResponse = (payload) => {
  const results = Array.isArray(payload?.Results)
    ? payload.Results
    : payload?.Results
      ? [payload.Results]
      : [];

  return results.map((leg) => {
    const seatsObj = leg?.Seats || {};
    const rowKeys = Object.keys(seatsObj).sort(
      (a, b) =>
        (parseInt(a.replace("Row", ""), 10) || 0) -
        (parseInt(b.replace("Row", ""), 10) || 0),
    );

    const rows = rowKeys.map((rowKey) => {
      const rowObj = seatsObj[rowKey] || {};
      const colKeys = Object.keys(rowObj).sort(
        (a, b) =>
          (parseInt(a.replace("Column", ""), 10) || 0) -
          (parseInt(b.replace("Column", ""), 10) || 0),
      );
      const seats = colKeys.map((colKey) => {
        const s = rowObj[colKey] || {};
        return {
          SeatNo: s.SeatNumber,
          IsBooked: Boolean(s.IsBooked),
          IsLegroom: Boolean(s.IsLegroom),
          IsAisle: Boolean(s.IsAisle),
          Price: Number(s.Amount) || 0,
          Code: s.Code,
        };
      });
      return {
        RowNumber: parseInt(rowKey.replace("Row", ""), 10) || 0,
        Seats: seats,
      };
    });

    return {
      from: leg.FromAirportCode,
      to: leg.ToAirportCode,
      airline: leg.AirlineName,
      airlineCode: leg.AirlineCode,
      flightNumber: leg.AirlineNumber,
      rows,
    };
  });
};

/* ---------- Real SSR (Baggage / Meal) mapper ----------
   payload.Baggage      = [ [ {Code,Description,Weight,Price,Origin,Destination}, ... ], [ ... for leg2 ] ]
   payload.MealDynamic  = same shape as Baggage (per-segment array). payload.Meal is legacy fallback.
*/
const mapSSRResponse = (payload) => {
  const normalize = (item) => ({
    Code: item.Code,
    Description: item.Description || item.AirlineDescription || "",
    Price: Number(item.Price) || 0,
    Weight: item.Weight || "",
    Origin: item.Origin,
    Destination: item.Destination,
  });

  const baggageGroups = Array.isArray(payload?.Baggage) ? payload.Baggage : [];
  const mealSource =
    Array.isArray(payload?.MealDynamic) && payload.MealDynamic.length > 0
      ? payload.MealDynamic
      : Array.isArray(payload?.Meal)
        ? payload.Meal
        : [];

  return {
    baggageBySegment: baggageGroups.map((seg) =>
      (Array.isArray(seg) ? seg : []).map(normalize),
    ),
    mealsBySegment: mealSource.map((seg) =>
      (Array.isArray(seg) ? seg : []).map(normalize),
    ),
  };
};

export default function FlightSeatModal({
  isOpen,
  onClose,
  flight,
  currentSelection = {},
  onSaveSelection,
}) {
  const [activeLeg, setActiveLeg] = useState(0);
  const [innerTab, setInnerTab] = useState("SEATS"); // SEATS | BAGGAGE | MEALS
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [seatLegs, setSeatLegs] = useState([]);
const maxSeatsAllowed = Math.max(
  1,
  Number(flight?.adults || 0) + Number(flight?.children || 0)
);
  const [baggageBySegment, setBaggageBySegment] = useState([]);
  const [mealsBySegment, setMealsBySegment] = useState([]);

  // per-leg selection state (old flat currentSelection ko leg 0 me fallback kar dete hain, backward-compat ke liye)
  const [selectedSeatsByLeg, setSelectedSeatsByLeg] = useState(
    currentSelection.seatsByLeg ||
      (currentSelection.seats?.length ? { 0: currentSelection.seats } : {}),
  );
  const [selectedBaggageByLeg, setSelectedBaggageByLeg] = useState(
    currentSelection.baggageByLeg ||
      (currentSelection.baggage ? { 0: currentSelection.baggage } : {}),
  );
  const [selectedMealsByLeg, setSelectedMealsByLeg] = useState(
    currentSelection.mealsByLeg ||
      (currentSelection.meals?.length ? { 0: currentSelection.meals } : {}),
  );
useEffect(() => {
  if (!flight) return;

  // Flight change hote hi previous flight ka selection reset
  setSelectedSeatsByLeg({});
  setSelectedBaggageByLeg({});
  setSelectedMealsByLeg({});

  // UI reset
  setActiveLeg(0);
  setInnerTab("SEATS");
}, [
  flight?.srdvType,
  flight?.srdvIndex,
  flight?.traceId,
  flight?.resultIndex,
]);
  useEffect(() => {
    if (!isOpen || !flight) return;
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setErrorMessage("");
      setSeatLegs([]);
      
      setBaggageBySegment([]);
      setMealsBySegment([]);
      setActiveLeg(0);

      // Fare Quote step Select-button click par hi ho chuka hai (FlightResultCard).
      // Uska result flight.seatSelectAllowed me already store hai.
      if (flight?.seatSelectAllowed === false) {
        if (isMounted) {
          setErrorMessage(
            "Seat selection is not available for this itinerary.",
          );
          setLoading(false);
        }
        return;
      }

      const quotePayload = {
        srdvType: flight?.srdvType || flight?.SrdvType,
        srdvIndex: flight?.srdvIndex || flight?.SrdvIndex,
        traceId: flight?.traceId || flight?.TraceId,
        resultIndex: flight?.resultIndex || flight?.ResultIndex,
      };

      try {
        const [seatRes, ssrRes] = await Promise.allSettled([
          fetchDirectSrdv("/api/admin-srdv/flights/seat-map", quotePayload),
          fetchDirectSrdv("/api/admin-srdv/flights/ssr", quotePayload),
        ]);

        if (!isMounted) return;

        if (seatRes.status === "rejected") {
          setErrorMessage(
            seatRes.reason?.message || "Seat map request failed.",
          );
        } else {
          setSeatLegs(mapSeatMapResponse(seatRes.value));
        }

        if (ssrRes.status === "rejected") {
          setErrorMessage(
            (prev) => prev || ssrRes.reason?.message || "SSR request failed.",
          );
        } else {
          const { baggageBySegment: bg, mealsBySegment: ml } = mapSSRResponse(
            ssrRes.value,
          );
          setBaggageBySegment(bg);
          setMealsBySegment(ml);
        }
      } catch (err) {
        if (isMounted)
          setErrorMessage(
            err.message || "Could not load seat map / ancillary services.",
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [isOpen, flight]);

  const handleToggleSeat = (legIdx, seat) => {
    if (seat.IsBooked) return;
    setSelectedSeatsByLeg((prev) => {
      const current = prev[legIdx] || [];
      const exists = current.find((s) => s.SeatNo === seat.SeatNo);

      if (exists) {
        // Deselect — hamesha allowed
        return {
          ...prev,
          [legIdx]: current.filter((s) => s.SeatNo !== seat.SeatNo),
        };
      }

      // Naya seat add karne se pehle limit check
      if (current.length >= maxSeatsAllowed) {
        // Silent fail ki jagah alert — user ko pata chale kyu block hua
        alert(
          `Aap sirf ${maxSeatsAllowed} seat select kar sakte hain (${maxSeatsAllowed} passenger${maxSeatsAllowed > 1 ? "s" : ""} ke liye).`,
        );
        return prev;
      }

      return { ...prev, [legIdx]: [...current, seat] };
    });
  };

  const handleSelectBaggage = (legIdx, bag) => {
    setSelectedBaggageByLeg((prev) => {
      const isSame = prev[legIdx]?.Code === bag.Code;
      return { ...prev, [legIdx]: isSame ? null : bag };
    });
  };

  const handleToggleMeal = (legIdx, meal) => {
    setSelectedMealsByLeg((prev) => {
      const current = prev[legIdx] || [];
      const exists = current.find((m) => m.Code === meal.Code);
      const updated = exists
        ? current.filter((m) => m.Code !== meal.Code)
        : [...current, meal];
      return { ...prev, [legIdx]: updated };
    });
  };

  const allSelectedSeats = Object.values(selectedSeatsByLeg).flat();
  const allSelectedMeals = Object.values(selectedMealsByLeg).flat();
  const allSelectedBaggage =
    Object.values(selectedBaggageByLeg).filter(Boolean);

  const baseFlightFare = Number(flight?.fare || flight?.price || 0);
  const taxes = Number(flight?.tax || 0);
  const seatsPrice = allSelectedSeats.reduce(
    (acc, s) => acc + Number(s.Price || 0),
    0,
  );
  const baggagePrice = allSelectedBaggage.reduce(
    (acc, b) => acc + Number(b.Price || 0),
    0,
  );
  const mealsPrice = allSelectedMeals.reduce(
    (acc, m) => acc + Number(m.Price || 0),
    0,
  );
  const grandTotal =
    baseFlightFare + taxes + seatsPrice + baggagePrice + mealsPrice;

  const handleSave = () => {
    onSaveSelection({
      seatsByLeg: selectedSeatsByLeg,
      baggageByLeg: selectedBaggageByLeg,
      mealsByLeg: selectedMealsByLeg,
      seats: allSelectedSeats,
      seatNumbers: allSelectedSeats.map((s) => s.SeatNo).join(", "),
      baggage: allSelectedBaggage[0] || null,
      meals: allSelectedMeals,
      seatsPrice,
      baggagePrice,
      mealsPrice,
      updatedTotalFare: grandTotal,
    });
    onClose();
  };

  if (!isOpen) return null;

  const currentLeg = seatLegs[activeLeg];
  const currentBaggageList = baggageBySegment[activeLeg] || [];
  const currentMealList = mealsBySegment[activeLeg] || [];
  const currentSelectedSeats = selectedSeatsByLeg[activeLeg] || [];
  const currentSelectedBaggage = selectedBaggageByLeg[activeLeg] || null;
  const currentSelectedMeals = selectedMealsByLeg[activeLeg] || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Customize Flight Add-ons: {flight?.airline || "Flight"}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {flight?.origin || flight?.from || "DEL"} →{" "}
              {flight?.destination || flight?.to || "BOM"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {seatLegs.length > 1 && (
          <div className="flex border-b border-slate-200 bg-white px-5 gap-4 text-xs font-bold overflow-x-auto">
            {seatLegs.map((leg, idx) => (
              <button
                key={idx}
                onClick={() => setActiveLeg(idx)}
                className={`py-2.5 whitespace-nowrap border-b-2 transition cursor-pointer ${
                  activeLeg === idx
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {leg.from} → {leg.to} ({leg.flightNumber})
              </button>
            ))}
          </div>
        )}

        <div className="flex border-b border-slate-200 bg-white px-5 gap-6 text-xs font-bold">
          <button onClick={() => setInnerTab("SEATS")}>
            <span>
              Seat Map ({currentSelectedSeats.length}/{maxSeatsAllowed}{" "}
              selected)
            </span>
          </button>
          <button
            onClick={() => setInnerTab("BAGGAGE")}
            className={`py-3 border-b-2 flex items-center gap-1.5 cursor-pointer ${innerTab === "BAGGAGE" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>
              Extra Baggage{" "}
              {currentSelectedBaggage
                ? `(${currentSelectedBaggage.Description})`
                : ""}
            </span>
          </button>
          <button
            onClick={() => setInnerTab("MEALS")}
            className={`py-3 border-b-2 flex items-center gap-1.5 cursor-pointer ${innerTab === "MEALS" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Meals ({currentSelectedMeals.length})</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium whitespace-pre-line">
                {errorMessage}
              </span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-xs font-medium">
                Loading seat map &amp; ancillary services...
              </p>
            </div>
          ) : (
            <>
              {innerTab === "SEATS" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-md border border-slate-300 bg-white"></div>
                      <span>Free / ₹0</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-md border border-blue-400 bg-blue-50"></div>
                      <span>Chargeable</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-md bg-blue-600"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-md bg-slate-300"></div>
                      <span>Occupied</span>
                    </div>
                  </div>

                  {!currentLeg || currentLeg.rows.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <Armchair className="w-10 h-10 text-slate-400 mx-auto" />
                      <h4 className="font-bold text-slate-800 text-sm">
                        Seat Selection Unavailable
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Live seat map is not provided by the airline for this
                        flight/segment.
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-xs mx-auto border-2 border-slate-300 rounded-t-[50px] rounded-b-2xl p-4 bg-slate-100 shadow-inner">
                      <div className="text-center pb-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                        Cockpit / Front
                      </div>
                      <div className="space-y-2">
                        {currentLeg.rows.map((row) => {
                          const mid = Math.ceil(row.Seats.length / 2);
                          const left = row.Seats.slice(0, mid);
                          const right = row.Seats.slice(mid);
                          const renderSeat = (seat) => {
                            if (!seat) return null;
                            const isSel = currentSelectedSeats.some(
                              (s) => s.SeatNo === seat.SeatNo,
                            );
                            return (
                              <div key={seat.SeatNo} className="relative group">
                                <button
                                  type="button"
                                  disabled={seat.IsBooked}
                                  onClick={() =>
                                    handleToggleSeat(activeLeg, seat)
                                  }
                                  className={`w-7 h-7 rounded-md text-[10px] font-bold flex items-center justify-center cursor-pointer ${
                                    seat.IsBooked
                                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                      : isSel
                                        ? "bg-blue-600 text-white"
                                        : seat.Price > 0
                                          ? "bg-blue-50 border border-blue-400 text-blue-900 hover:bg-blue-100"
                                          : "bg-white border border-slate-300 text-slate-800 hover:border-blue-400"
                                  }`}
                                >
                                  {isSel ? (
                                    <Check className="w-3.5 h-3.5" />
                                  ) : (
                                    (seat.SeatNo || "").slice(-1)
                                  )}
                                </button>
                                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex z-50 whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                                  {seat.SeatNo} •{" "}
                                  {seat.Price ? inr(seat.Price) : "Free"}
                                  {seat.IsLegroom ? " • Legroom" : ""}
                                  {seat.IsBooked ? " • Booked" : ""}
                                </div>
                              </div>
                            );
                          };
                          return (
                            <div
                              key={row.RowNumber}
                              className="flex items-center justify-between gap-1"
                            >
                              <span className="text-[10px] font-mono text-slate-400 w-4 text-center">
                                {row.RowNumber}
                              </span>
                              <div className="flex gap-1">
                                {left.map(renderSeat)}
                              </div>
                              <div className="w-5 text-center text-[9px] font-mono text-slate-300">
                                |
                              </div>
                              <div className="flex gap-1">
                                {right.map(renderSeat)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {innerTab === "BAGGAGE" && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p>
                      Select optional pre-paid excess baggage for this segment (
                      {currentLeg?.from} → {currentLeg?.to}).
                    </p>
                  </div>
                  {currentBaggageList.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <Luggage className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500">
                        No extra baggage options for this segment.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2">
                      {currentBaggageList.map((bag) => {
                        const isSelected =
                          currentSelectedBaggage?.Code === bag.Code;
                        return (
                          <div
                            key={bag.Code}
                            onClick={() => handleSelectBaggage(activeLeg, bag)}
                            className={`p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${isSelected ? "bg-blue-50 border-blue-600" : "bg-white border-slate-200 hover:border-blue-300"}`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                              <p className="font-bold text-slate-900 text-xs">
                                {bag.Description}
                              </p>
                            </div>
                            <span className="font-bold text-sm text-slate-900">
                              {bag.Price > 0 ? inr(bag.Price) : "Free"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {innerTab === "MEALS" && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                    <Utensils className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p>
                      Pre-order meals for this segment ({currentLeg?.from} →{" "}
                      {currentLeg?.to}).
                    </p>
                  </div>
                  {currentMealList.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <Utensils className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500">
                        No meal options for this segment.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {currentMealList.map((meal) => {
                        const isSelected = currentSelectedMeals.some(
                          (m) => m.Code === meal.Code,
                        );
                        return (
                          <div
                            key={meal.Code}
                            onClick={() => handleToggleMeal(activeLeg, meal)}
                            className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${isSelected ? "bg-amber-50/70 border-amber-500" : "bg-white border-slate-200 hover:border-amber-300"}`}
                          >
                            <div>
                              <p className="font-bold text-slate-900 text-xs">
                                {meal.Description}
                              </p>
                              <span className="text-xs font-bold text-amber-700">
                                {inr(meal.Price)}
                              </span>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${isSelected ? "border-amber-600 bg-amber-600 text-white" : "border-slate-300"}`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-500">
              Base + Tax:{" "}
              <strong className="text-slate-800">
                {inr(baseFlightFare + taxes)}
              </strong>
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
              Updated Total:{" "}
              <span className="text-blue-600">{inr(grandTotal)}</span>
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
