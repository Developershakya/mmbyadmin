import React from 'react';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

export default function FoodTipsSection({ tips = [], image }) {
  if (!tips || tips.length === 0) return null;

  return (
    <section className="mb-12 scroll-mt-24" id="tips">
      <div className="bg-gradient-to-br from-orange-50/60 via-white to-amber-50/50 rounded-2xl p-6 sm:p-8 border border-orange-200/70 shadow-xs">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F97316] flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Food Tips for Travelers
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            {tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-orange-100/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {tip}
                </p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-md border-2 border-white">
              <img
                src={image || 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop'}
                alt="Food tour highlights"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
