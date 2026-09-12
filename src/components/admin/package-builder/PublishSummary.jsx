import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Package,
  Calendar,
  DollarSign,
  ShieldCheck,
  Save,
  Send,
  Copy,
  ChevronRight,
  Code,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function PublishSummary({
  packageData,
  onSaveDraft,
  onPublishPackage,
  onDuplicatePackage,
  onGoToTab
}) {
  const [showJson, setShowJson] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const days = packageData.days || [];
  const servicesConfig = packageData.servicesConfig || {};

  // Compute validation checks
  const validation = useMemo(() => {
    const checks = [];

    // 1. Package Name
    if (!packageData.name?.trim()) {
      checks.push({ status: 'error', message: 'Package Name is required.', tab: 1 });
    } else {
      checks.push({ status: 'success', message: `Package Name: "${packageData.name}" verified.` });
    }

    // 2. Destination
    if (!packageData.destination?.trim()) {
      checks.push({ status: 'error', message: 'Primary destination is required.', tab: 1 });
    } else {
      checks.push({ status: 'success', message: `Destination: ${packageData.destination}` });
    }

    // 3. Duration & Days
    if (days.length === 0) {
      checks.push({ status: 'error', message: 'At least 1 day itinerary is required.', tab: 2 });
    } else {
      checks.push({ status: 'success', message: `${days.length} day-by-day itinerary plans configured.` });
    }

    // 4. Day Locations check
    const missingDayLocations = days.filter(d => !d.location?.trim());
    if (missingDayLocations.length > 0) {
      checks.push({
        status: 'warning',
        message: `Day ${missingDayLocations.map(d => d.dayNumber).join(', ')} is missing a specific location name.`,
        tab: 2
      });
    }

    // 5. Flight configuration check
    const flightEnabledDays = days.filter(d => d.services?.flight?.enabled);
    flightEnabledDays.forEach(d => {
      if (!d.services?.flight?.from || !d.services?.flight?.to) {
        checks.push({
          status: 'warning',
          message: `Day ${d.dayNumber} Flight route is incomplete.`,
          tab: 2
        });
      }
    });

    // 6. Hotel configuration check
    const hotelEnabledDays = days.filter(d => d.services?.hotel?.enabled);
    hotelEnabledDays.forEach(d => {
      if (!d.services?.hotel?.selectedHotel && !d.services?.hotel?.hotelName) {
        checks.push({
          status: 'warning',
          message: `Day ${d.dayNumber} Hotel property not selected.`,
          tab: 2
        });
      }
    });

    // 7. Sightseeing check
    const sightseeingEnabledDays = days.filter(d => d.services?.sightseeing?.enabled);
    sightseeingEnabledDays.forEach(d => {
      if (!d.services?.sightseeing?.items?.length) {
        checks.push({
          status: 'warning',
          message: `Day ${d.dayNumber} Sightseeing is enabled but no attractions were added.`,
          tab: 2
        });
      }
    });

    const hasErrors = checks.some(c => c.status === 'error');
    const hasWarnings = checks.some(c => c.status === 'warning');

    return {
      checks,
      hasErrors,
      hasWarnings,
      canPublish: !hasErrors
    };
  }, [packageData, days]);

  const handlePublish = () => {
    if (!validation.canPublish) return;
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setPublishedSuccess(true);
      onPublishPackage();
    }, 600);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Published Success Banner */}
      {publishedSuccess && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between animate-scaleUp">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-emerald-900">Package Successfully Published!</h4>
              <p className="text-xs text-emerald-700">
                "{packageData.name}" is now live on the Make My Bharat Yatra customer portal and ready for booking.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xs">
            Status: Active
          </span>
        </div>
      )}

      {/* 1. Validation Checklist Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              validation.hasErrors ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              {validation.hasErrors ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pre-Publish Verification Checklist</h3>
              <p className="text-xs text-slate-500">System audit of required fields, itinerary integrity, and service APIs</p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
            validation.canPublish
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-rose-100 text-rose-800 border border-rose-300'
          }`}>
            {validation.canPublish ? 'Ready to Publish' : 'Action Required'}
          </span>
        </div>

        <div className="space-y-2">
          {validation.checks.map((check, index) => (
            <div
              key={index}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                check.status === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900 font-semibold'
                  : check.status === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50/40 border-emerald-100 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {check.status === 'error' && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                {check.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                {check.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                <span>{check.message}</span>
              </div>

              {check.tab && (
                <button
                  type="button"
                  onClick={() => onGoToTab(check.tab)}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer text-[10px]"
                >
                  Fix in Tab {check.tab}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Package Overview Summary Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Package Publication Specifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 block">Package Title</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate">{packageData.name}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 block">Destination</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">{packageData.destination}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 block">Duration & Nights</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {packageData.duration} / {packageData.nights}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200">
            <span className="text-[11px] font-bold text-[#F97316] block">Final Published Price</span>
            <span className="text-sm font-black text-slate-900 block mt-0.5">
              ₹{packageData.pricing?.finalPrice?.toLocaleString('en-IN') || '23,560'}
            </span>
          </div>
        </div>

        {/* Enabled Services & Customization Governance Badges */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 block mb-2.5">
            Configured Service Architecture:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'flight', label: 'Flight' },
              { key: 'hotel', label: 'Hotel' },
              { key: 'cab', label: 'Cab' },
              { key: 'bus', label: 'Bus' },
              { key: 'sightseeing', label: 'Sightseeing' },
              { key: 'activity', label: 'Activity' },
              { key: 'meal', label: 'Meal' }
            ].map(s => {
              const enabled = packageData.servicesConfig?.[s.key]?.enabled;
              const customizable = packageData.servicesConfig?.[s.key]?.customizable;

              return (
                <div
                  key={s.key}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                    enabled
                      ? 'bg-slate-50 border-slate-300 text-slate-800'
                      : 'bg-slate-100/60 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <span>{enabled ? '✓' : '✗'} {s.label}</span>
                  {enabled && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      customizable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {customizable ? 'Customizable' : 'Fixed'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Developer / API Architecture JSON Viewer */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-[#F97316]" />
            <span className="text-xs font-bold">Package Data Structure Schema (Ready for API Connection)</span>
          </div>
          <button
            type="button"
            onClick={() => setShowJson(!showJson)}
            className="text-[11px] font-bold text-[#F97316] hover:underline cursor-pointer"
          >
            {showJson ? 'Hide JSON Output' : 'View Payload Object'}
          </button>
        </div>

        {showJson && (
          <pre className="p-3 bg-black/60 rounded-xl text-[10px] font-mono text-emerald-400 max-h-64 overflow-y-auto border border-slate-800">
            {JSON.stringify(packageData, null, 2)}
          </pre>
        )}
      </div>

      {/* 4. Action Buttons */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onGoToTab(2)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Edit</span>
          </button>

          <button
            type="button"
            onClick={onDuplicatePackage}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1.5"
          >
            <Copy className="w-4 h-4 text-blue-600" />
            <span>Duplicate Package</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSaveDraft}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <button
            id="btn-publish-package-final"
            type="button"
            disabled={!validation.canPublish || isPublishing}
            onClick={handlePublish}
            className="px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer shadow-xs transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{isPublishing ? 'Publishing Itinerary...' : 'Publish Package'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
