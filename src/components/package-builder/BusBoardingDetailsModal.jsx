import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Bus, Loader2, Navigation } from 'lucide-react';
import { fetchBusBoardingDetailsApi } from '../../lib/packageBuilder/searchApi.js';
import { normalizeSrdvContext } from '../../lib/srdvContext.js';

export default function BusBoardingDetailsModal({
  isOpen,
  onClose,
  bus
}) {
  const [loading, setLoading] = useState(false);
  const [boardingPoints, setBoardingPoints] = useState([]);
  const [droppingPoints, setDroppingPoints] = useState([]);

  useEffect(() => {
    if (!isOpen || !bus) return;

    let isMounted = true;
    const loadDetails = async () => {
      setLoading(true);
      try {
        const res = await fetchBusBoardingDetailsApi(normalizeSrdvContext(bus));

        if (!isMounted) return;

        const bp = Array.isArray(res?.BoardingPoints)
          ? res.BoardingPoints
          : (Array.isArray(bus.boardingPoints) ? bus.boardingPoints : []);

        const dp = Array.isArray(res?.DroppingPoints)
          ? res.DroppingPoints
          : (Array.isArray(bus.droppingPoints) ? bus.droppingPoints : []);

        setBoardingPoints(bp);
        setDroppingPoints(dp);
      } catch (err) {
        console.warn('Boarding details notice:', err.message);
        const bp = Array.isArray(bus.boardingPoints) ? bus.boardingPoints : [];
        const dp = Array.isArray(bus.droppingPoints) ? bus.droppingPoints : [];
        setBoardingPoints(bp);
        setDroppingPoints(dp);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, bus]);

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
              {bus?.operator || 'Bus Operator'} · {bus?.origin || 'Origin'} → {bus?.destination || 'Destination'}
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
          {loading ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-blue-600" />
              <p className="text-xs font-medium">Loading verified bus stops...</p>
            </div>
          ) : (
            <>
              {/* Boarding Points */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-700">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Pickup / Boarding Points</span>
                </h4>

                {boardingPoints.length > 0 ? (
                  <div className="space-y-2">
                    {boardingPoints.map((bp, i) => (
                      <div
                        key={i}
                        className="p-3 bg-blue-50/50 border border-blue-200/80 rounded-xl flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{bp.CityPointName || bp.LocationName || 'Boarding Point'}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{bp.CityPointLocation || bp.Address || ''}</p>
                        </div>
                        <span className="font-bold text-blue-700 bg-white px-2 py-1 rounded-md border border-blue-200 shrink-0">
                          {bp.CityPointTime || bp.Time || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 italic">
                    Specific boarding stops not specified by operator. Pickup at main city origin depot.
                  </div>
                )}
              </div>

              {/* Dropping Points */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-emerald-700">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  <span>Drop-Off Points</span>
                </h4>

                {droppingPoints.length > 0 ? (
                  <div className="space-y-2">
                    {droppingPoints.map((dp, i) => (
                      <div
                        key={i}
                        className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{dp.CityPointName || dp.LocationName || 'Dropping Point'}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{dp.CityPointLocation || dp.Address || ''}</p>
                        </div>
                        <span className="font-bold text-emerald-700 bg-white px-2 py-1 rounded-md border border-emerald-200 shrink-0">
                          {dp.CityPointTime || dp.Time || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 italic">
                    Specific dropping stops not specified by operator. Drop-off at destination central bus stand.
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
