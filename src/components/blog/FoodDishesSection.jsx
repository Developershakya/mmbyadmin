import React from 'react';
import { Utensils } from 'lucide-react';

export default function FoodDishesSection({ dishes = [] }) {
  if (!dishes || dishes.length === 0) return null;

  return (
    <section className="mb-12 scroll-mt-24" id="dishes">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Utensils className="w-5 h-5 text-[#F97316]" />
          <span>Must Try Dishes</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Handcrafted regional favorites and traditional delicacies you cannot afford to miss
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {dishes.map((dish, dIdx) => (
          <div
            key={dIdx}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col"
          >
            <div className="aspect-4/3 w-full overflow-hidden bg-slate-100 relative">
              <img
                src={dish.image || 'https://images.unsplash.com/photo-1626100731599-8c5f0f8e8c1a?q=80&w=400&auto=format&fit=crop'}
                alt={dish.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#F97316] transition-colors">
                  {dish.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {dish.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
