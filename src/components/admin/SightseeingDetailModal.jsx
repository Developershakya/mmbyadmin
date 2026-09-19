import React from 'react';
import {
  X,
  MapPin,
  Clock,
  Calendar,
  IndianRupee,
  Navigation,
  ExternalLink,
  Edit2,
  Power,
  Compass,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

export default function SightseeingDetailModal({
  isOpen,
  onClose,
  place,
  onEdit,
  onToggleStatus
}) {
  if (!isOpen || !place) return null;

  const hasCoords = place.latitude && place.longitude;
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${place.name} ${place.city || place.cityName || ''}`
      )}`;

  return (
    <div
      id="sightseeing-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="sightseeing-detail-modal"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Cover Banner */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-900 shrink-0 overflow-hidden">
          <img
            src={
              place.image ||
              'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80'
            }
            alt={place.name}
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on cover */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md bg-orange-600/90 text-white text-[11px] font-bold tracking-wide uppercase">
                  {place.category || 'Sightseeing'}
                </span>
                <StatusBadge status={place.status || 'Active'} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                {place.name}
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Meta Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                City / Region
              </span>
              <p className="font-bold text-slate-800 truncate">
                {place.city || place.cityName || 'N/A'}
                {place.state ? `, ${place.state}` : ''}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Duration
              </span>
              <p className="font-bold text-slate-800 truncate">
                {place.duration || '2 - 3 Hours'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Best Season
              </span>
              <p className="font-bold text-slate-800 truncate">
                {place.bestTimeToVisit || 'October to March'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Entry Fee
              </span>
              <p className="font-bold text-slate-800 truncate">
                {place.entryFee || 'Free Entry'}
              </p>
            </div>
          </div>

          {/* Location & Coordinates */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>Location &amp; Coordinates</span>
            </h3>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
              <p className="text-xs text-slate-800 font-medium">
                {place.location || `${place.name}, ${place.city || place.cityName}`}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                  <span>Lat: {place.latitude || 'Not set'}</span>
                  <span>Lon: {place.longitude || 'Not set'}</span>
                </div>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Timings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Opening Time
              </span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{place.openingTime || '09:00 AM'}</span>
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Closing Time
              </span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{place.closingTime || '06:00 PM'}</span>
              </p>
            </div>
          </div>

          {/* Short Description */}
          {place.shortDescription && (
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Summary Highlight
              </h3>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                {place.shortDescription}
              </p>
            </div>
          )}

          {/* Comprehensive Narrative */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Detailed Description &amp; Heritage
            </h3>
            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
              {place.description || place.masterDescription || 'No extended description recorded.'}
            </p>
          </div>

          {/* Gallery Carousel / Thumbnails */}
          {Array.isArray(place.gallery) && place.gallery.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                <span>Photo Gallery ({place.gallery.length})</span>
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {place.gallery.map((img, i) => (
                  <a
                    key={i}
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative h-20 rounded-lg overflow-hidden border border-slate-200 group block"
                  >
                    <img
                      src={img}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Record Metadata */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <span>Slug: {place.slug}</span>
            {place.createdAt && (
              <span>Created: {new Date(place.createdAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => onToggleStatus(place)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Power className="w-3.5 h-3.5 text-slate-500" />
            <span>Set as {place.status === 'Active' ? 'Inactive' : 'Active'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(place);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 transition-colors shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Sightseeing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
