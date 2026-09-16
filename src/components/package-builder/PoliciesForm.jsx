import React, { useState } from 'react';
import {
  ShieldAlert,
  CalendarClock,
  CheckCircle2,
  XCircle,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  CreditCard,
  Building,
  Car,
  Baby,
  RefreshCw,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Save,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { DEFAULT_POLICY_VISIBILITY } from '../../lib/customerPackageData.js';

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

const POLICY_PRESETS = [
  {
    type: 'booking',
    title: 'Booking Policy',
    icon: Bookmark,
    color: 'emerald',
    defaultPoints: [
      'Initial booking token of 25% is required to block flights and luxury accommodations.',
      'Package confirmation voucher will be issued within 24 hours of receiving the advance token.',
      'Guest details including full names as per valid government ID must be shared at the time of booking.'
    ]
  },
  {
    type: 'payment',
    title: 'Payment Policy',
    icon: CreditCard,
    color: 'blue',
    defaultPoints: [
      '25% advance payment at the time of package confirmation.',
      '50% payment 20 days prior to departure date.',
      'Remaining 25% balance payment 7 days prior to departure or upon arrival voucher handover.'
    ]
  },
  {
    type: 'refund',
    title: 'Refund Policy',
    icon: RefreshCw,
    color: 'amber',
    defaultPoints: [
      'Eligible refunds are processed back to the original payment source within 5 to 7 business working days.',
      'Bank convenience fees and non-refundable airline cancellation charges are deducted from the refund sum.',
      'No refund claims will be entertained after 30 days of completion of the tour.'
    ]
  },
  {
    type: 'child',
    title: 'Child Policy',
    icon: Baby,
    color: 'pink',
    defaultPoints: [
      'Infants below 2 years of age travel complimentary (without extra bed and seat).',
      'Children aged 2 to 5 years: Sharing bed with parents complimentary in hotel; transport seat charges applicable if requested.',
      'Children aged 6 to 11 years: Charged under Child with Bed (CWB) or Child No Bed (CNB) rate plan.',
      'Children aged 12 years and above are considered adults with full bed and meals.'
    ]
  },
  {
    type: 'hotel',
    title: 'Hotel & Room Policy',
    icon: Building,
    color: 'indigo',
    defaultPoints: [
      'Standard hotel check-in: 02:00 PM | Check-out: 11:00 AM. Early check-in is subject to room availability and hotel discretion.',
      'Base category rooms are assigned unless an upgraded room type is explicitly selected in the voucher.',
      'Hot water timings in high-altitude hill resorts may be scheduled (e.g. 7 AM to 11 AM and 6 PM to 9 PM).'
    ]
  },
  {
    type: 'transportation',
    title: 'Transportation & Vehicle Policy',
    icon: Car,
    color: 'purple',
    defaultPoints: [
      'Vehicle is provided on a point-to-point basis strictly as per the confirmed itinerary and not on disposal.',
      'Air conditioning will be switched off in hill areas and steep mountain ascents for engine safety.',
      'Driver working hours: 08:30 AM to 08:00 PM. Night driving is avoided on hilly roads for traveler safety.'
    ]
  },
  {
    type: 'general',
    title: 'General Tour Policy',
    icon: ShieldAlert,
    color: 'slate',
    defaultPoints: [
      'Itinerary timings are indicative and may be adjusted on ground due to weather conditions, road closures, or local festivals.',
      'Travelers are advised to carry sufficient warm clothes and personal medications for high altitude regions.',
      'Travel insurance is strongly recommended for all domestic and international tours.'
    ]
  }
];

export default function PoliciesForm({
  packageData,
  setPackageData,
  onBack,
  onContinue,
  onSaveDraft,
  showToast = (msg) => console.log(msg)
}) {
  // Local input states for adding items
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [newTerm, setNewTerm] = useState('');

  // Editing states for in-place edits
  const [editingTermIdx, setEditingTermIdx] = useState(null);
  const [editingTermText, setEditingTermText] = useState('');

  const [editingIncIdx, setEditingIncIdx] = useState(null);
  const [editingIncText, setEditingIncText] = useState('');

  const [editingExcIdx, setEditingExcIdx] = useState(null);
  const [editingExcText, setEditingExcText] = useState('');

  // Custom policy addition state
  const [showAddPolicyMenu, setShowAddPolicyMenu] = useState(false);
  const [customPolicyTitle, setCustomPolicyTitle] = useState('');
  const [newPolicyPointText, setNewPolicyPointText] = useState({}); // keyed by policy index
  const [editingPolicyPoint, setEditingPolicyPoint] = useState(null); // { policyIdx, pointIdx, text }

  // Normalized states
  const cancellationRules = packageData.cancellationPolicy?.rules || DEFAULT_CANCELLATION_RULES;
  const cancellationNotes = packageData.cancellationPolicy?.notes ?? 'All cancellations must be communicated in writing to support@makemybharatyatra.com. Refund processing takes 5-7 working days.';

  const dateChangeRules = packageData.dateChangePolicy?.rules || DEFAULT_DATE_CHANGE_RULES;
  const dateChangeNotes = packageData.dateChangePolicy?.notes ?? 'Date rescheduling is subject to hotel and airline room/seat availability and applicable seasonal rate differences.';

  const inclusions = packageData.inclusions?.length ? packageData.inclusions : DEFAULT_INCLUSIONS;
  const exclusions = packageData.exclusions?.length ? packageData.exclusions : DEFAULT_EXCLUSIONS;
  const terms = (packageData.terms?.length ? packageData.terms : packageData.termsAndConditions?.length ? packageData.termsAndConditions : DEFAULT_TERMS);
  const otherPolicies = packageData.otherPolicies || [];

  const policyVisibility = {
    ...DEFAULT_POLICY_VISIBILITY,
    ...(packageData.policyVisibility || {})
  };

  const handleTogglePolicyVisibility = (key, customPolIdx = null) => {
    const isCurrentlyVisible = policyVisibility[key] !== false;
    const nextVal = !isCurrentlyVisible;

    setPackageData((prev) => {
      const updatedVis = {
        ...DEFAULT_POLICY_VISIBILITY,
        ...(prev.policyVisibility || {}),
        [key]: nextVal
      };

      let updatedOther = prev.otherPolicies;
      if (customPolIdx !== null && Array.isArray(prev.otherPolicies)) {
        updatedOther = prev.otherPolicies.map((pol, idx) => {
          if (idx === customPolIdx) {
            return { ...pol, enabled: nextVal, visible: nextVal };
          }
          return pol;
        });
      }

      return {
        ...prev,
        policyVisibility: updatedVis,
        ...(updatedOther ? { otherPolicies: updatedOther } : {})
      };
    });
  };

  // Helper to reorder array
  const moveItem = (arr, fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= arr.length) return arr;
    const copy = [...arr];
    const [item] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, item);
    return copy;
  };

  // --- Cancellation Policy Handlers ---
  const handleUpdateCancellationRule = (index, field, value) => {
    const updated = [...cancellationRules];
    updated[index] = { ...updated[index], [field]: value };
    setPackageData((prev) => ({
      ...prev,
      cancellationPolicy: {
        ...(prev.cancellationPolicy || {}),
        rules: updated,
        notes: cancellationNotes
      }
    }));
  };

  const handleAddCancellationRule = () => {
    const updated = [
      ...cancellationRules,
      { timeframe: 'New Timeframe', charge: '25% of Package Value', refund: '75% Refund' }
    ];
    setPackageData((prev) => ({
      ...prev,
      cancellationPolicy: {
        ...(prev.cancellationPolicy || {}),
        rules: updated,
        notes: cancellationNotes
      }
    }));
    showToast('Added cancellation rule slab', 'success');
  };

  const handleRemoveCancellationRule = (index) => {
    const updated = cancellationRules.filter((_, i) => i !== index);
    setPackageData((prev) => ({
      ...prev,
      cancellationPolicy: {
        ...(prev.cancellationPolicy || {}),
        rules: updated,
        notes: cancellationNotes
      }
    }));
  };

  const handleMoveCancellationRule = (index, direction) => {
    const target = index + direction;
    const reordered = moveItem(cancellationRules, index, target);
    setPackageData((prev) => ({
      ...prev,
      cancellationPolicy: {
        ...(prev.cancellationPolicy || {}),
        rules: reordered
      }
    }));
  };

  const handleUpdateCancellationNotes = (text) => {
    setPackageData((prev) => ({
      ...prev,
      cancellationPolicy: {
        ...(prev.cancellationPolicy || {}),
        rules: cancellationRules,
        notes: text
      }
    }));
  };

  // --- Date Change Policy Handlers ---
  const handleUpdateDateChangeRule = (index, field, value) => {
    const updated = [...dateChangeRules];
    updated[index] = { ...updated[index], [field]: value };
    setPackageData((prev) => ({
      ...prev,
      dateChangePolicy: {
        ...(prev.dateChangePolicy || {}),
        rules: updated,
        notes: dateChangeNotes
      }
    }));
  };

  const handleAddDateChangeRule = () => {
    const updated = [
      ...dateChangeRules,
      { timeframe: 'New Timeframe', charge: '₹1,000 per person change fee', remark: '+ Fare difference' }
    ];
    setPackageData((prev) => ({
      ...prev,
      dateChangePolicy: {
        ...(prev.dateChangePolicy || {}),
        rules: updated,
        notes: dateChangeNotes
      }
    }));
    showToast('Added date change rule', 'success');
  };

  const handleRemoveDateChangeRule = (index) => {
    const updated = dateChangeRules.filter((_, i) => i !== index);
    setPackageData((prev) => ({
      ...prev,
      dateChangePolicy: {
        ...(prev.dateChangePolicy || {}),
        rules: updated,
        notes: dateChangeNotes
      }
    }));
  };

  const handleMoveDateChangeRule = (index, direction) => {
    const target = index + direction;
    const reordered = moveItem(dateChangeRules, index, target);
    setPackageData((prev) => ({
      ...prev,
      dateChangePolicy: {
        ...(prev.dateChangePolicy || {}),
        rules: reordered
      }
    }));
  };

  const handleUpdateDateChangeNotes = (text) => {
    setPackageData((prev) => ({
      ...prev,
      dateChangePolicy: {
        ...(prev.dateChangePolicy || {}),
        rules: dateChangeRules,
        notes: text
      }
    }));
  };

  // --- Terms & Conditions Handlers ---
  const handleAddTerm = () => {
    if (!newTerm.trim()) return;
    const updated = [...terms, newTerm.trim()];
    setPackageData((prev) => ({
      ...prev,
      terms: updated,
      termsAndConditions: updated
    }));
    setNewTerm('');
    showToast('Added term & condition', 'success');
  };

  const handleSaveEditTerm = (index) => {
    if (!editingTermText.trim()) return;
    const updated = [...terms];
    updated[index] = editingTermText.trim();
    setPackageData((prev) => ({
      ...prev,
      terms: updated,
      termsAndConditions: updated
    }));
    setEditingTermIdx(null);
    setEditingTermText('');
  };

  const handleRemoveTerm = (index) => {
    const updated = terms.filter((_, i) => i !== index);
    setPackageData((prev) => ({
      ...prev,
      terms: updated,
      termsAndConditions: updated
    }));
  };

  const handleMoveTerm = (index, direction) => {
    const target = index + direction;
    const reordered = moveItem(terms, index, target);
    setPackageData((prev) => ({
      ...prev,
      terms: reordered,
      termsAndConditions: reordered
    }));
  };

  // --- Inclusions Handlers ---
  const handleAddInclusion = () => {
    if (!newInclusion.trim()) return;
    const updated = [...inclusions, newInclusion.trim()];
    setPackageData((prev) => ({ ...prev, inclusions: updated }));
    setNewInclusion('');
  };

  const handleSaveEditInclusion = (index) => {
    if (!editingIncText.trim()) return;
    const updated = [...inclusions];
    updated[index] = editingIncText.trim();
    setPackageData((prev) => ({ ...prev, inclusions: updated }));
    setEditingIncIdx(null);
    setEditingIncText('');
  };

  const handleRemoveInclusion = (index) => {
    const updated = inclusions.filter((_, i) => i !== index);
    setPackageData((prev) => ({ ...prev, inclusions: updated }));
  };

  const handleMoveInclusion = (index, direction) => {
    const target = index + direction;
    const reordered = moveItem(inclusions, index, target);
    setPackageData((prev) => ({ ...prev, inclusions: reordered }));
  };

  // --- Exclusions Handlers ---
  const handleAddExclusion = () => {
    if (!newExclusion.trim()) return;
    const updated = [...exclusions, newExclusion.trim()];
    setPackageData((prev) => ({ ...prev, exclusions: updated }));
    setNewExclusion('');
  };

  const handleSaveEditExclusion = (index) => {
    if (!editingExcText.trim()) return;
    const updated = [...exclusions];
    updated[index] = editingExcText.trim();
    setPackageData((prev) => ({ ...prev, exclusions: updated }));
    setEditingExcIdx(null);
    setEditingExcText('');
  };

  const handleRemoveExclusion = (index) => {
    const updated = exclusions.filter((_, i) => i !== index);
    setPackageData((prev) => ({ ...prev, exclusions: updated }));
  };

  const handleMoveExclusion = (index, direction) => {
    const target = index + direction;
    const reordered = moveItem(exclusions, index, target);
    setPackageData((prev) => ({ ...prev, exclusions: reordered }));
  };

  // --- Other Policies Handlers ---
  const handleAddPresetPolicy = (preset) => {
    const existing = otherPolicies.find((p) => p.type === preset.type);
    if (existing) {
      showToast(`${preset.title} section already exists.`, 'info');
      setShowAddPolicyMenu(false);
      return;
    }
    const newPolicy = {
      id: `pol-${Date.now()}-${preset.type}`,
      type: preset.type,
      title: preset.title,
      points: [...preset.defaultPoints],
      notes: ''
    };
    setPackageData((prev) => ({
      ...prev,
      otherPolicies: [...(prev.otherPolicies || []), newPolicy]
    }));
    setShowAddPolicyMenu(false);
    showToast(`Added ${preset.title} section!`, 'success');
  };

  const handleAddCustomPolicy = () => {
    if (!customPolicyTitle.trim()) return;
    const newPolicy = {
      id: `pol-${Date.now()}-custom`,
      type: 'custom',
      title: customPolicyTitle.trim(),
      points: ['All activities and services are subject to local government and operator regulations.'],
      notes: ''
    };
    setPackageData((prev) => ({
      ...prev,
      otherPolicies: [...(prev.otherPolicies || []), newPolicy]
    }));
    setCustomPolicyTitle('');
    setShowAddPolicyMenu(false);
    showToast(`Added "${newPolicy.title}" section!`, 'success');
  };

  const handleRemoveOtherPolicy = (index) => {
    const updated = otherPolicies.filter((_, i) => i !== index);
    setPackageData((prev) => ({ ...prev, otherPolicies: updated }));
  };

  const handleMoveOtherPolicy = (index, direction) => {
    const target = index + direction;
    const reordered = moveItem(otherPolicies, index, target);
    setPackageData((prev) => ({ ...prev, otherPolicies: reordered }));
  };

  const handleUpdateOtherPolicyTitle = (index, title) => {
    const updated = [...otherPolicies];
    updated[index] = { ...updated[index], title };
    setPackageData((prev) => ({ ...prev, otherPolicies: updated }));
  };

  const handleAddPointToOtherPolicy = (policyIdx) => {
    const text = (newPolicyPointText[policyIdx] || '').trim();
    if (!text) return;
    const updated = [...otherPolicies];
    const currentPoints = updated[policyIdx].points || [];
    updated[policyIdx] = {
      ...updated[policyIdx],
      points: [...currentPoints, text]
    };
    setPackageData((prev) => ({ ...prev, otherPolicies: updated }));
    setNewPolicyPointText((prev) => ({ ...prev, [policyIdx]: '' }));
  };

  const handleSaveEditOtherPolicyPoint = (policyIdx, pointIdx) => {
    if (!editingPolicyPoint?.text.trim()) return;
    const updated = [...otherPolicies];
    const currentPoints = [...(updated[policyIdx].points || [])];
    currentPoints[pointIdx] = editingPolicyPoint.text.trim();
    updated[policyIdx] = {
      ...updated[policyIdx],
      points: currentPoints
    };
    setPackageData((prev) => ({ ...prev, otherPolicies: updated }));
    setEditingPolicyPoint(null);
  };

  const handleRemovePointFromOtherPolicy = (policyIdx, pointIdx) => {
    const updated = [...otherPolicies];
    const currentPoints = (updated[policyIdx].points || []).filter((_, i) => i !== pointIdx);
    updated[policyIdx] = {
      ...updated[policyIdx],
      points: currentPoints
    };
    setPackageData((prev) => ({ ...prev, otherPolicies: updated }));
  };

  const handleMovePointInOtherPolicy = (policyIdx, pointIdx, direction) => {
    const updated = [...otherPolicies];
    const currentPoints = [...(updated[policyIdx].points || [])];
    const reordered = moveItem(currentPoints, pointIdx, pointIdx + direction);
    updated[policyIdx] = {
      ...updated[policyIdx],
      points: reordered
    };
    setPackageData((prev) => ({ ...prev, otherPolicies: updated }));
  };

  const handleUpdateOtherPolicyNotes = (policyIdx, notes) => {
    const updated = [...otherPolicies];
    updated[policyIdx] = { ...updated[policyIdx], notes };
    setPackageData((prev) => ({ ...prev, otherPolicies: updated }));
  };

  // Reset to default templates
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
      terms: DEFAULT_TERMS,
      termsAndConditions: DEFAULT_TERMS
    }));
    showToast('Reset policies to standard agency defaults.', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* =====================================================================
          STAGE HEADER
          ===================================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
              04
            </span>
            <h1 className="text-xl font-bold text-[#0F172A]">Package Policies &amp; Commercial Terms</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-10">
            Define terms, date-change rules, cancellation slabs, and modular policies for this package.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition cursor-pointer"
            title="Reset to standard travel agency policy defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          POLICY VISIBILITY CONTROLS (CUSTOMER PREVIEW & DOWNLOAD PDF)
          ===================================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-orange-500" />
            <div>
              <h2 className="font-bold text-sm text-[#0F172A]">
                Customer Policy Visibility Settings (Preview &amp; PDF)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle which policy sections appear in the Customer Preview voucher and Downloaded PDF. When OFF, content remains safely saved.
              </p>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            Preview &amp; PDF Single Source of Truth
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {[
            { key: 'terms', label: 'Terms & Conditions', icon: FileText },
            { key: 'cancellation', label: 'Cancellation Policy', icon: ShieldAlert },
            { key: 'dateChange', label: 'Date Change Policy', icon: CalendarClock },
            { key: 'booking', label: 'Booking Policy', icon: Bookmark },
            { key: 'payment', label: 'Payment Policy', icon: CreditCard },
            { key: 'refund', label: 'Refund Policy', icon: RefreshCw },
            { key: 'child', label: 'Child Policy', icon: Baby },
            { key: 'hotel', label: 'Hotel Policy', icon: Building },
            { key: 'transportation', label: 'Transport Policy', icon: Car },
            ...otherPolicies
              .filter((p) => !['booking', 'payment', 'refund', 'child', 'hotel', 'transportation'].includes(p.type))
              .map((p, idx) => ({
                key: p.key || p.id || `custom-${idx}`,
                label: p.title,
                icon: Bookmark,
                customIdx: idx
              }))
          ].map((item) => {
            const isVisible = policyVisibility[item.key] !== false;
            const IconComp = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleTogglePolicyVisibility(item.key, item.customIdx)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left cursor-pointer transition select-none ${
                  isVisible
                    ? 'bg-orange-50/40 border-orange-200 text-slate-800 hover:border-orange-300'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100/70'
                }`}
                title={`Click to turn ${item.label} ${isVisible ? 'OFF' : 'ON'}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <IconComp className={`w-3.5 h-3.5 shrink-0 ${isVisible ? 'text-orange-500' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold truncate">{item.label}</span>
                </div>
                {isVisible ? (
                  <ToggleRight className="w-5 h-5 text-orange-600 shrink-0 ml-1.5" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-slate-400 shrink-0 ml-1.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          1. TERMS & CONDITIONS (EDITABLE REPEATER)
          ===================================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-bold text-sm text-[#0F172A]">General Terms &amp; Conditions</h2>
              <p className="text-[11px] text-slate-500">Legal clauses and operational requirements shown on booking confirmation.</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Visibility Toggle */}
            <button
              type="button"
              onClick={() => handleTogglePolicyVisibility('terms')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                policyVisibility.terms !== false
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-100 border-slate-300 text-slate-500'
              }`}
              title="Toggle visibility in Customer Preview and PDF"
            >
              {policyVisibility.terms !== false ? (
                <>
                  <ToggleRight className="w-4 h-4 text-emerald-600" />
                  <span>ON (Shown in Preview &amp; PDF)</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-slate-400" />
                  <span>OFF (Hidden from Preview &amp; PDF)</span>
                </>
              )}
            </button>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              {terms.length} Clauses
            </span>
          </div>
        </div>

        {policyVisibility.terms === false && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Terms &amp; Conditions is currently turned <strong>OFF</strong>. This section will NOT appear in the Customer Preview voucher or downloaded PDF. Your clauses remain saved below.
            </span>
          </div>
        )}

        {/* Add Term Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTerm())}
            placeholder="Type a new term (e.g. Valid government ID mandatory for all travelers at check-in)..."
            className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
          />
          <button
            type="button"
            onClick={handleAddTerm}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer shrink-0 inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Term</span>
          </button>
        </div>

        {/* Term List */}
        <ul className="space-y-2">
          {terms.map((term, idx) => (
            <li
              key={idx}
              className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition text-xs text-slate-700 group"
            >
              {editingTermIdx === idx ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editingTermText}
                    onChange={(e) => setEditingTermText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEditTerm(idx)}
                    className="flex-1 text-xs border border-amber-400 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEditTerm(idx)}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                    title="Save"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTermIdx(null)}
                    className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-medium text-slate-800">{term}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveTerm(idx, -1)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={idx === terms.length - 1}
                      onClick={() => handleMoveTerm(idx, 1)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTermIdx(idx);
                        setEditingTermText(term);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-600 transition cursor-pointer"
                      title="Edit Term"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleRemoveTerm(idx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete Term"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* =====================================================================
          2. CANCELLATION & REFUND POLICY (SLABS & CUSTOM NOTES)
          ===================================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-bold text-sm text-[#0F172A]">Cancellation &amp; Refund Policy</h2>
              <p className="text-[11px] text-slate-500">Tiered cancellation slabs based on days remaining before travel departure date.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Visibility Toggle */}
            <button
              type="button"
              onClick={() => handleTogglePolicyVisibility('cancellation')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                policyVisibility.cancellation !== false
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-100 border-slate-300 text-slate-500'
              }`}
              title="Toggle visibility in Customer Preview and PDF"
            >
              {policyVisibility.cancellation !== false ? (
                <>
                  <ToggleRight className="w-4 h-4 text-emerald-600" />
                  <span>ON (Shown in Preview &amp; PDF)</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-slate-400" />
                  <span>OFF (Hidden from Preview &amp; PDF)</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleAddCancellationRule}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Slab</span>
            </button>
          </div>
        </div>

        {policyVisibility.cancellation === false && (
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Cancellation &amp; Refund Policy is currently turned <strong>OFF</strong>. This section will NOT appear in the Customer Preview voucher or downloaded PDF. All slabs remain saved below.
            </span>
          </div>
        )}

        {/* Table / Grid for Slabs */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Timeframe Before Departure</th>
                <th className="p-3">Cancellation Charge</th>
                <th className="p-3">Refund Amount / Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cancellationRules.map((rule, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition group">
                  <td className="p-2.5 min-w-[200px]">
                    <input
                      type="text"
                      value={rule.timeframe}
                      onChange={(e) => handleUpdateCancellationRule(idx, 'timeframe', e.target.value)}
                      placeholder="e.g. 15 to 30 Days Before Departure"
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-900 focus:border-rose-500 outline-none"
                    />
                  </td>
                  <td className="p-2.5 min-w-[180px]">
                    <input
                      type="text"
                      value={rule.charge}
                      onChange={(e) => handleUpdateCancellationRule(idx, 'charge', e.target.value)}
                      placeholder="e.g. 25% of Package Value"
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-rose-700 focus:border-rose-500 outline-none"
                    />
                  </td>
                  <td className="p-2.5 min-w-[200px]">
                    <input
                      type="text"
                      value={rule.refund}
                      onChange={(e) => handleUpdateCancellationRule(idx, 'refund', e.target.value)}
                      placeholder="e.g. 75% Refund within 7 working days"
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-emerald-700 focus:border-rose-500 outline-none"
                    />
                  </td>
                  <td className="p-2.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveCancellationRule(idx, -1)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === cancellationRules.length - 1}
                        onClick={() => handleMoveCancellationRule(idx, 1)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCancellationRule(idx)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer ml-1"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cancellation Custom Notes Textarea */}
        <div className="space-y-1 pt-1">
          <label className="font-semibold text-xs text-slate-700 block">
            Cancellation Policy Notes &amp; Terms
          </label>
          <textarea
            rows={2}
            value={cancellationNotes}
            onChange={(e) => handleUpdateCancellationNotes(e.target.value)}
            placeholder="Add general notes regarding processing timeline, bank deductions, or non-refundable peak season alerts..."
            className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none resize-none"
          />
        </div>
      </div>

      {/* =====================================================================
          3. DATE CHANGE POLICY (RULES & CUSTOM NOTES)
          ===================================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-bold text-sm text-[#0F172A]">Date Change Policy</h2>
              <p className="text-[11px] text-slate-500">Rescheduling terms, modification fees, and advance notice requirements.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Visibility Toggle */}
            <button
              type="button"
              onClick={() => handleTogglePolicyVisibility('dateChange')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                policyVisibility.dateChange !== false
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-100 border-slate-300 text-slate-500'
              }`}
              title="Toggle visibility in Customer Preview and PDF"
            >
              {policyVisibility.dateChange !== false ? (
                <>
                  <ToggleRight className="w-4 h-4 text-emerald-600" />
                  <span>ON (Shown in Preview &amp; PDF)</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-slate-400" />
                  <span>OFF (Hidden from Preview &amp; PDF)</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleAddDateChangeRule}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          </div>
        </div>

        {policyVisibility.dateChange === false && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Date Change Policy is currently turned <strong>OFF</strong>. This section will NOT appear in the Customer Preview voucher or downloaded PDF. All rules remain saved below.
            </span>
          </div>
        )}

        {/* Table / Grid for Date Change */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Timeframe Before Departure</th>
                <th className="p-3">Date Change Fee</th>
                <th className="p-3">Conditions &amp; Supplier Remarks</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dateChangeRules.map((rule, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition group">
                  <td className="p-2.5 min-w-[200px]">
                    <input
                      type="text"
                      value={rule.timeframe}
                      onChange={(e) => handleUpdateDateChangeRule(idx, 'timeframe', e.target.value)}
                      placeholder="e.g. Up to 15 Days Before Departure"
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-900 focus:border-blue-500 outline-none"
                    />
                  </td>
                  <td className="p-2.5 min-w-[180px]">
                    <input
                      type="text"
                      value={rule.charge}
                      onChange={(e) => handleUpdateDateChangeRule(idx, 'charge', e.target.value)}
                      placeholder="e.g. ₹1,500 per person change fee"
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-blue-700 focus:border-blue-500 outline-none"
                    />
                  </td>
                  <td className="p-2.5 min-w-[200px]">
                    <input
                      type="text"
                      value={rule.remark}
                      onChange={(e) => handleUpdateDateChangeRule(idx, 'remark', e.target.value)}
                      placeholder="e.g. Hotel & airline fare difference applies"
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:border-blue-500 outline-none"
                    />
                  </td>
                  <td className="p-2.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveDateChangeRule(idx, -1)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === dateChangeRules.length - 1}
                        onClick={() => handleMoveDateChangeRule(idx, 1)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDateChangeRule(idx)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer ml-1"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Date Change Notes Textarea */}
        <div className="space-y-1 pt-1">
          <label className="font-semibold text-xs text-slate-700 block">
            Date Change Policy Notes
          </label>
          <textarea
            rows={2}
            value={dateChangeNotes}
            onChange={(e) => handleUpdateDateChangeNotes(e.target.value)}
            placeholder="Detail hotel blackout periods, airline change penalties, and seasonal availability notes..."
            className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
          />
        </div>
      </div>

      {/* =====================================================================
          4. OTHER POLICIES (MODULAR REPEATER SECTIONS)
          Booking, Payment, Refund, Child, Hotel, Transportation, General, Custom
          ===================================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Additional Policy Modules</h2>
            <p className="text-xs text-slate-500">
              Add specialized policy sections for booking, payments, child discounts, hotel stays, or transport.
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAddPolicyMenu(!showAddPolicyMenu)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Policy Section</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Menu for Adding Preset / Custom Policy */}
            {showAddPolicyMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-30 space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">
                  Preset Policy Categories
                </div>
                <div className="space-y-1">
                  {POLICY_PRESETS.map((preset) => {
                    const IconComp = preset.icon;
                    return (
                      <button
                        key={preset.type}
                        type="button"
                        onClick={() => handleAddPresetPolicy(preset)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 transition cursor-pointer"
                      >
                        <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          <IconComp className="w-3.5 h-3.5" />
                        </span>
                        <span>{preset.title}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-2 px-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Or Custom Policy
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={customPolicyTitle}
                      onChange={(e) => setCustomPolicyTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomPolicy()}
                      placeholder="e.g. Visa & Immigration Policy"
                      className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomPolicy}
                      className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Render Each Additional Policy Section */}
        {otherPolicies.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-white text-slate-400 mx-auto flex items-center justify-center shadow-xs border border-slate-200">
              <Bookmark className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700">No additional policies configured yet</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Click &quot;+ Add Policy Section&quot; to configure Booking, Payment, Child, Hotel, or Transport policies.
            </p>
          </div>
        ) : (
          otherPolicies.map((policy, pIdx) => {
            const presetInfo = POLICY_PRESETS.find((p) => p.type === policy.type);
            const IconComp = presetInfo?.icon || Bookmark;
            const policyKey = policy.key || policy.id || policy.type || `custom-${pIdx}`;
            const isVisible =
              policy.enabled !== false &&
              policy.visible !== false &&
              policyVisibility[policyKey] !== false &&
              (policy.type ? policyVisibility[policy.type] !== false : true);

            return (
              <div
                key={policy.id || pIdx}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4"
              >
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 flex-1">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <IconComp className="w-4 h-4" />
                    </span>
                    <div className="flex-1 max-w-md">
                      <input
                        type="text"
                        value={policy.title}
                        onChange={(e) => handleUpdateOtherPolicyTitle(pIdx, e.target.value)}
                        className="w-full font-bold text-sm text-[#0F172A] border-b border-transparent hover:border-slate-300 focus:border-orange-500 focus:outline-none transition py-0.5"
                      />
                      <span className="text-[10px] text-slate-400">Click title to edit section name</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => handleTogglePolicyVisibility(policy.type || policyKey, pIdx)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer mr-1 ${
                        isVisible
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-slate-100 border-slate-300 text-slate-500'
                      }`}
                      title="Toggle visibility in Customer Preview and PDF"
                    >
                      {isVisible ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-600" />
                          <span>ON</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                          <span>OFF</span>
                        </>
                      )}
                    </button>
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={pIdx === 0}
                      onClick={() => handleMoveOtherPolicy(pIdx, -1)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                      title="Move Section Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={pIdx === otherPolicies.length - 1}
                      onClick={() => handleMoveOtherPolicy(pIdx, 1)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                      title="Move Section Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    {/* Delete Section */}
                    <button
                      type="button"
                      onClick={() => handleRemoveOtherPolicy(pIdx)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
                      title="Delete this policy section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {!isVisible && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {policy.title} is currently turned <strong>OFF</strong>. This section will NOT appear in the Customer Preview voucher or downloaded PDF. Your clauses remain saved below.
                    </span>
                  </div>
                )}

                {/* Add Clause to this section */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPolicyPointText[pIdx] || ''}
                    onChange={(e) => setNewPolicyPointText((prev) => ({ ...prev, [pIdx]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPointToOtherPolicy(pIdx))}
                    placeholder={`Add a specific clause to ${policy.title}...`}
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-2 focus:border-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddPointToOtherPolicy(pIdx)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shrink-0 inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Clause</span>
                  </button>
                </div>

                {/* Clauses list */}
                <ul className="space-y-2">
                  {(policy.points || []).map((point, ptIdx) => {
                    const isEditing = editingPolicyPoint?.policyIdx === pIdx && editingPolicyPoint?.pointIdx === ptIdx;

                    return (
                      <li
                        key={ptIdx}
                        className="flex items-start justify-between gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 text-xs text-slate-700 group transition"
                      >
                        {isEditing ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editingPolicyPoint.text}
                              onChange={(e) => setEditingPolicyPoint((prev) => ({ ...prev, text: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveEditOtherPolicyPoint(pIdx, ptIdx)}
                              className="flex-1 text-xs border border-orange-400 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditOtherPolicyPoint(pIdx, ptIdx)}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPolicyPoint(null)}
                              className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                              <span className="leading-relaxed font-medium text-slate-800">{point}</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                              <button
                                type="button"
                                disabled={ptIdx === 0}
                                onClick={() => handleMovePointInOtherPolicy(pIdx, ptIdx, -1)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={ptIdx === (policy.points || []).length - 1}
                                onClick={() => handleMovePointInOtherPolicy(pIdx, ptIdx, 1)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPolicyPoint({ policyIdx: pIdx, pointIdx: ptIdx, text: point })}
                                className="p-1 rounded text-slate-400 hover:text-slate-800 cursor-pointer"
                                title="Edit Clause"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemovePointFromOtherPolicy(pIdx, ptIdx)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Delete Clause"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* Additional Notes for this section */}
                <div className="space-y-1 pt-1">
                  <label className="font-semibold text-[11px] text-slate-500 block">
                    Additional notes / disclaimer for {policy.title}
                  </label>
                  <input
                    type="text"
                    value={policy.notes || ''}
                    onChange={(e) => handleUpdateOtherPolicyNotes(pIdx, e.target.value)}
                    placeholder="Optional footnote or disclaimer shown under this policy..."
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:border-slate-800 outline-none"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =====================================================================
          5. PACKAGE INCLUSIONS & EXCLUSIONS
          ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* INCLUSIONS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-sm text-[#0F172A]">Package Inclusions</h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {inclusions.length} items
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newInclusion}
              onChange={(e) => setNewInclusion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInclusion())}
              placeholder="e.g. Welcome drink on arrival..."
              className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 focus:border-emerald-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddInclusion}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shrink-0"
            >
              Add
            </button>
          </div>

          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {inclusions.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start justify-between gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-700 group hover:bg-slate-100/70 transition"
              >
                {editingIncIdx === idx ? (
                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editingIncText}
                      onChange={(e) => setEditingIncText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEditInclusion(idx)}
                      className="flex-1 text-xs border border-emerald-400 bg-white rounded-lg px-2 py-1 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEditInclusion(idx)}
                      className="p-1 rounded bg-emerald-600 text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingIncIdx(null)}
                      className="p-1 rounded bg-slate-200 text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-2 min-w-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{item}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveInclusion(idx, -1)}
                        className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === inclusions.length - 1}
                        onClick={() => handleMoveInclusion(idx, 1)}
                        className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingIncIdx(idx); setEditingIncText(item); }}
                        className="text-slate-400 hover:text-emerald-700 ml-1"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveInclusion(idx)}
                        className="text-slate-400 hover:text-rose-600 ml-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* EXCLUSIONS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-sm text-[#0F172A]">Package Exclusions</h3>
            </div>
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              {exclusions.length} items
            </span>
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
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shrink-0"
            >
              Add
            </button>
          </div>

          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {exclusions.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start justify-between gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-700 group hover:bg-slate-100/70 transition"
              >
                {editingExcIdx === idx ? (
                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editingExcText}
                      onChange={(e) => setEditingExcText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEditExclusion(idx)}
                      className="flex-1 text-xs border border-rose-400 bg-white rounded-lg px-2 py-1 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEditExclusion(idx)}
                      className="p-1 rounded bg-rose-600 text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingExcIdx(null)}
                      className="p-1 rounded bg-slate-200 text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-2 min-w-0">
                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{item}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveExclusion(idx, -1)}
                        className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === exclusions.length - 1}
                        onClick={() => handleMoveExclusion(idx, 1)}
                        className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingExcIdx(idx); setEditingExcText(item); }}
                        className="text-slate-400 hover:text-rose-700 ml-1"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExclusion(idx)}
                        className="text-slate-400 hover:text-rose-600 ml-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* =====================================================================
          NAVIGATION FOOTER (BACK TO PRICING · CONTINUE TO CUSTOMER PREVIEW)
          ===================================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pricing &amp; Rules</span>
        </button>

        <div className="w-full sm:w-auto flex items-center justify-end gap-3">
          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Save Policies Draft</span>
            </button>
          )}

          <button
            type="button"
            onClick={onContinue}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-98"
          >
            <span>Continue to Customer Preview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
