import React from 'react';
import { Store, Star, MapPin } from 'lucide-react';

export default function FoodPlacesSection({ places = [] }) {
  if (!places || places.length === 0) return null;

  return (
    <section className="mb-12 scroll-mt-24" id="places">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Store className="w-5 h-5 text-[#F97316]" />
          <span>Best Places to Eat</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Iconic heritage dining halls, legendary street stalls, and famous restaurants
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {places.map((place, pIdx) => (
          <div
            key={pIdx}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col"
          >
            <div className="aspect-4/3 w-full overflow-hidden bg-slate-100 relative">
              <img
                src={place.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=300&auto=format&fit=crop'}
                alt={place.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              {place.rating && (
                <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-700 flex items-center gap-1 shadow-xs">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{place.rating}</span>
                </div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#F97316] transition-colors" title={place.name}>
                  {place.name}
                </h3>
                {place.city && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{place.city}</span>
                  </p>
                )}
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {place.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
