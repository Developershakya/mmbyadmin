import React, { useState, useEffect } from "react";
import { X, MapPin, Bus, Loader2, Navigation, AlertCircle } from "lucide-react";
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

export default function BusBoardingDetailsModal({ isOpen, onClose, bus }) {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [boardingPoints, setBoardingPoints] = useState([]);
  const [droppingPoints, setDroppingPoints] = useState([]);

  useEffect(() => {
    if (!isOpen || !bus) return;

    let isMounted = true;
    setLoadError("");
    setBoardingPoints([]);
    setDroppingPoints([]);

    const loadDetails = async () => {
      setLoading(true);
      try {
        // Search response mein points already aate hain — pehle wahi dikhao (instant), phir API se refresh
        const searchBp = Array.isArray(bus.boardingPoints)
          ? bus.boardingPoints
          : [];
        const searchDp = Array.isArray(bus.droppingPoints)
          ? bus.droppingPoints
          : [];
        if (isMounted && (searchBp.length > 0 || searchDp.length > 0)) {
          setBoardingPoints(searchBp);
          setDroppingPoints(searchDp);
        }

        const res = await fetchDirectSrdv(
          "/api/admin-srdv/buses/boarding-points",
          {
            traceId: bus?.traceId || bus?.TraceId,
            srdvIndex: bus?.srdvIndex || bus?.SrdvIndex,
            resultIndex: bus?.resultIndex || bus?.ResultIndex,
          },
        );

        if (!isMounted) return;

        const bp = (
          Array.isArray(res?.BoardingPoints) ? res.BoardingPoints : searchBp
        )
          .map(normalizePoint)
          .filter(Boolean);
        const dp = (
          Array.isArray(res?.DroppingPoints) ? res.DroppingPoints : searchDp
        )
          .map(normalizePoint)
          .filter(Boolean);

        setBoardingPoints(bp);
        setDroppingPoints(dp);
      } catch (err) {
        console.warn("Boarding details notice:", err.message);
        if (isMounted) {
          // Agar search response se fallback data already mil chuka hai to error sirf notice ke taur pe
          const hasFallback =
            boardingPoints.length > 0 || droppingPoints.length > 0;
          if (!hasFallback) {
            setLoadError(
              err.message || "Could not load boarding & dropping points.",
            );
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, bus?.resultIndex, bus?.ResultIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-blue-600 shrink-0" />
              <h3 className="font-bold text-slate-900 text-base">
                Boarding &amp; Dropping Points
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {bus?.operator || "Bus Operator"} ·{" "}
              {bus?.from || bus?.origin || "Origin"} →{" "}
              {bus?.to || bus?.destination || "Destination"}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
          {loadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium whitespace-pre-line">
                {loadError}
              </span>
            </div>
          )}

          {loading &&
          boardingPoints.length === 0 &&
          droppingPoints.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-blue-600" />
              <p className="text-xs font-medium">
                Loading verified bus stops...
              </p>
            </div>
          ) : (
            <>
              {/* Boarding Points */}
              <div className="space-y-3">
                <h4 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-700">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Pickup / Boarding Points</span>
                </h4>

                {boardingPoints.length > 0 ? (
                  <div className="space-y-2">
                    {boardingPoints.map((bp) => (
                      <div
                        key={bp.Id}
                        className="p-3 bg-blue-50/50 border border-blue-200/80 rounded-xl flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-xs">
                            {bp.Name || "Boarding Point"}
                          </p>
                          {bp.Landmark && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {bp.Landmark}
                            </p>
                          )}
                          {bp.Address && (
                            <p className="text-[10px] text-slate-400">
                              {bp.Address}
                            </p>
                          )}
                          {bp.ContactNumber && (
                            <p className="text-[10px] text-slate-400">
                              Contact: {bp.ContactNumber}
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-blue-700 bg-white px-2 py-1 rounded-md border border-blue-200 shrink-0">
                          {bp.Time || ""}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 italic">
                    Specific boarding stops not specified by operator. Pickup at
                    main city origin depot.
                  </div>
                )}
              </div>

              {/* Dropping Points */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-emerald-700">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  <span>Drop-Off Points</span>
                </h4>

                {droppingPoints.length > 0 ? (
                  <div className="space-y-2">
                    {droppingPoints.map((dp) => (
                      <div
                        key={dp.Id}
                        className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-xs">
                            {dp.Name || "Dropping Point"}
                          </p>
                          {dp.Landmark && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {dp.Landmark}
                            </p>
                          )}
                          {dp.Address && (
                            <p className="text-[10px] text-slate-400">
                              {dp.Address}
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-emerald-700 bg-white px-2 py-1 rounded-md border border-emerald-200 shrink-0">
                          {dp.Time || ""}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 italic">
                    Specific dropping stops not specified by operator. Drop-off
                    at destination central bus stand.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
