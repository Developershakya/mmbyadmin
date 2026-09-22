import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Building2,
  ChevronRight,
  Loader2,
  Phone,
  Sparkles
} from 'lucide-react';
import { fetchHotelInfoApi } from '../../lib/packageBuilder/searchApi.js';

export default function HotelInfoModal({
  isOpen,
  onClose,
  hotel,
  onSelectRoom
}) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  useEffect(() => {
    if (!isOpen || !hotel) return;

    let isMounted = true;
    const loadInfo = async () => {
      setLoading(true);
      try {
        const res = await fetchHotelInfoApi({
          hotelCode: hotel.hotelCode || hotel.id || 'HTL-101',
          traceId: hotel.traceId || `TRC-${Date.now()}`
        });

        if (!isMounted) return;

        const info = res?.HotelDetails || res?.data?.HotelDetails || res?.hotel || null;
        setDetails(extractHotelDetails(hotel, info));
      } catch (err) {
        console.warn('Hotel info fetch notice:', err.message);
        if (isMounted) {
          setDetails(extractHotelDetails(hotel, null));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInfo();

    return () => {
      isMounted = false;
    };
  }, [isOpen, hotel]);

  const extractHotelDetails = (h, info) => {
    return {
      HotelName: info?.HotelName || h?.name || h?.hotelName || 'Hotel',
      StarRating: Number(info?.StarRating || h?.rating || h?.starRating || 0),
      Address: info?.Address || h?.address || h?.location || '',
      PinCode: info?.PinCode || '',
      PhoneNumber: info?.PhoneNumber || '',
      CheckInTime: info?.CheckInTime || '12:00 PM',
      CheckOutTime: info?.CheckOutTime || '11:00 AM',
      Description: info?.Description || h?.description || '',
      HotelPolicy: info?.HotelPolicy || h?.policy || '',
      Attractions: Array.isArray(info?.Attractions) ? info.Attractions : [],
      Facilities: Array.isArray(info?.Facilities) ? info.Facilities : (Array.isArray(h?.amenities) ? h.amenities : []),
      Images: Array.isArray(info?.Images) && info.Images.length > 0 ? info.Images : (h?.image ? [h.image] : [])
    };
  };

  if (!isOpen) return null;

  // Split policies by delimiter '|'
  const rawPolicies = details?.HotelPolicy || '';
  const policyItems = rawPolicies
    .split(/\||\r?\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 5);

  const images = details?.Images?.length ? details.Images : (hotel?.image ? [hotel.image] : []);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
              <h3 className="font-bold text-slate-900 text-lg leading-snug">
                {details?.HotelName || hotel?.name || 'Hotel Details'}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {details?.StarRating || hotel?.rating || 4} Star Property
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {details?.Address || hotel?.location || 'Manali'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading && !details ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-xs font-medium">Loading verified property details &amp; policies...</p>
            </div>
          ) : (
            <>
              {/* Photo Gallery with Thumbnails */}
              <div className="space-y-2">
                <div className="h-56 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                  <img
                    src={images[activePhotoIdx] || images[0]}
                    alt="Hotel"
                    className="w-full h-full object-cover transition duration-300"
                  />
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs">
                    {activePhotoIdx + 1} / {images.length} Photos
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((imgUrl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActivePhotoIdx(i)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                          activePhotoIdx === i ? 'border-blue-600 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Check-in / Check-out timing badges */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Check-In</span>
                    <strong className="text-slate-800">{details?.CheckInTime || '12:00 PM'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Check-Out</span>
                    <strong className="text-slate-800">{details?.CheckOutTime || '11:00 AM'}</strong>
                  </div>
                </div>
              </div>

              {/* Property Overview */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">About Property</h4>
                {details?.Description ? (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {details.Description}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Property description not provided by supplier.
                  </p>
                )}
              </div>

              {/* Facilities Chips */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Amenities &amp; Facilities</h4>
                {details?.Facilities?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {details.Facilities.map((fac, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        {fac}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Amenities and facility details not provided by supplier for this property.
                  </p>
                )}
              </div>

              {/* Hotel Policies (Delimited by '|') */}
              <div className="space-y-2.5 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
                <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Hotel Policies &amp; House Rules</span>
                </h4>
                {policyItems.length > 0 ? (
                  <ul className="space-y-2 text-xs text-slate-700">
                    {policyItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Standard check-in and hotel policies apply. Specific property house rules not provided by supplier.
                  </p>
                )}
              </div>

              {/* Nearby Attractions */}
              {details?.Attractions?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">Nearby Attractions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    {details.Attractions.map((att, i) => (
                      <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{att}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close Details
          </button>
          {onSelectRoom && (
            <button
              type="button"
              onClick={() => {
                onSelectRoom(hotel, details);
              }}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>Select Room</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
