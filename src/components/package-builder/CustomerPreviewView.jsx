import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  FileDown,
  ArrowRight,
  ArrowLeft,
  Plane,
  Building2,
  Car,
  Bus,
  Mountain,
  Compass,
  Utensils,
  Share2,
  Printer,
  X,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Eye,
  Copy,
  Check,
  Receipt,
  Percent,
  Tag,
  Loader2
} from 'lucide-react';
import { downloadCustomerPreviewAsPdf } from '../../lib/pdfGenerator.js';
import { getCustomerFacingPackageData } from '../../lib/customerPackageData.js';

// INR Currency Formatter
const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

// Format date helper: "2026-07-07" -> "07 Jul 2026"
const formatDisplayDate = (dateStr, dayOffset = 0) => {
  if (!dateStr) {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + dayOffset);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Format weekday + date: "Tuesday, 7 July 2026"
const formatFullDate = (dateStr, dayOffset = 0) => {
  if (!dateStr) {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return `Day ${dayOffset + 1}`;
  d.setDate(d.getDate() + dayOffset);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export default function CustomerPreviewView({
  packageData,
  packageId,
  onBack,
  onContinue,
  showToast
}) {
  const [downloading, setDownloading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // For flight ticket/image modal
  const [copiedJson, setCopiedJson] = useState(false);
  const [isCopyingJson, setIsCopyingJson] = useState(false);

  // Single Source of Truth for customer-facing data (visibility filtering for preview & PDF)
  const customerFacingData = getCustomerFacingPackageData(packageData);
  const {
    visiblePolicies,
    showPriceBreakdown,
    visibleBreakdownItems,
    coverLocations: customerCoverLocations
  } = customerFacingData;
  const coverLocations = customerCoverLocations || [];

  const termsPolicy = visiblePolicies.find((p) => p.key === 'terms');
  const cancellationPolicy = visiblePolicies.find((p) => p.key === 'cancellation');
  const dateChangePolicy = visiblePolicies.find((p) => p.key === 'dateChange');
  const otherVisiblePolicies = visiblePolicies.filter(
    (p) => !['terms', 'cancellation', 'dateChange'].includes(p.key)
  );

  const travelers = packageData.travelers || { adults: 2, children: 0 };
  const totalTravelers = Math.max((travelers.adults || 0) + (travelers.children || 0), 1);
  const days = packageData.days || [];
  const daysCount = days.length;
  const nightsCount = packageData.nights || Math.max(daysCount - 1, 1);
  const startDate = packageData.startDate || '2026-07-07';

  // Extract all services across days
  const hotelsList = [];
  const flightsList = [];
  const cabsList = [];
  const busesList = [];
  const sightseeingList = [];
  const activitiesList = [];
  const mealsList = [];

  let baseTotal = 0;

  days.forEach((day, dayIdx) => {
    (day.services || []).forEach((svc) => {
      const d = svc.data || {};
      if (svc.type === 'hotel') {
        hotelsList.push({ ...d, dayIndex: dayIdx, dayTitle: day.title, location: d.location || day.location || packageData.destination });
        const apiTotal = d.totalPrice ?? d.totalFare;
        if (apiTotal != null) {
          baseTotal += Number(apiTotal) || 0;
        } else {
          baseTotal += Number(d.price || 0) * Number(d.nights || 1);
        }
      } else if (svc.type === 'flight') {
        flightsList.push({ ...d, dayIndex: dayIdx, dayTitle: day.title });
        const apiTotal = d.totalFare ?? d.totalPrice;
        if (apiTotal != null && !d.isManual) {
          baseTotal += Number(apiTotal) || 0;
        } else if (d.apiSelected) {
          baseTotal += Number(d.fare || d.price || 0);
        } else {
          baseTotal += (Number(d.fare || 0) + Number(d.tax || 0)) * totalTravelers;
        }
      } else if (svc.type === 'cab') {
        cabsList.push({ ...d, dayIndex: dayIdx, dayTitle: day.title });
        baseTotal += Number((d.totalPrice ?? d.price) || 0);
      } else if (svc.type === 'bus') {
        busesList.push({ ...d, dayIndex: dayIdx, dayTitle: day.title });
        const apiTotal = d.totalPrice ?? d.totalFare;
        if (apiTotal != null && !d.isManual) {
          baseTotal += Number(apiTotal) || 0;
        } else if (Array.isArray(d.selectedSeats) && d.selectedSeats.length > 0) {
          const seatSum = d.selectedSeats.reduce((acc, s) => acc + (Number(s.Fare) || 0), 0);
          baseTotal += seatSum > 0 ? seatSum : Number(d.price || 0);
        } else if (d.apiSelected) {
          baseTotal += Number(d.price || 0);
        } else {
          baseTotal += Number(d.price || 0) * totalTravelers;
        }
      } else if (svc.type === 'sightseeing') {
        (d.items || []).forEach((item) => {
          sightseeingList.push({ ...item, dayIndex: dayIdx, dayTitle: day.title });
          baseTotal += Number(item.price || 0) * totalTravelers;
        });
      } else if (svc.type === 'activity') {
        (d.items || []).forEach((item) => {
          activitiesList.push({ ...item, dayIndex: dayIdx, dayTitle: day.title });
          baseTotal += Number(item.price || 0) * totalTravelers;
        });
      } else if (svc.type === 'meal') {
        (d.items || []).forEach((item) => {
          if (item.enabled) {
            mealsList.push({ ...item, dayIndex: dayIdx, dayTitle: day.title });
            baseTotal += Number(item.price || 0) * totalTravelers;
          }
        });
      }
    });
  });

  const pricing = packageData.pricing || {};
  const markup = Number(pricing.markup) || 0;
  const tax = Number(pricing.tax) || 0;
  const discount = Number(pricing.discount) || 0;
  const finalTotal = Math.max(baseTotal + markup + tax - discount, 0);
  const perPerson = Math.round(finalTotal / totalTravelers);

  // Group days by destination for the special Package-Wise Table (like image.png)
  const destinationGroups = [];
  let currentGroup = null;

  days.forEach((day, idx) => {
    const loc = day.location || packageData.destination || 'Destination';
    if (!currentGroup || currentGroup.location !== loc) {
      currentGroup = {
        location: loc,
        days: [{ day, index: idx }]
      };
      destinationGroups.push(currentGroup);
    } else {
      currentGroup.days.push({ day, index: idx });
    }
  });

  const customerName = packageData.customerInfo?.name || packageData.customerName || 'Valued Traveler';
  const tripId = packageData.id || packageData.tripId || 'N/A';
  const referenceId = packageData.referenceId || (packageData.id ? `PKG-${packageData.id}` : 'PKG-DRAFT');

  // Download PDF handler
  const handleDownloadPdf = async () => {
    setDownloading(true);
    if (showToast) showToast('Preparing high-resolution Customer Preview PDF...', 'info');

    try {
      const docElement = document.getElementById('pdf-document-root');
      if (!docElement) {
        throw new Error('Customer Preview element was not found on screen.');
      }
      const filename = `${packageData.title || packageData.destination || 'Holiday-Itinerary'}.pdf`;
      await downloadCustomerPreviewAsPdf(docElement, filename);
      if (showToast) showToast('Customer Preview PDF downloaded successfully!', 'success');
    } catch (e) {
      console.error('Customer Preview PDF generation error:', e);
      if (showToast) showToast('Failed to generate PDF: ' + (e.message || 'Error capturing preview'), 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      if (showToast) showToast('Voucher share link copied to clipboard!', 'success');
    }
  };

  // Copy Exact Saved Package Record from Database (Sequelize Package Model)
  const handleCopyJson = async () => {
    if (isCopyingJson) return;

    // Use actual database Package.id (must be a saved record in DB)
    const rawId = packageId || packageData?.id;
    let savedPackageId = null;

    if (typeof rawId === 'number' && rawId > 0) {
      savedPackageId = rawId;
    } else if (typeof rawId === 'string') {
      const cleaned = rawId.replace(/^PKG-/i, '').trim();
      if (/^\d+$/.test(cleaned) && Number(cleaned) > 0) {
        savedPackageId = Number(cleaned);
      }
    }

    setIsCopyingJson(true);

    try {
      // If not saved yet, auto-save to database to obtain the real Sequelize Package record
      if (!savedPackageId) {
        if (showToast) showToast('Saving package to database first...', 'info');
        const saveRes = await fetch('/api/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(packageData)
        });
        if (saveRes.ok) {
          const saveJson = await saveRes.json();
          if (saveJson?.package?.id) {
            savedPackageId = Number(saveJson.package.id);
          }
        }
      }

      if (!savedPackageId) {
        throw new Error('Please save the package first to generate a database record.');
      }

      // Retrieve the actual Sequelize Package record from the database
      const res = await fetch(`/api/packages/${savedPackageId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Package not found.');
        }
        throw new Error('Unable to fetch saved package JSON.');
      }

      const jsonResponse = await res.json();
      const savedPackageModel = jsonResponse?.package || (jsonResponse?.id ? jsonResponse : null);

      if (!savedPackageModel) {
        throw new Error(jsonResponse?.error || 'Unable to fetch saved package JSON.');
      }

      // Format as indented JSON (2 spaces), preserving all numbers, objects, arrays, and nulls
      const formattedJson = JSON.stringify(savedPackageModel, null, 2);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formattedJson);
      } else {
        const ta = document.createElement('textarea');
        ta.value = formattedJson;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      setCopiedJson(true);
      if (showToast) {
        showToast('Copied saved Package JSON from database!', 'success');
      }
      setTimeout(() => setCopiedJson(false), 2500);
    } catch (err) {
      console.error('Failed to copy saved package JSON:', err);
      if (showToast) {
        showToast(err.message || 'Unable to fetch saved package JSON.', 'error');
      }
    } finally {
      setIsCopyingJson(false);
    }
  };

  const previewTerms = packageData.terms?.length
    ? packageData.terms
    : packageData.termsAndConditions?.length
    ? packageData.termsAndConditions
    : [
        'All package rates are subject to availability at the time of confirmed booking.',
        'Standard hotel check-in time is 12:00 PM / 02:00 PM and check-out is 10:00 AM / 11:00 AM.',
        'Valid Government ID proof (Aadhar / Passport / Voter ID) is mandatory for all travelers at check-in.',
        'AC will not operate in hill stations or when vehicle is parked/idle.',
        'Any changes or deviations in route requested by the traveler will attract additional charges.'
      ];

  const previewCancellationRules = packageData.cancellationPolicy?.rules?.length
    ? packageData.cancellationPolicy.rules
    : [
        { timeframe: '30+ Days Before Departure', charge: '10% of Package Value', refund: '90% Refund within 7 working days' },
        { timeframe: '15 to 29 Days Before Departure', charge: '25% of Package Value', refund: '75% Refund within 7 working days' },
        { timeframe: '7 to 14 Days Before Departure', charge: '50% of Package Value', refund: '50% Refund within 7 working days' },
        { timeframe: 'Within 7 Days of Departure / No Show', charge: '100% of Package Value', refund: 'Non-refundable' }
      ];
  const previewCancellationNotes = packageData.cancellationPolicy?.notes;

  const previewDateChangeRules = packageData.dateChangePolicy?.rules?.length
    ? packageData.dateChangePolicy.rules
    : [
        { timeframe: 'Up to 15 Days Before Departure', charge: 'Free Date Rescheduling', remark: 'Hotel & airline fare difference applies' },
        { timeframe: '7 to 14 Days Before Departure', charge: '₹1,500 per person change fee', remark: '+ airline/hotel fare difference' },
        { timeframe: 'Less than 7 Days Before Departure', charge: 'Subject to Supplier Approval', remark: 'Treated as cancellation if not approved' }
      ];
  const previewDateChangeNotes = packageData.dateChangePolicy?.notes;

  const previewOtherPolicies = Array.isArray(packageData.otherPolicies) ? packageData.otherPolicies : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="customer-preview-view" className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Controls Bar (Hidden during print) */}
      <div className="print:hidden bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Policy</span>
          </button>
          <span className="text-xs text-slate-500 hidden md:inline">
            Official PDF Quotation Itinerary Format (Make My Bharat Yatra)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyJson}
            disabled={isCopyingJson}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
              copiedJson
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : isCopyingJson
                ? 'bg-slate-100 border-slate-300 text-slate-600'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
            title="Copy saved package database record as JSON"
          >
            {copiedJson ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : isCopyingJson ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-slate-600 animate-spin" />
                <span>Copying...</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Copy JSON</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer shadow-xs disabled:opacity-70"
          >
            <FileDown className="w-4 h-4 text-orange-400" />
            <span>{downloading ? 'Rendering PDF...' : 'Download PDF'}</span>
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition cursor-pointer shadow-xs"
          >
            <span>Save &amp; Publish</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
         PDF DOCUMENT ROOT (Exact representation of the PDF Pages)
         ========================================================================= */}
      <div
        id="pdf-document-root"
        className="bg-white rounded-none sm:rounded-2xl border border-slate-200 shadow-xl overflow-hidden font-sans text-slate-800"
      >
        {/* =======================================================================
           PAGE 1: COVER BANNER, GREETING, METADATA TABLE & PRICE BOX
           ======================================================================= */}
        
        {/* 1. Package Header Banner */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-900">
          <img
            src={
              packageData.coverImage ||
              'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=1200&auto=format&fit=crop'
            }
            alt={packageData.title}
            className="w-full h-full object-cover opacity-90"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 flex flex-col justify-end p-6 sm:p-10 text-white">
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-400 mb-2">
              MMBY TRIP
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow-md leading-tight max-w-2xl">
              {packageData.title || `${packageData.destination || 'MUSSORIE TO KHAJJIAR'}`}
            </h1>
            <div className="flex items-center gap-2.5 flex-wrap mt-2">
              <span className="text-base sm:text-lg font-bold uppercase tracking-[0.2em] text-white/90">
                ITINERARY
              </span>
              {coverLocations.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-xs border border-white/20 text-xs font-semibold text-orange-300">
                  <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Covered: {coverLocations.join(' · ')}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-8">
          {/* 2. Customer Greeting */}
          <div className="space-y-2 text-sm sm:text-base text-slate-700 leading-relaxed border-b border-slate-100 pb-6">
            <p className="font-bold text-slate-900 text-base sm:text-lg">
              Dear {customerName},
            </p>
            <p className="font-medium text-slate-800">
              Greetings from <span className="font-bold text-orange-600">MMBY Holidays</span>.
            </p>
            <p className="text-slate-600 text-xs sm:text-sm">
              Our sales team has put up this Quote regarding your upcoming trip. Please go through it and let us know if you would like any changes in any of the provided services. Contact details are provided at the end.
            </p>
          </div>

          {/* 3. Package Basic Information (6-cell metadata grid matching Page 1) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Trip Details &amp; Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  COVER LOCATIONS
                </span>
                <p className="font-bold text-sm text-slate-900 line-clamp-2" title={coverLocations.join(' · ')}>
                  {coverLocations.join(' · ') || packageData.destination || 'Custom Destination'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  START DATE
                </span>
                <p className="font-bold text-sm sm:text-base text-slate-900">
                  {formatDisplayDate(startDate)}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  DURATION
                </span>
                <p className="font-bold text-sm sm:text-base text-slate-900">
                  {daysCount} Days / {nightsCount} Nights
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  PAX
                </span>
                <p className="font-bold text-sm sm:text-base text-slate-900">
                  {travelers.adults || 2} Adults {travelers.children ? `, ${travelers.children} Kids` : ''}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  TRIP ID
                </span>
                <p className="font-bold text-sm sm:text-base text-slate-900 font-mono">
                  {tripId}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  REFERENCE ID
                </span>
                <p className="font-bold text-sm sm:text-base text-slate-900 font-mono">
                  {referenceId}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Quote Price Box (Peach/Orange luxury style matching Page 1) */}
          <div className="bg-[#FDF4EB] border-l-4 border-orange-500 border border-orange-200/80 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-800">
                  Quote Price
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    {inr(finalTotal)} /-
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    (including GST)
                  </span>
                </div>
                <p className="text-xs text-orange-950/80 mt-1">
                  Total price for {totalTravelers} {totalTravelers === 1 ? 'traveler' : 'travelers'} ({inr(perPerson)} per person)
                </p>
              </div>

              <div className="flex flex-wrap gap-2 sm:max-w-xs">
                {hotelsList.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-orange-200 text-[11px] font-semibold text-slate-800">
                    🏨 {hotelsList.length} {hotelsList.length === 1 ? 'Hotel' : 'Hotels'}
                  </span>
                )}
                {flightsList.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-orange-200 text-[11px] font-semibold text-slate-800">
                    ✈️ {flightsList.length} {flightsList.length === 1 ? 'Flight' : 'Flights'}
                  </span>
                )}
                {cabsList.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-orange-200 text-[11px] font-semibold text-slate-800">
                    🚗 {cabsList.length} {cabsList.length === 1 ? 'Cab Transfer' : 'Transfers'}
                  </span>
                )}
                {busesList.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-orange-200 text-[11px] font-semibold text-slate-800">
                    🚌 {busesList.length} {busesList.length === 1 ? 'Bus' : 'Buses'}
                  </span>
                )}
              </div>
            </div>

            {/* Commercial Tariff Note & Quick Jump */}
            <div className="pt-3 border-t border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-orange-950/80 font-medium">
                Comprehensive quotation including all transfers, taxes, and specified meals.
              </span>
              <a
                href="#price-breakdown-section"
                className="inline-flex items-center gap-1.5 text-orange-700 hover:text-orange-900 font-bold underline underline-offset-2 transition"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>See Price Breakdown Below ↓</span>
              </a>
            </div>
          </div>

          {/* =====================================================================
             PAGE 2: HOTELS & TRANSPORTATION SUMMARIES (DYNAMIC / CONDITIONAL)
             ===================================================================== */}

          {/* 5. HOTELS SUMMARY (Conditionally rendered ONLY if hotels exist!) */}
          {hotelsList.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 rounded-full bg-orange-500"></span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Hotels / Accommodations
                </h3>
              </div>

              <div className="space-y-3">
                {hotelsList.map((hotel, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-4">
                      {hotel.image && (
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-100"
                          crossOrigin="anonymous"
                        />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[11px] font-bold">
                            {idx + 1}st Night at {hotel.location || packageData.destination}
                          </span>
                          <span className="text-xs text-slate-500">
                            Check-in: {formatDisplayDate(startDate, hotel.dayIndex)}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900">
                          {hotel.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                          <span className="text-amber-500 font-semibold">
                            {'★'.repeat(hotel.stars || 4)} {hotel.stars || 4} Star
                          </span>
                          <span className="text-slate-300">·</span>
                          <span>{hotel.roomType || hotel.room || 'Deluxe Room'}</span>
                          <span className="text-slate-300">·</span>
                          <span className="font-medium text-emerald-700">{hotel.mealPlan || hotel.meal || 'Breakfast Included'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs text-slate-400 block">Rate / Night</span>
                      <p className="font-bold text-base sm:text-lg text-slate-900">
                        {inr(hotel.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. TRANSPORTATION SUMMARY (Conditionally rendered ONLY if flights, cabs, or buses exist!) */}
          {(flightsList.length > 0 || cabsList.length > 0 || busesList.length > 0) && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 rounded-full bg-orange-500"></span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Transportation &amp; Transfers
                </h3>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
                        <th className="py-3 px-4">Day</th>
                        <th className="py-3 px-4">Type / Service</th>
                        <th className="py-3 px-4">Route</th>
                        <th className="py-3 px-4">Timing</th>
                        <th className="py-3 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {/* Flights */}
                      {flightsList.map((f, i) => (
                        <tr key={`flight-${i}`} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            Day {f.dayIndex + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Plane className="w-3.5 h-3.5" />
                              </span>
                              <div>
                                <span className="font-bold text-slate-800">{f.airline || 'Flight'}</span>
                                <span className="text-[11px] text-slate-500 block font-mono">{f.flightNumber}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            {f.from || f.fromName || 'Origin'} → {f.to || f.toName || 'Dest'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {f.departure || '09:00'} - {f.arrival || '11:15'} ({f.duration || '2h 15m'})
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {f.flightImage ? (
                              <button
                                type="button"
                                onClick={() => setPreviewImage({ url: f.flightImage, title: `${f.airline} Flight Ticket` })}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 px-2 py-1 rounded cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> View Ticket
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-semibold">{f.cabin || 'Economy'}</span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {/* Cabs */}
                      {cabsList.map((c, i) => (
                        <tr key={`cab-${i}`} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            Day {c.dayIndex + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Car className="w-3.5 h-3.5" />
                              </span>
                              <div>
                                <span className="font-bold text-slate-800">{c.vehicle || 'Private Cab'}</span>
                                <span className="text-[11px] text-slate-500 block">{c.category || 'Sedan'} ({c.seats || 4} Seats)</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            {c.pickup || 'Pickup'} → {c.drop || 'Drop'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {c.time || '12:30 PM'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                            {c.ac ? 'AC Vehicle' : 'Non-AC'}
                          </td>
                        </tr>
                      ))}

                      {/* Buses */}
                      {busesList.map((b, i) => (
                        <tr key={`bus-${i}`} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            Day {b.dayIndex + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                <Bus className="w-3.5 h-3.5" />
                              </span>
                              <div>
                                <span className="font-bold text-slate-800">{b.operator || 'Volvo Bus'}</span>
                                <span className="text-[11px] text-slate-500 block">{b.busType || 'AC Sleeper'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            {b.from || 'Origin'} → {b.to || 'Destination'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {b.departure || '21:00'} - {b.arrival || '08:00'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                            Confirmed Seat
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
             7. SPECIAL PACKAGE-WISE ITINERARY TABLE (EXACTLY LIKE image.png)
             ===================================================================== */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 rounded-full bg-orange-500"></span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Package Itinerary Overview
                </h3>
              </div>
              <span className="text-xs text-slate-400">Destination-Wise Stays</span>
            </div>

            {/* Destination Groups */}
            <div className="space-y-5">
              {destinationGroups.map((group, gIdx) => {
                const stayNights = Math.max(group.days.length - 1, 1);
                return (
                  <div key={gIdx} className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    {/* Destination Banner Strip (matching #F5EBE1 in image.png) */}
                    <div className="bg-[#F5EBE1] px-5 py-3 border-b border-[#E6D7CB] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#8C5D3A]" />
                        <h4 className="font-bold text-sm sm:text-base text-[#43302B]">
                          {group.location} - {stayNights} {stayNights === 1 ? 'Night' : 'Nights'} Stay
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-[#8C5D3A]">
                        {group.days.length} Days
                      </span>
                    </div>

                    {/* Day Rows */}
                    <div className="divide-y divide-slate-200">
                      {group.days.map(({ day, index }) => {
                        const dayServices = day.services || [];
                        const dayHotels = dayServices.filter((s) => s.type === 'hotel');
                        const dayFlights = dayServices.filter((s) => s.type === 'flight');
                        const dayCabs = dayServices.filter((s) => s.type === 'cab');
                        const dayBuses = dayServices.filter((s) => s.type === 'bus');
                        const daySightseeing = dayServices.filter((s) => s.type === 'sightseeing');
                        const dayActivities = dayServices.filter((s) => s.type === 'activity');
                        const dayMeals = dayServices.filter((s) => s.type === 'meal');

                        return (
                          <div
                            key={day.id || index}
                            className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 items-start hover:bg-slate-50/50 transition"
                          >
                            {/* Left Column: Day & Date */}
                            <div className="md:col-span-1 space-y-0.5">
                              <span className="font-bold text-sm text-slate-900 block">
                                Day {index + 1}
                              </span>
                              <span className="text-xs text-slate-500 font-medium block">
                                {formatDisplayDate(startDate, index)}
                              </span>
                            </div>

                            {/* Right Columns: Activities, Stays, and Meals */}
                            <div className="md:col-span-3 space-y-2.5">
                              {/* Title / Activity */}
                              <div>
                                <p className="font-bold text-sm text-slate-900">
                                  {day.title || `Exploring ${group.location}`}
                                </p>
                                {day.description && (
                                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    {day.description}
                                  </p>
                                )}
                              </div>

                              {/* Service Bullet Chips (Hotels, Meals, Sightseeing) */}
                              <div className="space-y-1.5 pt-1 text-xs text-slate-700">
                                {dayHotels.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-base leading-none">🏨</span>
                                    <span>
                                      <span className="font-semibold text-slate-900">Check in:</span>{' '}
                                      {dayHotels.map((h) => `${h.data?.name} (${h.data?.roomType || h.data?.room || 'Deluxe Room'})`).join(', ')}
                                    </span>
                                  </div>
                                )}

                                {dayFlights.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-base leading-none">✈️</span>
                                    <span>
                                      <span className="font-semibold text-slate-900">Flight:</span>{' '}
                                      {dayFlights.map((f) => `${f.data?.airline} ${f.data?.flightNumber} (${f.data?.from} → ${f.data?.to})`).join(', ')}
                                    </span>
                                  </div>
                                )}

                                {dayCabs.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-base leading-none">🚗</span>
                                    <span>
                                      <span className="font-semibold text-slate-900">Transfer:</span>{' '}
                                      {dayCabs.map((c) => `${c.data?.vehicle} (${c.data?.pickup} to ${c.data?.drop})`).join(', ')}
                                    </span>
                                  </div>
                                )}

                                {dayBuses.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-base leading-none">🚌</span>
                                    <span>
                                      <span className="font-semibold text-slate-900">Bus:</span>{' '}
                                      {dayBuses.map((b) => `${b.data?.operator} (${b.data?.from} to ${b.data?.to})`).join(', ')}
                                    </span>
                                  </div>
                                )}

                                {daySightseeing.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-base leading-none">🥾</span>
                                    <span>
                                      <span className="font-semibold text-slate-900">Sightseeing:</span>{' '}
                                      {daySightseeing.map((s) => (s.data?.items || []).map((i) => i.name).join(', ')).join(', ')}
                                    </span>
                                  </div>
                                )}

                                {dayActivities.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-base leading-none">🧭</span>
                                    <span>
                                      <span className="font-semibold text-slate-900">Activity:</span>{' '}
                                      {dayActivities.map((a) => (a.data?.items || []).map((i) => i.name).join(', ')).join(', ')}
                                    </span>
                                  </div>
                                )}

                                {dayMeals.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-base leading-none">🍽️</span>
                                    <span>
                                      <span className="font-semibold text-slate-900">Meals:</span>{' '}
                                      {dayMeals.map((m) => (m.data?.items || []).filter((i) => i.enabled).map((i) => i.name).join(', ')).join(', ')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =====================================================================
             8. DAY-WISE DETAILED ITINERARY (MATCHING PAGE 2 DETAILED ITINERARY)
             ===================================================================== */}
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-6 rounded-full bg-orange-500"></span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Day-by-Day Detailed Plan
              </h3>
            </div>

            <div className="space-y-6">
              {days.map((day, idx) => (
                <div
                  key={day.id || idx}
                  className="border border-slate-200 rounded-2xl p-5 sm:p-6 bg-white space-y-4 hover:border-slate-300 transition"
                >
                  {/* Day Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl bg-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-2xs">
                        {idx + 1} DAY
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        {formatFullDate(startDate, idx)}
                      </h4>
                    </div>
                    {day.location && (
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        {day.location}
                      </span>
                    )}
                  </div>

                  {/* Day Title & Description */}
                  <div>
                    <h5 className="font-bold text-sm text-slate-800">{day.title}</h5>
                    {day.description && (
                      <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                        {day.description}
                      </p>
                    )}
                  </div>

                  {/* Day Services List */}
                  {(day.services || []).length > 0 && (
                    <div className="space-y-2 pt-2">
                      {day.services.map((svc) => (
                        <div
                          key={svc.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                              {svc.type === 'flight' && <Plane className="w-4 h-4 text-blue-600" />}
                              {svc.type === 'hotel' && <Building2 className="w-4 h-4 text-indigo-600" />}
                              {svc.type === 'cab' && <Car className="w-4 h-4 text-emerald-600" />}
                              {svc.type === 'bus' && <Bus className="w-4 h-4 text-amber-600" />}
                              {svc.type === 'sightseeing' && <Mountain className="w-4 h-4 text-teal-600" />}
                              {svc.type === 'activity' && <Compass className="w-4 h-4 text-purple-600" />}
                              {svc.type === 'meal' && <Utensils className="w-4 h-4 text-rose-600" />}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {svc.type === 'flight' && `${svc.data?.airline || 'Flight'} ${svc.data?.flightNumber || ''} (${svc.data?.from || 'Origin'} → ${svc.data?.to || 'Dest'})`}
                                {svc.type === 'hotel' && `${svc.data?.name || 'Hotel'} (${svc.data?.roomType || svc.data?.room || 'Deluxe Room'})`}
                                {svc.type === 'cab' && `${svc.data?.vehicle || 'Cab'} · ${svc.data?.pickup || ''} to ${svc.data?.drop || ''}`}
                                {svc.type === 'bus' && `${svc.data?.operator || 'Bus'} (${svc.data?.busType || 'Volvo'})`}
                                {svc.type === 'sightseeing' && (
                                  <span>
                                    {svc.data?.items?.map((i) => i.name).join(' · ') || 'Sightseeing Tour'}
                                  </span>
                                )}
                                {svc.type === 'activity' && (svc.data?.items?.map((i) => i.name).join(', ') || 'Adventure Tour')}
                                {svc.type === 'meal' && (svc.data?.items?.filter((i) => i.enabled).map((i) => i.name).join(', ') || 'Buffet Meals')}
                              </p>
                              <div className="text-[11px] text-slate-500">
                                {svc.type === 'flight' && `Dep: ${svc.data?.departure || '09:00'} · Cabin: ${svc.data?.cabin || 'Economy'}`}
                                {svc.type === 'hotel' && `Meal Plan: ${svc.data?.mealPlan || svc.data?.meal || 'Breakfast Included'} · ${svc.data?.stars || 4} Stars`}
                                {svc.type === 'cab' && `Category: ${svc.data?.category || 'Sedan'} · Time: ${svc.data?.time || '12:30 PM'}`}
                                {svc.type === 'bus' && `Timing: ${svc.data?.departure || '21:00'} to ${svc.data?.arrival || '08:00'}`}
                                {svc.type === 'sightseeing' && (
                                  <span className="text-teal-700 font-medium inline-flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-teal-600" />
                                    <span>
                                      Cover Locations:{' '}
                                      {Array.from(
                                        new Set(
                                          (svc.data?.items || [])
                                            .map((i) => i.location || day.location || packageData.destination)
                                            .filter(Boolean)
                                        )
                                      ).join(' · ') || 'Local Sightseeing'}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 shrink-0">
                            Included
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* =====================================================================
             9. DETAILED COMMERCIAL PRICE BREAKDOWN (EXACT PLACEMENT & STYLING)
             Appears directly after Itinerary and before Inclusions/Exclusions
             ===================================================================== */}
          <div id="price-breakdown-section" className="space-y-4 pt-6 border-t border-slate-100 break-inside-avoid">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 rounded-full bg-orange-500"></span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Commercial Price Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">
                    Itemized commercial tariff and financial quotation for all included services and taxes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-orange-800 bg-orange-100/80 px-3 py-1 rounded-full border border-orange-200 inline-flex items-center gap-1.5">
                  <Receipt className="w-3 h-3 text-orange-600" />
                  <span>Itemized Tariff</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
                  GST &amp; Levies Included
                </span>
              </div>
            </div>

            {showPriceBreakdown && visibleBreakdownItems.length > 0 ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                {/* Table Column Headers */}
                <div className="grid grid-cols-12 bg-slate-50/90 border-b border-slate-200 px-4 sm:px-6 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <div className="col-span-6 sm:col-span-5">Component / Service</div>
                  <div className="col-span-3 sm:col-span-4 text-left">Details &amp; Inclusions</div>
                  <div className="col-span-3 sm:col-span-3 text-right">Amount (INR)</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {visibleBreakdownItems.map((item) => {
                    const isGrandTotal = item.key === 'grandTotal';
                    if (isGrandTotal) return null; // Rendered in dedicated grand total footer block

                    let ServiceIcon = Receipt;
                    let iconColor = 'text-slate-600';
                    let bgIcon = 'bg-slate-100';

                    if (item.key === 'flights') {
                      ServiceIcon = Plane;
                      iconColor = 'text-blue-600';
                      bgIcon = 'bg-blue-50';
                    } else if (item.key === 'hotels') {
                      ServiceIcon = Building2;
                      iconColor = 'text-indigo-600';
                      bgIcon = 'bg-indigo-50';
                    } else if (item.key === 'cabs') {
                      ServiceIcon = Car;
                      iconColor = 'text-emerald-600';
                      bgIcon = 'bg-emerald-50';
                    } else if (item.key === 'buses') {
                      ServiceIcon = Bus;
                      iconColor = 'text-amber-600';
                      bgIcon = 'bg-amber-50';
                    } else if (item.key === 'sightseeing') {
                      ServiceIcon = Mountain;
                      iconColor = 'text-teal-600';
                      bgIcon = 'bg-teal-50';
                    } else if (item.key === 'activities') {
                      ServiceIcon = Compass;
                      iconColor = 'text-purple-600';
                      bgIcon = 'bg-purple-50';
                    } else if (item.key === 'meals') {
                      ServiceIcon = Utensils;
                      iconColor = 'text-rose-600';
                      bgIcon = 'bg-rose-50';
                    } else if (item.key === 'tax') {
                      ServiceIcon = Percent;
                      iconColor = 'text-orange-600';
                      bgIcon = 'bg-orange-50';
                    } else if (item.key === 'discount') {
                      ServiceIcon = Tag;
                      iconColor = 'text-emerald-600';
                      bgIcon = 'bg-emerald-50';
                    }

                    return (
                      <div
                        key={item.key}
                        className="grid grid-cols-12 px-4 sm:px-6 py-3.5 items-center hover:bg-slate-50/60 transition"
                      >
                        <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bgIcon}`}>
                            <ServiceIcon className={`w-4 h-4 ${iconColor}`} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {item.label}
                            </span>
                            {item.key === 'flights' && (
                              <span className="text-[11px] text-slate-500">Scheduled flight sectors &amp; cabin bag</span>
                            )}
                            {item.key === 'hotels' && (
                              <span className="text-[11px] text-slate-500">Verified hotel rooms with meal plans</span>
                            )}
                            {item.key === 'cabs' && (
                              <span className="text-[11px] text-slate-500">Private dedicated cab transfers &amp; sightseeing</span>
                            )}
                            {item.key === 'sightseeing' && (
                              <span className="text-[11px] text-slate-500">Curated monument entry &amp; excursion tours</span>
                            )}
                            {item.key === 'buses' && (
                              <span className="text-[11px] text-slate-500">Intercity Volvo / luxury coach tickets</span>
                            )}
                            {item.key === 'activities' && (
                              <span className="text-[11px] text-slate-500">Adventure sports &amp; activity passes</span>
                            )}
                            {item.key === 'meals' && (
                              <span className="text-[11px] text-slate-500">Breakfast &amp; scheduled dining inclusions</span>
                            )}
                            {item.key === 'tax' && (
                              <span className="text-[11px] text-slate-500">Applicable Goods &amp; Services Tax (GST)</span>
                            )}
                            {item.key === 'discount' && (
                              <span className="text-[11px] text-emerald-600 font-semibold">Special promotional waiver applied</span>
                            )}
                          </div>
                        </div>

                        <div className="col-span-3 sm:col-span-4 text-slate-600 text-xs">
                          {item.count ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px]">
                              {item.count} {item.count === 1 ? 'Unit / Service' : 'Units / Services'}
                            </span>
                          ) : item.key === 'tax' ? (
                            <span className="text-slate-500 text-[11px]">Government Statutory</span>
                          ) : item.key === 'discount' ? (
                            <span className="text-emerald-700 font-semibold text-[11px]">Promotional Concession</span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Package Inclusions</span>
                          )}
                        </div>

                        <div className="col-span-3 sm:col-span-3 text-right">
                          <span
                            className={`font-mono text-sm sm:text-base font-bold ${
                              item.amount < 0
                                ? 'text-emerald-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {item.amount < 0
                              ? `- ${inr(Math.abs(item.amount))}`
                              : inr(item.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grand Total Footer Card */}
                <div className="bg-[#FFF8F2] border-t-2 border-orange-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-800">
                      Total Package Commercial Quotation
                    </span>
                    <p className="text-xs text-slate-600">
                      All-in cost for <strong className="text-slate-900">{totalTravelers} {totalTravelers === 1 ? 'Traveler' : 'Travelers'}</strong> ({inr(perPerson)} per person), all taxes, vehicle permits, and statutory levies included.
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-2xl sm:text-3xl font-black text-orange-600 font-mono tracking-tight block">
                      {inr(finalTotal)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Net Amount (INR)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Consolidated Total Fallback if breakdown is disabled */
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">
                    Consolidated All-Inclusive Package Quote
                  </h4>
                  <p className="text-xs text-slate-600">
                    Includes all accommodations, transfers, sightseeing excursions, and taxes as detailed in the itinerary above.
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
                    {inr(finalTotal)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {inr(perPerson)} per person ({totalTravelers} {totalTravelers === 1 ? 'traveler' : 'travelers'})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* =====================================================================
             10. INCLUSIONS & EXCLUSIONS (MATCHING PAGE 3)
             ===================================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Inclusions */}
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm sm:text-base text-emerald-950">Inclusions</h4>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-emerald-900">
                {(packageData.inclusions || [
                  'Accommodation in pre-selected standard / deluxe hotel rooms.',
                  'Daily breakfast and meals as per the package itinerary.',
                  'All sightseeing tours and private transfers by AC vehicle.',
                  'Toll taxes, state permits, parking fees, and driver allowances.',
                  '24x7 on-call customer support and dedicated tour manager assistance.'
                ]).map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclusions */}
            <div className="border border-red-200 bg-red-50/40 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h4 className="font-bold text-sm sm:text-base text-red-950">Exclusions</h4>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-red-900">
                {(packageData.exclusions || [
                  'Airfare or train fare unless explicitly included in the quote.',
                  'Personal expenses such as laundry, telephone calls, tips, and minibar.',
                  'Monument entry fees, camera charges, and adventure sport passes.',
                  'Cost arising from natural calamities, landslides, or road blocks.',
                  'Any additional meals or room service orders outside the package plan.'
                ]).map((exc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">✕</span>
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* =====================================================================
             10. TERMS AND CONDITIONS (FILTERED BY POLICY VISIBILITY)
             ===================================================================== */}
          {termsPolicy && Array.isArray(termsPolicy.items) && termsPolicy.items.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm sm:text-base text-slate-900">
                  Terms &amp; Conditions
                </h4>
                <span className="text-[11px] font-medium text-slate-400">
                  {termsPolicy.items.length} clauses
                </span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed list-disc list-inside">
                {termsPolicy.items.map((term, i) => (
                  <li key={i} className="pl-1 text-slate-700">
                    <span className="font-medium text-slate-800">{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* =====================================================================
             11. CANCELLATION, DATE CHANGE & OTHER POLICIES (FILTERED BY VISIBILITY)
             ===================================================================== */}
          {(cancellationPolicy || dateChangePolicy || otherVisiblePolicies.length > 0) && (
            <div className="space-y-6 pt-4 border-t border-slate-100">
              {/* Cancellation Policy */}
              {cancellationPolicy && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900">
                      Cancellation &amp; Refund Policy
                    </h4>
                    <span className="text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                      Tiered Slabs
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(cancellationPolicy.rules || []).map((rule, idx) => {
                      const isSevere =
                        (rule.charge || '').includes('100%') ||
                        (rule.refund || '').toLowerCase().includes('non-refundable');
                      return (
                        <div
                          key={idx}
                          className={`border rounded-xl p-3.5 space-y-1 ${
                            isSevere
                              ? 'border-red-200 bg-red-50/50'
                              : 'border-emerald-200 bg-emerald-50/50'
                          }`}
                        >
                          <div
                            className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                              isSevere ? 'text-red-800' : 'text-emerald-800'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isSevere ? 'bg-red-200 text-red-800' : 'bg-emerald-200 text-emerald-800'
                              }`}
                            >
                              {isSevere ? '✕' : '✓'}
                            </span>
                            <span>{rule.timeframe}</span>
                          </div>
                          <p
                            className={`text-xs font-semibold mt-1 ${
                              isSevere ? 'text-red-950' : 'text-emerald-950'
                            }`}
                          >
                            Cancellation charge: {rule.charge}
                          </p>
                          {rule.refund && (
                            <p
                              className={`text-[11px] ${
                                isSevere ? 'text-red-700' : 'text-emerald-700'
                              }`}
                            >
                              {rule.refund}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {cancellationPolicy.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      Note: {cancellationPolicy.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Date Change Policy */}
              {dateChangePolicy && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900">
                      Date Change Policy
                    </h4>
                    <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      Rescheduling Terms
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(dateChangePolicy.rules || []).map((rule, idx) => {
                      const isRestrictive =
                        (rule.charge || '').toLowerCase().includes('supplier') ||
                        (rule.remark || '').toLowerCase().includes('cancellation');
                      return (
                        <div
                          key={idx}
                          className={`border rounded-xl p-3.5 space-y-1 ${
                            isRestrictive
                              ? 'border-amber-200 bg-amber-50/50'
                              : 'border-blue-200 bg-blue-50/50'
                          }`}
                        >
                          <div
                            className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                              isRestrictive ? 'text-amber-800' : 'text-blue-800'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isRestrictive ? 'bg-amber-200 text-amber-800' : 'bg-blue-200 text-blue-800'
                              }`}
                            >
                              {isRestrictive ? '!' : '✓'}
                            </span>
                            <span>{rule.timeframe}</span>
                          </div>
                          <p
                            className={`text-xs font-semibold mt-1 ${
                              isRestrictive ? 'text-amber-950' : 'text-blue-950'
                            }`}
                          >
                            {rule.charge}
                          </p>
                          {rule.remark && (
                            <p
                              className={`text-[11px] ${
                                isRestrictive ? 'text-amber-700' : 'text-blue-700'
                              }`}
                            >
                              {rule.remark}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {dateChangePolicy.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      Note: {dateChangePolicy.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Other Modular Policies (Booking, Payment, Child, Hotel, Transportation, General, Custom) */}
              {otherVisiblePolicies.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900">
                    Additional Policies &amp; Guidelines
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {otherVisiblePolicies.map((pol, idx) => (
                      <div
                        key={pol.id || pol.key || idx}
                        className="border border-slate-200 bg-slate-50/60 rounded-xl p-4 space-y-2"
                      >
                        <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                          <span>{pol.title}</span>
                        </h5>
                        {Array.isArray(pol.items) && pol.items.length > 0 && (
                          <ul className="space-y-1 text-xs text-slate-600 leading-relaxed">
                            {pol.items.map((pt, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {pol.content && (
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                            {pol.content}
                          </p>
                        )}
                        {pol.notes && (
                          <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">
                            {pol.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
             12. DOCUMENT FOOTER (MATCHING PAGE 4)
             ===================================================================== */}
          <div className="pt-8 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-bold text-sm text-slate-900">
                Make My Bharat Yatra (MMBY Holidays)
              </p>
              <p>Registered Travel Agency &amp; Tour Operator | GSTIN: 07AAACT9182P1Z5</p>
              <p>Email: support@makemybharatyatra.com · Phone: +91 98765 43210</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center sm:text-right space-y-0.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Holiday Consultant
              </span>
              <p className="font-bold text-sm text-slate-900">
                {packageData.consultantName || 'Ankit Sharma'}
              </p>
              <p className="text-[11px] text-slate-600">+91 98112 34567</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Ticket / Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h4 className="font-bold text-sm text-slate-900">{previewImage.title}</h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
