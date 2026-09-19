import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Route,
  Wallet,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Share2,
  Check,
  Compass
} from 'lucide-react';
import RouteMapLeaflet from './RouteMapLeaflet.jsx';

export default function RightRailSidebar({
  snapshot = {},
  tips = [],
  destination = 'Vrindavan',
  journeyRoute = [],
  stats = {},
  onNavigate
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePackageClick = () => {
    if (onNavigate) {
      onNavigate('/admin/packages');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/admin/packages';
    }
  };

  return (
    <aside className="space-y-6 w-full lg:w-64 xl:w-72 2xl:w-76 shrink-0" id="blog-right-rail">
      {/* 1. Trip Snapshot Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#F97316]" />
          <span>Trip Snapshot</span>
        </h4>
        <div className="grid grid-cols-2 gap-2.5 text-center">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <Calendar className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Days</span>
            <p className="text-base font-extrabold text-slate-800">{snapshot.days || '4'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <MapPin className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Places</span>
            <p className="text-base font-extrabold text-slate-800">{snapshot.places || '9'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <Route className="w-4 h-4 text-orange-500 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Distance</span>
            <p className="text-base font-extrabold text-slate-800">{snapshot.distance || '163 km'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <Wallet className="w-4 h-4 text-purple-500 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Spend</span>
            <p className="text-base font-extrabold text-slate-800">{snapshot.spend || '₹ 3,250'}</p>
          </div>
        </div>
      </div>

      {/* 2. Real Interactive Route Map Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Route className="w-4 h-4 text-[#F97316]" />
            <span>Interactive Route Map</span>
          </h4>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#F97316] border border-orange-200/60">
            Live GPS
          </span>
        </div>
        
        <RouteMapLeaflet
          route={journeyRoute}
          stats={stats || snapshot}
          height="220px"
          title={`${destination} Road Map`}
        />

        <div className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Interactive OpenStreetMap road route with waypoints</span>
        </div>
      </div>

      {/* Travel Tips Card */}
      {tips && tips.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Travel Tips</span>
          </h4>
          <ul className="space-y-2.5">
            {tips.map((tip, tIdx) => (
              <li key={tIdx} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. Share Journey Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[#F97316]" />
          <span>Share My Journey</span>
        </h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Copied!</span>
              </>
            ) : (
              <span>Copy Link</span>
            )}
          </button>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
            title="Share on WhatsApp"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </aside>
  );
}
