import React from 'react';
import { Quote } from 'lucide-react';

export default function ExperienceSection({ experience = {} }) {
  if (!experience || (!experience.quote && (!experience.photos || experience.photos.length === 0))) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 rounded-2xl p-6 sm:p-8 border border-orange-200/60 shadow-xs mb-10" id="experience-section">
      <div className="flex items-start gap-3.5 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center shrink-0">
          <Quote className="w-5 h-5 fill-[#F97316]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            My Experience
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal reflections and real traveler snapshots
          </p>
        </div>
      </div>

      {experience.quote && (
        <blockquote className="text-base sm:text-lg italic font-medium text-slate-800 leading-relaxed pl-4 border-l-4 border-[#F97316] mb-6">
          "{experience.quote}"
        </blockquote>
      )}

      {Array.isArray(experience.photos) && experience.photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {experience.photos.map((photo, pIdx) => (
            <div key={pIdx} className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 shadow-2xs group">
              <img
                src={photo}
                alt={`Traveler moment ${pIdx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
