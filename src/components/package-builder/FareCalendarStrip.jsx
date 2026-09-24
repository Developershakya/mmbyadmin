import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const inr = (n) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

const addDays = (dateStr, days) => {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const formatDateLabel = (dateStr) => {
  try {
    const d = new Date(`${dateStr}T00:00:00`);
    const dayNum = d.getDate();
    const month = d
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    const weekday = d
      .toLocaleDateString("en-US", { weekday: "short" })
      .toUpperCase();
    return `${dayNum} ${month}, ${weekday}`;
  } catch {
    return dateStr;
  }
};

const VISIBLE_COUNT = 8; // image jaisa 8 dates ek baar me

export default function FareCalendarStrip({
  origin,
  destination,
  selectedDate,
  onSelectDate,
  cabinClass = 1,
}) {
  const [anchorDate, setAnchorDate] = useState(() => addDays(selectedDate, -2));
  const [faresByDate, setFaresByDate] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const requestIdRef = useRef(null);

  useEffect(() => {
    setAnchorDate(addDays(selectedDate, -2));
  }, [selectedDate]);

  useEffect(() => {
    if (!origin || !destination || !anchorDate) return;

    const requestId = `${Date.now()}-${Math.random()}`;
    requestIdRef.current = requestId;

    const loadFares = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const centerDate = addDays(anchorDate, Math.floor(VISIBLE_COUNT / 2));

        const res = await fetch("/api/admin-srdv/flights/fare-calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin,
            destination,
            date: centerDate,
            cabinClass,
          }),
        });

        const data = await res.json().catch(() => ({}));

        // SRDV error wrapper check
        const srdvError = data?.Error;
        const hasSrdvError =
          srdvError &&
          typeof srdvError === "object" &&
          (Number(srdvError.ErrorCode ?? 0) !== 0 ||
            String(srdvError.ErrorMessage || "").trim());

        if (!res.ok || hasSrdvError || data?.error) {
          const msg =
            (hasSrdvError &&
              `Error Code: ${srdvError.ErrorCode}\n${srdvError.ErrorMessage}`) ||
            data?.error ||
            `Fare calendar API failed with status ${res.status}`;
          throw new Error(msg);
        }

        // Real shape: { Error, TraceId, SrdvType, Origin, Destination, Results: [ { AirlineCode, DepartureDate, Fare, ... } ] }
        const rawList = data?.Results || data?.Result?.Results || [];

        const map = {};
        if (Array.isArray(rawList)) {
          rawList
            .filter((f) => f && f.Fare)
            .forEach((f) => {
              const dStr = (f.DepartureDate || "").split("T")[0];
              const fareVal = Number(f.Fare || 0);
              if (dStr && fareVal > 0) {
                // Ek date pe multiple airlines ho sakte hain — lowest fare rakho
                if (!map[dStr] || fareVal < map[dStr]) {
                  map[dStr] = fareVal;
                }
              }
            });
        }

        if (requestIdRef.current !== requestId) return;

        if (Object.keys(map).length === 0) {
          setErrorMsg("No fare calendar data returned for this route.");
        }
        setFaresByDate((prev) => ({ ...prev, ...map }));
      } catch (err) {
        if (requestIdRef.current === requestId) {
          console.error("[FareCalendar] failed:", err.message);
          setErrorMsg(err.message || "Failed to load fare calendar.");
        }
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    };

    loadFares();
  }, [origin, destination, anchorDate, cabinClass]);

  if (!origin || !destination) return null;

  const visibleDates = Array.from({ length: VISIBLE_COUNT }, (_, i) =>
    addDays(anchorDate, i),
  );
  const handlePrev = () => setAnchorDate((d) => addDays(d, -VISIBLE_COUNT));
  const handleNext = () => setAnchorDate((d) => addDays(d, VISIBLE_COUNT));

  return (
    <div className="w-full space-y-1.5">
      <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-xs px-2 py-2.5 flex items-center gap-1">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous dates"
          className="w-8 h-8 shrink-0 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 grid grid-cols-8 gap-1">
          {visibleDates.map((dateStr) => {
            const isSelected = dateStr === selectedDate;
            const fare = faresByDate[dateStr];
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onSelectDate(dateStr)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition cursor-pointer ${
                  isSelected
                    ? "bg-orange-500 text-white shadow-sm"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span
                  className={`text-[10px] font-semibold tracking-wide whitespace-nowrap ${isSelected ? "text-white/90" : "text-slate-400"}`}
                >
                  {formatDateLabel(dateStr)}
                </span>
                <span className="text-sm font-bold mt-0.5 flex items-center gap-1">
                  {loading && fare === undefined ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : fare !== undefined ? (
                    inr(fare)
                  ) : (
                    <span
                      className={
                        isSelected ? "text-white/70" : "text-slate-300"
                      }
                    >
                      —
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next dates"
          className="w-8 h-8 shrink-0 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Ab error dikhega, silent fail nahi hoga */}
      {errorMsg && !loading && (
        <p className="text-[11px] text-amber-700 px-2">{errorMsg}</p>
      )}
    </div>
  );
}
