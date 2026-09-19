import React from 'react';
import { MapPin, Clock, Navigation, Car, Bus, ArrowRight } from 'lucide-react';
import RouteIcon from '../common/RouteIcon.jsx';

export default function JourneyTimeline({ route = [], stats = {} }) {
  if (!route || route.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs mb-8" id="journey-route-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#F97316]" />
            <span>My Journey Route</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step route and transit checkpoints
          </p>
        </div>
        {stats.travelMode && (
          <span className="text-xs font-semibold px-3 py-1 bg-orange-50 text-[#F97316] border border-orange-200/60 rounded-full flex items-center gap-1.5">
            {stats.travelMode}
          </span>
        )}
      </div>

      {/* Horizontal Timeline Container */}
      <div className="relative overflow-x-auto pb-4 pt-2">
        <div className="flex items-center min-w-[580px] justify-between relative px-2">
          {/* Background Connector Bar */}
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 z-0" />

          {route.map((step, idx) => {
            const isOrigin = idx === 0 || step.type === 'origin';
            const isDestination = idx === route.length - 1 || step.type === 'destination';

            return (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center max-w-[130px] group">
                {/* Step Circle Badge */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${
                    isOrigin
                      ? 'bg-blue-600 text-white border-2 border-white'
                      : isDestination
                      ? 'bg-[#F97316] text-white border-2 border-white'
                      : 'bg-white text-slate-700 border-2 border-slate-300'
                  }`}
                >
                  <RouteIcon
                    icon={step.icon || (isOrigin ? 'MapPin' : isDestination ? 'Landmark' : 'Navigation')}
                    iconLibrary={step.iconLibrary}
                    className="w-4 h-4"
                  />
                </div>

                {/* Step Details */}
                <div className="mt-2.5 space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]" title={step.name}>
                    {step.name}
                  </h4>
                  {step.time && (
                    <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{step.time}</span>
                    </p>
                  )}
                  {(step.distance || step.subtitle) && (
                    <p className="text-[10px] font-medium text-orange-600 bg-orange-50/70 px-1.5 py-0.5 rounded border border-orange-100 inline-block">
                      {step.distance || step.subtitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Strip */}
      {(stats.totalDistance || stats.totalTime || stats.tripDuration || stats.tripDays) && (
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {stats.totalDistance && (
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Distance</span>
              <span className="text-sm font-extrabold text-slate-800">{stats.totalDistance}</span>
            </div>
          )}
          {stats.totalTime && (
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Driving</span>
              <span className="text-sm font-extrabold text-slate-800">{stats.totalTime}</span>
            </div>
          )}
          {(stats.tripDuration || stats.tripDays) && (
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trip Duration</span>
              <span className="text-sm font-extrabold text-slate-800">{stats.tripDuration || stats.tripDays}</span>
            </div>
          )}
          {stats.travelMode && (
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mode</span>
              <span className="text-sm font-extrabold text-slate-800">{stats.travelMode}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
