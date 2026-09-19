import React from 'react';
import { MapPin } from 'lucide-react';

export default function PlacesCoveredSection({ places = [] }) {
  if (!places || places.length === 0) return null;

  return (
    <div className="mb-10" id="places-covered-section">
      <div className="mb-5">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Places Covered
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Must-visit spots and sights featured in this travel guide
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {places.map((place, idx) => (
          <div
            key={idx}
            className="group bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col"
          >
            <div className="aspect-square w-full overflow-hidden bg-slate-100 relative">
              <img
                src={place.image || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=300&auto=format&fit=crop'}
                alt={place.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <span className="text-xs font-bold block truncate leading-tight drop-shadow-xs">
                  {place.name}
                </span>
                {(place.city || place.location) && (
                  <span className="text-[10px] text-slate-200 block truncate drop-shadow-xs">
                    {place.city || place.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
