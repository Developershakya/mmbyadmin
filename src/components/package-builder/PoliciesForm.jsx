import React, { useState } from 'react';
import {
  ShieldAlert,
  CalendarClock,
  CheckCircle2,
  XCircle,
  FileText,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles
} from 'lucide-react';

const DEFAULT_CANCELLATION_RULES = [
  { timeframe: '30+ Days Before Departure', charge: '10% of Package Value', refund: '90% Refund within 7 working days' },
  { timeframe: '15 to 29 Days Before Departure', charge: '25% of Package Value', refund: '75% Refund within 7 working days' },
  { timeframe: '7 to 14 Days Before Departure', charge: '50% of Package Value', refund: '50% Refund within 7 working days' },
  { timeframe: 'Within 7 Days of Departure / No Show', charge: '100% of Package Value', refund: 'Non-refundable' }
];

const DEFAULT_DATE_CHANGE_RULES = [
  { timeframe: 'Up to 15 Days Before Departure', charge: 'Free Date Rescheduling', remark: 'Hotel & airline fare difference applies' },
  { timeframe: '7 to 14 Days Before Departure', charge: '₹1,500 per person change fee', remark: '+ airline/hotel fare difference' },
  { timeframe: 'Less than 7 Days Before Departure', charge: 'Subject to Supplier Approval', remark: 'Treated as cancellation if not approved' }
];

const DEFAULT_INCLUSIONS = [
  'Accommodation in selected hotel / resort',
  'Daily breakfast and meals as per package plan',
  'All sightseeing and transfers by private vehicle',
  'Toll taxes, state permits, parking fees, and driver allowances'
];

const DEFAULT_EXCLUSIONS = [
  'Airfare or train fare unless explicitly added to itinerary',
  'Personal expenses such as laundry, calls, and minibar',
  'Monument entry fees, camera charges, and activity passes',
  'Any item not specified in package inclusions'
];

const DEFAULT_TERMS = [
  'All package rates are subject to availability at the time of confirmed booking.',
  'Standard hotel check-in time is 12:00 PM / 02:00 PM and check-out is 10:00 AM / 11:00 AM.',
  'Valid Government ID proof (Aadhar / Passport / Voter ID) is mandatory for all travelers at check-in.',
  'AC will not operate in hill stations or when vehicle is parked/idle.',
  'Any changes or deviations in route requested by the traveler will attract additional charges.'
];

