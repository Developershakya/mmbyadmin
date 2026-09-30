import React, { useState, useEffect } from "react";
import {
  X,
  Bus,
  Check,
  MapPin,
  Clock,
  ShieldAlert,
  Loader2,
  User,
  AlertCircle,
} from "lucide-react";

// Boarding/Dropping point ke do possible SRDV shapes ko ek canonical shape mein convert karta hai
const formatBoardingTime = (t) => {
  if (!t) return "";
  if (typeof t === "string" && t.includes("T")) {
    const d = new Date(t);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    }
  }
  return t; // already plain "20:00" jaisa hai
};

const normalizePoint = (p) => {
  if (!p) return null;
  return {
    id: p.Id ?? p.CityPointIndex ?? "",
    name: p.Name ?? p.CityPointName ?? "Point",
    time: formatBoardingTime(p.Time ?? p.CityPointTime ?? ""),
    location: p.Location ?? p.CityPointLocation ?? "",
    landmark: p.Landmark ?? p.CityPointLandmark ?? "",
    address: p.Address ?? p.CityPointAddress ?? "",
    contactNumber: p.ContactNumber ?? p.CityPointContactNumber ?? "",
    isPrime: String(p.IsPrime) === "true",
  };
};

const extractSrdvError = (payload) => {
  const err = payload?.Error;
  if (err && typeof err === "object") {
    const code = err.ErrorCode ?? err.errorCode;
    const message = String(err.ErrorMessage || err.message || "").trim();
    if (code !== undefined && code !== null && String(code) !== "0") {
      return `Error Code: ${code}\n\n${message || "SRDV returned an error."}`;
    }
    if (message) return message;
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
  const srdvErrMsg = extractSrdvError(data);
  if (!response.ok || srdvErrMsg) {
    const message =
      srdvErrMsg ||
      data?.message ||
      `SRDV request failed with status ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.payload = data;
    throw err;
  }

  return data;
};

const inr = (n) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

/* ---- Real seat-layout parser ----
   { Error, TraceId, SrdvIndex, ResultIndex, AvailableSeats, PaxIdRequired,
     Result: { "0": { "0": {seat}, "2": {seat}, ... }, "2": {...} },       // lower deck, RowNo -> ColumnNo
     ResultUpperSeat: { same structure, IsUpper: true }                    // upper deck
   } */
const parseDeck = (deckObj, isUpperFallback) => {
  if (!deckObj || typeof deckObj !== "object") return [];
  return Object.keys(deckObj)
    .sort((a, b) => Number(a) - Number(b))
    .map((rowKey) => {
      const rowObj = deckObj[rowKey] || {};
      const seats = Object.keys(rowObj)
        .sort((a, b) => Number(a) - Number(b))
        .map((colKey) => {
          const s = rowObj[colKey] || {};
          return {
            SeatNo: s.SeatName,
            ColumnNo: Number(s.ColumnNo) || 0,
            RowNo: Number(s.RowNo) || 0,
            IsUpper:
              s.IsUpper !== undefined
                ? Boolean(s.IsUpper)
                : Boolean(isUpperFallback),
            IsLadiesSeat: String(s.IsLadiesSeat) === "true",
            IsMalesSeat: String(s.IsMalesSeat) === "true",
            IsBooked: String(s.SeatStatus) !== "true", // "true" = available
            SeatType: s.SeatType || "",
            Fare: Number(s.Price?.OfferedFare ?? s.SeatFare) || 0,
            BaseFare: Number(s.Price?.BaseFare) || 0,
            Tax: Number(s.Price?.Tax) || 0,
          };
        });
      return { RowNumber: Number(rowKey), Seats: seats };
    });
};

const mapBusSeatLayoutResponse = (payload) => {
  const lowerRows = parseDeck(payload?.Result, false);
  const upperRows = parseDeck(payload?.ResultUpperSeat, true);
  return {
    availableSeats: Number(payload?.AvailableSeats) || 0,
    paxIdRequired: String(payload?.PaxIdRequired || "").toLowerCase() === "yes",
    lowerRows,
    upperRows,
    hasUpperDeck: upperRows.some((r) => r.Seats.length > 0),
  };
};

/* ---- Real boarding/dropping parser ----
   { Error, TraceId, SrdvIndex, ResultIndex,
     BoardingPoints:[{Id,MasterId,Name,Location,Address,Landmark,ContactNumber,Time}],
     DroppingPoints:[{Id,MasterId,Name,Location,Address,Landmark,ContactNumber,Time}] } */

export default function BusSeatModal({
  isOpen,
  onClose,
  bus,
  currentSelection = {},
  onSaveSelection,
}) {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [activeDeck, setActiveDeck] = useState("LOWER"); // 'LOWER' | 'UPPER'

  const [lowerRows, setLowerRows] = useState([]);
  const [upperRows, setUpperRows] = useState([]);
  const [hasUpperDeck, setHasUpperDeck] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const [boardingPoints, setBoardingPoints] = useState([]);
  const [droppingPoints, setDroppingPoints] = useState([]);
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState(null);
  const [selectedDroppingPoint, setSelectedDroppingPoint] = useState(null);

  const maxSeatsAllowed = Number(bus?.maxSeatsPerTicket) || 6;

  // Bus badalte hi (resultIndex change) — sab kuch fresh reset, purani state carry mat karo
  useEffect(() => {
    if (!isOpen || !bus) return;

    let isMounted = true;

    // RESET: naya bus = naya selection, purana kuch bhi carry nahi hoga
    setSelectedSeats([]);
    setSelectedBoardingPoint(null);
    setSelectedDroppingPoint(null);
    setLowerRows([]);
    setUpperRows([]);
    setActiveDeck("LOWER");
    setLoadError("");

    const loadBusDetails = async () => {
      setLoading(true);
      const quotePayload = {
        traceId: bus?.traceId || bus?.TraceId,
        srdvIndex: bus?.srdvIndex || bus?.SrdvIndex,
        resultIndex: bus?.resultIndex || bus?.ResultIndex,
      };

      try {
        const [layoutRes, bpRes] = await Promise.allSettled([
          fetchDirectSrdv("/api/admin-srdv/buses/seat-layout", quotePayload),
          fetchDirectSrdv(
            "/api/admin-srdv/buses/boarding-points",
            quotePayload,
          ),
        ]);

        if (!isMounted) return;

        // SEAT LAYOUT
        if (layoutRes.status === "fulfilled") {
          const mapped = mapBusSeatLayoutResponse(layoutRes.value);
          setLowerRows(mapped.lowerRows);
          setUpperRows(mapped.upperRows);
          setHasUpperDeck(mapped.hasUpperDeck);
        } else {
          setLowerRows([]);
          setUpperRows([]);
          setLoadError(
            (prev) =>
              prev ||
              layoutRes.reason?.message ||
              "Seat layout request failed.",
          );
        }

        // BOARDING / DROPPING — API fail ho to search response se fallback
        let bPoints = [];
        let dPoints = [];
        if (bpRes.status === "fulfilled") {
          bPoints = (
            Array.isArray(bpRes.value?.BoardingPoints)
              ? bpRes.value.BoardingPoints
              : []
          )
            .map(normalizePoint)
            .filter(Boolean);
          dPoints = (
            Array.isArray(bpRes.value?.DroppingPoints)
              ? bpRes.value.DroppingPoints
              : []
          )
            .map(normalizePoint)
            .filter(Boolean);
        }
        // Search response se aaye bus.boardingPoints already normalized hain (mapBusOption se)
        if (bPoints.length === 0 && Array.isArray(bus.boardingPoints))
          bPoints = bus.boardingPoints;
        if (dPoints.length === 0 && Array.isArray(bus.droppingPoints))
          dPoints = bus.droppingPoints;
        if (bpRes.status === "rejected" && bPoints.length === 0) {
          setLoadError(
            (prev) =>
              prev ||
              bpRes.reason?.message ||
              "Boarding points request failed.",
          );
        }

        setBoardingPoints(bPoints);
        setDroppingPoints(dPoints);
        if (bPoints.length > 0) setSelectedBoardingPoint(bPoints[0]);
        if (dPoints.length > 0) setSelectedDroppingPoint(dPoints[0]);
      } catch (err) {
        if (isMounted) {
          setLoadError(
            err.message || "Could not load seat layout / boarding points.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBusDetails();

    return () => {
      isMounted = false;
    };
    // resultIndex ko dependency mein rakho taaki same "bus" object reference badle bina bhi
    // naya bus select hone par effect chale
  }, [isOpen, bus?.resultIndex, bus?.ResultIndex]);

  const handleToggleSeat = (seat) => {
    if (seat.IsBooked) return;
    const exists = selectedSeats.find((s) => s.SeatNo === seat.SeatNo);

    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.SeatNo !== seat.SeatNo));
      return;
    }

    if (selectedSeats.length >= maxSeatsAllowed) {
      alert(
        `Is ticket par max ${maxSeatsAllowed} seat(s) hi select ki ja sakti hain.`,
      );
      return;
    }

    setSelectedSeats([...selectedSeats, seat]);
  };

  const totalSeatsPrice = selectedSeats.reduce(
    (acc, s) => acc + Number(s.Fare || 0),
    0,
  );

  const handleSave = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least 1 bus seat to continue.");
      return;
    }
    if (boardingPoints.length > 0 && !selectedBoardingPoint) {
      alert("Please select a boarding point.");
      return;
    }
    if (droppingPoints.length > 0 && !selectedDroppingPoint) {
      alert("Please select a dropping point.");
      return;
    }

    onSaveSelection({
      seats: selectedSeats,
      seatNumbers: selectedSeats.map((s) => s.SeatNo).join(", "),
      boardingPoint: selectedBoardingPoint,
      droppingPoint: selectedDroppingPoint,
      totalSeatsPrice,
      updatedTotalFare: totalSeatsPrice,
      hasSeatsConfirmed: true,
    });

    onClose();
  };

  if (!isOpen) return null;

  const currentDeckRows = activeDeck === "LOWER" ? lowerRows : upperRows;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-blue-600 shrink-0" />
              <h3 className="font-bold text-slate-900 text-base">
                Select Bus Seats: {bus?.operator || "Bus Operator"}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {bus?.busType || "AC Sleeper"} ·{" "}
              {bus?.from || bus?.origin || "Origin"} →{" "}
              {bus?.to || bus?.destination || "Destination"}
            </p>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">
              Max {maxSeatsAllowed} seat(s) allowed on this ticket
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
          {loadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium whitespace-pre-line">
                {loadError}
              </span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-xs font-medium">
                Loading seat layout &amp; boarding points...
              </p>
            </div>
          ) : (
            <>
              {/* Deck Toggle & Legend */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setActiveDeck("LOWER")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeDeck === "LOWER"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Lower Deck
                  </button>
                  {hasUpperDeck && (
                    <button
                      type="button"
                      onClick={() => setActiveDeck("UPPER")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        activeDeck === "UPPER"
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Upper Deck
                    </button>
                  )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded border border-slate-300 bg-white"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded border border-rose-300 bg-rose-50"></div>
                    <span>Ladies</span>
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

              {/* Seat Grid */}
              {currentDeckRows.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <Bus className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-sm">
                    {activeDeck === "UPPER"
                      ? "No Upper Deck Seats"
                      : "Seat Layout Unavailable"}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Live seat layout is not provided by the bus operator for
                    this service.
                  </p>
                </div>
              ) : (
                <div className="border-2 border-slate-300 rounded-3xl p-4 bg-slate-100 shadow-inner space-y-3 overflow-x-auto">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider min-w-max">
                    <span>Back</span>
                    <span>Driver Cabin 🛞</span>
                  </div>

                  <div className="space-y-2.5 min-w-max">
                    {currentDeckRows.map((row) => (
                      <div
                        key={row.RowNumber}
                        className="flex items-center gap-2"
                      >
                        {row.Seats.map((seat) => {
                          const isSel = selectedSeats.some(
                            (s) => s.SeatNo === seat.SeatNo,
                          );
                          const tooltipText = `Seat ${seat.SeatNo} • ${inr(seat.Fare)}${seat.IsLadiesSeat ? " • Ladies" : ""}${seat.IsBooked ? " • Booked" : ""}`;

                          return (
                            <div key={seat.SeatNo} className="relative group">
                              <button
                                type="button"
                                disabled={seat.IsBooked}
                                onClick={() => handleToggleSeat(seat)}
                                className={`w-11 h-11 rounded-lg font-bold text-[10px] flex flex-col items-center justify-center transition cursor-pointer ${
                                  seat.IsBooked
                                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                    : isSel
                                      ? "bg-emerald-600 text-white shadow-xs"
                                      : seat.IsLadiesSeat
                                        ? "bg-rose-50 border border-rose-300 text-rose-800 hover:bg-rose-100"
                                        : "bg-white border border-slate-300 text-slate-800 hover:border-blue-400"
                                }`}
                              >
                                {isSel ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  seat.SeatNo
                                )}
                                <span className="text-[8px] font-normal opacity-80 mt-0.5">
                                  {inr(seat.Fare)}
                                </span>
                              </button>
                              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex z-50 whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg items-center gap-1">
                                <span>{tooltipText}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Boarding and Dropping Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Boarding Point</span>
                  </label>
                  {boardingPoints.length > 0 ? (
                    <select
                      value={selectedBoardingPoint?.id || ""}
                      onChange={(e) => {
                        const found = boardingPoints.find(
                          (p) => String(p.id) === e.target.value,
                        );
                        setSelectedBoardingPoint(found);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {boardingPoints.map((bp) => (
                        <option key={bp.id} value={bp.id}>
                          {bp.time ? `${bp.time} - ` : ""}
                          {bp.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs italic">
                      No boarding points specified.
                    </div>
                  )}
                  {selectedBoardingPoint?.Landmark && (
                    <p className="text-[10px] text-slate-400">
                      {selectedBoardingPoint.Landmark}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dropping Point</span>
                  </label>
                  {droppingPoints.length > 0 ? (
                    <select
                      value={selectedDroppingPoint?.id || ""}
                      onChange={(e) => {
                        const found = droppingPoints.find(
                          (p) => String(p.id) === e.target.value,
                        );
                        setSelectedDroppingPoint(found);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {droppingPoints.map((dp) => (
                        <option key={dp.id} value={dp.id}>
                          {dp.time ? `${dp.time} - ` : ""}
                          {dp.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs italic">
                      No dropping points specified.
                    </div>
                  )}
                  {selectedDroppingPoint?.Landmark && (
                    <p className="text-[10px] text-slate-400">
                      {selectedDroppingPoint.Landmark}
                    </p>
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
              Selected ({selectedSeats.length}/{maxSeatsAllowed}):{" "}
              {selectedSeats.map((s) => s.SeatNo).join(", ") || "None"}
            </span>
            <span className="text-base font-black text-emerald-600">
              {inr(totalSeatsPrice)}
            </span>
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
