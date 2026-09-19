import React from 'react';
import { Star, Clock, MapPin } from 'lucide-react';

export default function PlacesExploredSection({ places = [] }) {
  if (!places || places.length === 0) return null;

  return (
    <div className="mb-10" id="places-explored-section">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Places I Explored
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Key temples, sacred monuments, and landmarks visited during this journey
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
          {places.length} Places
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {places.map((place, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col group"
          >
            {/* Image with Number Badge */}
            <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
              <img
                src={place.image || 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=400&auto=format&fit=crop'}
                alt={place.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {place.number || idx + 1}
              </div>
              {place.rating && (
                <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-700 flex items-center gap-1 shadow-xs">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{place.rating}</span>
                </div>
              )}
            </div>

            {/* Place Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#F97316] transition-colors" title={place.name}>
                  {place.name}
                </h4>
                {(place.city || place.location) && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{place.city || place.location}</span>
                  </p>
                )}
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {place.description || place.masterDescription || 'A memorable spiritual stop full of positive energy.'}
                </p>
              </div>

              {place.timing && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-orange-600 font-medium bg-orange-50/50 px-2 py-1 rounded">
                  <Clock className="w-3 h-3 text-orange-500 shrink-0" />
                  <span className="truncate">{place.timing}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