export default function PoliciesForm({
  packageData,
  setPackageData,
  onBack,
  onContinue,
  showToast = (msg) => console.log(msg)
}) {
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [newTerm, setNewTerm] = useState('');

  // Normalize cancellation policy
  const cancellationRules = packageData.cancellationPolicy?.rules || DEFAULT_CANCELLATION_RULES;
  const cancellationNotes = packageData.cancellationPolicy?.notes ?? 'All cancellations must be communicated in writing to support@makemybharatyatra.com.';

  // Normalize date change policy
  const dateChangeRules = packageData.dateChangePolicy?.rules || DEFAULT_DATE_CHANGE_RULES;
  const dateChangeNotes = packageData.dateChangePolicy?.notes ?? 'Date rescheduling is subject to hotel and airline room/seat availability and applicable seasonal rate differences.';

  const inclusions = packageData.inclusions || DEFAULT_INCLUSIONS;
  const exclusions = packageData.exclusions || DEFAULT_EXCLUSIONS;
  const terms = packageData.terms?.length ? packageData.terms : DEFAULT_TERMS;

  // --- Cancellation Rule Handlers ---
  const updateCancellationRule = (index, field, value) => {
    const updated = [...cancellationRules];
    updated[index] = { ...updated[index], [field]: value };
    setPackageData((prev) => ({
      ...prev,
      cancellationPolicy: {
        ...(prev.cancellationPolicy || {}),
        rules: updated
      }
    }));
  };

  const addCancellationRule = () => {
    const updated = [
      ...cancellationRules,
      { timeframe: 'Custom Timeframe', charge: 'Custom Fee', refund: 'Custom Refund' }
    ];
    setPackageData((prev) => ({
      ...prev,
      cancellationPolicy: {
        ...(prev.cancellationPolicy || {}),
        rules: updated
      }
    }));
  };

  const removeCancellationRule = (index) => {
    const updated = cancellationRules.filter((_, i) => i !== index);
    setPackageData((prev) => ({
      ...prev,
      cancellationPolicy: {
        ...(prev.cancellationPolicy || {}),
        rules: updated
      }
    }));
  };

  // --- Date Change Rule Handlers ---
  const updateDateChangeRule = (index, field, value) => {
    const updated = [...dateChangeRules];
    updated[index] = { ...updated[index], [field]: value };
    setPackageData((prev) => ({
      ...prev,
      dateChangePolicy: {
        ...(prev.dateChangePolicy || {}),
        rules: updated
      }
    }));
  };

  const addDateChangeRule = () => {
    const updated = [
      ...dateChangeRules,
      { timeframe: 'Custom Timeframe', charge: 'Custom Change Fee', remark: 'Custom Remark' }
    ];
    setPackageData((prev) => ({
      ...prev,
      dateChangePolicy: {
        ...(prev.dateChangePolicy || {}),
        rules: updated
      }
    }));
  };

  const removeDateChangeRule = (index) => {
    const updated = dateChangeRules.filter((_, i) => i !== index);
    setPackageData((prev) => ({
      ...prev,
      dateChangePolicy: {
        ...(prev.dateChangePolicy || {}),
        rules: updated
      }
    }));
  };

  // --- Inclusions Handlers ---
  const handleAddInclusion = () => {
    if (!newInclusion.trim()) return;
    setPackageData((prev) => ({
      ...prev,
      inclusions: [...(prev.inclusions || DEFAULT_INCLUSIONS), newInclusion.trim()]
    }));
    setNewInclusion('');
  };

  const handleRemoveInclusion = (idx) => {
    setPackageData((prev) => ({
      ...prev,
      inclusions: (prev.inclusions || DEFAULT_INCLUSIONS).filter((_, i) => i !== idx)
    }));
  };

  // --- Exclusions Handlers ---
  const handleAddExclusion = () => {
    if (!newExclusion.trim()) return;
    setPackageData((prev) => ({
      ...prev,
      exclusions: [...(prev.exclusions || DEFAULT_EXCLUSIONS), newExclusion.trim()]
    }));
    setNewExclusion('');
  };

  const handleRemoveExclusion = (idx) => {
    setPackageData((prev) => ({
      ...prev,
      exclusions: (prev.exclusions || DEFAULT_EXCLUSIONS).filter((_, i) => i !== idx)
    }));
  };

  // --- Terms Handlers ---
  const handleAddTerm = () => {
    if (!newTerm.trim()) return;
    setPackageData((prev) => ({
      ...prev,
      terms: [...(prev.terms?.length ? prev.terms : DEFAULT_TERMS), newTerm.trim()]
    }));
    setNewTerm('');
  };

  const handleRemoveTerm = (idx) => {
    setPackageData((prev) => ({
      ...prev,
      terms: (prev.terms?.length ? prev.terms : DEFAULT_TERMS).filter((_, i) => i !== idx)
    }));
  };

  const handleResetToDefaults = () => {
    setPackageData((prev) => ({
      ...prev,
      cancellationPolicy: {
        rules: DEFAULT_CANCELLATION_RULES,
        notes: 'All cancellations must be communicated in writing to support@makemybharatyatra.com.'
      },
      dateChangePolicy: {
        rules: DEFAULT_DATE_CHANGE_RULES,
        notes: 'Date rescheduling is subject to hotel and airline room/seat availability and applicable seasonal rate differences.'
      },
      inclusions: DEFAULT_INCLUSIONS,
      exclusions: DEFAULT_EXCLUSIONS,
      terms: DEFAULT_TERMS
    }));
    showToast('Reset policies and terms to standard travel industry defaults.', 'info');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Stage Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
              04
            </span>
            <h2 className="text-lg font-bold text-[#0F172A]">Package Policies &amp; Terms</h2>
          </div>
          <p className="text-xs text-slate-500">
            Configure cancellation slabs, date modification rules, inclusions, exclusions, and booking terms for this package.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToDefaults}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Industry Defaults</span>
        </button>
      </div>

      {/* 1. CANCELLATION POLICY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#0F172A]">Cancellation &amp; Refund Policy</h3>
              <p className="text-[11px] text-slate-500">Time-based refund deductions and slab penalties</p>
            </div>
          </div>
          <button
            type="button"
            onClick={addCancellationRule}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slabs</span>
          </button>
        </div>

        {/* Slabs Table */}
        <div className="space-y-3">
          {cancellationRules.map((rule, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition"
            >
              <div className="md:col-span-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Timeframe
                </label>
                <input
                  type="text"
                  value={rule.timeframe || ''}
                  onChange={(e) => updateCancellationRule(idx, 'timeframe', e.target.value)}
                  placeholder="e.g. 15 to 30 Days before departure"
                  className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Cancellation Fee / Charge
                </label>
                <input
                  type="text"
                  value={rule.charge || ''}
                  onChange={(e) => updateCancellationRule(idx, 'charge', e.target.value)}
                  placeholder="e.g. 25% of Package Value"
                  className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Refund Terms
                </label>
                <input
                  type="text"
                  value={rule.refund || ''}
                  onChange={(e) => updateCancellationRule(idx, 'refund', e.target.value)}
                  placeholder="e.g. 75% Refund within 7 days"
                  className="w-full text-xs font-medium text-emerald-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="md:col-span-1 flex justify-end pt-3 md:pt-0">
                <button
                  type="button"
                  onClick={() => removeCancellationRule(idx)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Remove Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Cancellation Policy Notes &amp; Remarks
          </label>
          <textarea
            rows={2}
            value={cancellationNotes}
            onChange={(e) =>
              setPackageData((prev) => ({
                ...prev,
                cancellationPolicy: {
                  ...(prev.cancellationPolicy || {}),
                  notes: e.target.value
                }
              }))
            }
            placeholder="Special terms regarding flight tickets cancellation, peak season non-refundable dates, etc."
            className="w-full text-xs text-slate-700 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
          />
        </div>
      </div>

      {/* 2. DATE CHANGE POLICY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#0F172A]">Date Change &amp; Postponement Policy</h3>
              <p className="text-[11px] text-slate-500">Rules governing trip rescheduling and date modification fees</p>
            </div>
          </div>
          <button
            type="button"
            onClick={addDateChangeRule}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slabs</span>
          </button>
        </div>

        {/* Date Change Rules Table */}
        <div className="space-y-3">
          {dateChangeRules.map((rule, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition"
            >
              <div className="md:col-span-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Timeframe
                </label>
                <input
                  type="text"
                  value={rule.timeframe || ''}
                  onChange={(e) => updateDateChangeRule(idx, 'timeframe', e.target.value)}
                  placeholder="e.g. Up to 15 Days Before Departure"
                  className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Modification Fee
                </label>
                <input
                  type="text"
                  value={rule.charge || ''}
                  onChange={(e) => updateDateChangeRule(idx, 'charge', e.target.value)}
                  placeholder="e.g. Free Date Rescheduling"
                  className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Remark / Conditions
                </label>
                <input
                  type="text"
                  value={rule.remark || ''}
                  onChange={(e) => updateDateChangeRule(idx, 'remark', e.target.value)}
                  placeholder="e.g. Hotel fare difference applies"
                  className="w-full text-xs font-medium text-blue-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-1 flex justify-end pt-3 md:pt-0">
                <button
                  type="button"
                  onClick={() => removeDateChangeRule(idx)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Remove Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Date Change Policy Notes &amp; Remarks
          </label>
          <textarea
            rows={2}
            value={dateChangeNotes}
            onChange={(e) =>
              setPackageData((prev) => ({
                ...prev,
                dateChangePolicy: {
                  ...(prev.dateChangePolicy || {}),
                  notes: e.target.value
                }
              }))
            }
            placeholder="Conditions under which airline or hotel dates may be altered..."
            className="w-full text-xs text-slate-700 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* 3. INCLUSIONS & EXCLUSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INCLUSIONS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-sm text-[#0F172A]">Package Inclusions</h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newInclusion}
              onChange={(e) => setNewInclusion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInclusion())}
              placeholder="e.g. Complimentary airport pickup..."
              className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 focus:border-emerald-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddInclusion}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shrink-0"
            >
              Add
            </button>
          </div>

          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {inclusions.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start justify-between gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-700"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveInclusion(idx)}
                  className="text-slate-400 hover:text-rose-600 transition shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* EXCLUSIONS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-sm text-[#0F172A]">Package Exclusions</h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newExclusion}
              onChange={(e) => setNewExclusion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExclusion())}
              placeholder="e.g. Personal monument entry fees..."
              className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 focus:border-rose-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddExclusion}
              className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shrink-0"
            >
              Add
            </button>
          </div>

          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {exclusions.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start justify-between gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-700"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExclusion(idx)}
                  className="text-slate-400 hover:text-rose-600 transition shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. TERMS & CONDITIONS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </span>
          <h3 className="font-bold text-sm text-[#0F172A]">General Terms &amp; Conditions</h3>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTerm())}
            placeholder="e.g. Valid government ID mandatory for all travelers..."
            className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 focus:border-amber-500 outline-none"
          />
          <button
            type="button"
            onClick={handleAddTerm}
            className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer shrink-0"
          >
            Add Term
          </button>
        </div>

        <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {terms.map((term, idx) => (
            <li
              key={idx}
              className="flex items-start justify-between gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-700"
            >
              <div className="flex items-start gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <span className="leading-snug">{term}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveTerm(idx)}
                className="text-slate-400 hover:text-rose-600 transition shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pricing</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <span>Continue to Customer Preview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
