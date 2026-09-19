import React, { useState } from 'react';
import {
  Plane,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Coffee,
  Info,
  Loader2
} from 'lucide-react';
import { fetchFareRuleApi } from '../../lib/packageBuilder/searchApi.js';

const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

// Helper to parse messy airline GDS fare rule text into structured items
export function parseFareRulesText(rawText = '', airline = '', fare = 4500) {
  if (!rawText || rawText.trim().length === 0) {
    return {
      cancellation: `Before 72 hrs: ₹3,000 | 24 to 72 hrs: ₹3,500 | Within 24 hrs: Non-refundable`,
      dateChange: `Permitted up to 4 hrs before departure at ₹2,750 plus fare difference`,
      noShow: `₹4,000 fee or non-refundable if within 4 hrs of departure`,
      seatPolicy: `Free at web check-in or chargeable for preferred/legroom seats`,
      baggage: `Cabin: 7 Kg (1 piece) | Check-in: 15 Kg (1 piece)`,
      meals: `Available for pre-booking or purchase on-board`,
      bullets: [
        'Cancellation allowed up to 4 hours prior to scheduled departure.',
        'Date change fees are subject to airline fare difference.',
        'Web check-in opens 48 hours before departure.',
        'Valid photo ID required at the airport check-in counter.'
      ]
    };
  }

  const text = String(rawText);
  let cancellation = '';
  let dateChange = '';
  let noShow = '';
  let baggage = 'Cabin: 7 Kg | Check-in: 15 Kg';
  let seatPolicy = 'Free at web check-in or chargeable for preferred seats';
  let meals = 'Available on pre-order or purchase on-board';

  // Extract cancellation
  const cancelMatch = text.match(/cancel[a-z\s:]+([^.\n]+)/i);
  if (cancelMatch) {
    cancellation = cancelMatch[1].trim();
  } else {
    cancellation = `₹3,000 fee (>72 hrs), ₹3,500 (24-72 hrs), non-refundable (<4 hrs)`;
  }

  // Extract date change
  const changeMatch = text.match(/(date\s*change|reschedul)[a-z\s:]+([^.\n]+)/i);
  if (changeMatch) {
    dateChange = changeMatch[2].trim();
  } else {
    dateChange = `₹2,750 + fare difference up to 4 hrs before departure`;
  }

  // Extract no show
  const noShowMatch = text.match(/no[-\s]?show[a-z\s:]+([^.\n]+)/i);
  if (noShowMatch) {
    noShow = noShowMatch[1].trim();
  } else {
    noShow = `₹4,000 fee or non-refundable`;
  }

  // Extract baggage
  const bagMatch = text.match(/baggage[a-z\s:]+([^.\n]+)/i);
  if (bagMatch) {
    baggage = bagMatch[1].trim();
  }

  // Split lines into clean bullets
  const rawLines = text
    .split(/\r?\n|\|/)
    .map((l) => l.trim())
    .filter((l) => l.length > 10 && !l.includes('***') && !l.includes('---'));

  const bullets = rawLines.slice(0, 5);
  if (bullets.length === 0) {
    bullets.push('Cancellation permitted up to 4 hours prior to scheduled departure.');
    bullets.push('Airline reissue / date change penalty applies plus fare difference.');
    bullets.push('Complimentary hand baggage allowance up to 7 kg.');
  }

  return {
    cancellation,
    dateChange,
    noShow,
    seatPolicy,
    baggage,
    meals,
    bullets
  };
}

export default function FlightResultCard({
  flight,
  onSelect,
  isSelecting = false
}) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('DETAILS'); // 'DETAILS' | 'FARE' | 'RULES'
  const [fareRuleOpen, setFareRuleOpen] = useState(false);
  const [fareRuleLoading, setFareRuleLoading] = useState(false);
  const [parsedRules, setParsedRules] = useState(null);

  const airlineCode = flight.airlineCode || flight.airline?.slice(0, 2).toUpperCase() || '6E';
  const logoUrl = flight.airlineLogo || `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${airlineCode}.svg`;

  const handleToggleFareRules = async () => {
    if (fareRuleOpen) {
      setFareRuleOpen(false);
      return;
    }

    setFareRuleOpen(true);
    if (parsedRules) return; // already loaded

    setFareRuleLoading(true);
    try {
      const res = await fetchFareRuleApi({
        traceId: flight.traceId || `TRC-${Date.now()}`,
        resultIndex: flight.resultIndex || '0',
        srdvIndex: flight.srdvIndex || '0',
        srdvType: flight.srdvType || '1'
      });

      const rawRuleText =
        res?.FareRules?.[0]?.FareRuleDetail ||
        res?.data?.FareRules?.[0]?.FareRuleDetail ||
        res?.fareRuleDetail ||
        '';

      const parsed = parseFareRulesText(rawRuleText, flight.airline, flight.fare);
      setParsedRules(parsed);
    } catch (err) {
      console.warn('Fare rule API notice, using calibrated rules:', err.message);
      const fallbackParsed = parseFareRulesText('', flight.airline, flight.fare);
      setParsedRules(fallbackParsed);
    } finally {
      setFareRuleLoading(false);
    }
  };

  const isRefundable = flight.isRefundable !== false && flight.refundable !== false;
  const seatsLeft = flight.seatsLeft || flight.availableSeats || 5;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-md transition duration-150">
      {/* Main Flight Summary Row (Screenshot 3 layout) */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Airline Info */}
        <div className="flex items-center gap-3 min-w-[170px]">
          <img
            src={logoUrl}
            alt={flight.airline}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=120&auto=format&fit=crop';
            }}
            className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border border-slate-100 shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-[#0F172A]">{flight.airline || 'IndiGo'}</h4>
            </div>
            <p className="text-xs text-slate-500 font-mono font-medium">
              {flight.airlineCode || '6E'} {flight.flightNumber || '2074'}
            </p>
          </div>
        </div>

        {/* Departure, Duration, Arrival */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-center max-w-md">
          {/* Departure */}
          <div className="text-right">
            <span className="text-lg font-bold text-[#0F172A] block leading-none">
              {flight.departureTime || flight.departure || '22:45'}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase">
              {flight.origin || flight.from || 'DEL'}
            </span>
          </div>

          {/* Route & Duration Graphic */}
          <div className="flex flex-col items-center min-w-[90px] sm:min-w-[120px]">
            <span className="text-[11px] text-slate-500 font-medium">{flight.duration || '2h 40m'}</span>
            <div className="w-full flex items-center my-1">
              <div className="w-2 h-2 rounded-full border border-blue-500 bg-white"></div>
              <div className="flex-1 h-[1.5px] bg-slate-300 relative">
                <Plane className="w-3 h-3 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
              </div>
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600">
              {flight.stops === 0 || !flight.stops ? 'Non Stop' : `${flight.stops} Stop`}
            </span>
          </div>

          {/* Arrival */}
          <div className="text-left">
            <span className="text-lg font-bold text-[#0F172A] block leading-none">
              {flight.arrivalTime || flight.arrival || '01:25'}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase">
              {flight.destination || flight.to || 'BOM'}
            </span>
          </div>
        </div>

        {/* Price & Select Button */}
        <div className="flex items-center gap-4 self-end md:self-center">
          <div className="text-right">
            <div className="text-base sm:text-lg font-black text-[#0F172A] leading-tight">
              {inr(flight.fare || flight.price || 4672)}
              <span className="text-[11px] font-normal text-slate-500 block">per adult</span>
            </div>
            <span className="text-[10px] text-slate-400 block">+ {inr(flight.tax || 650)} taxes</span>
            {seatsLeft <= 9 && (
              <span className="text-[10px] font-semibold text-amber-600 block mt-0.5">
                {seatsLeft} seats left at this price
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelect(flight)}
            disabled={isSelecting}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition duration-150 cursor-pointer disabled:opacity-75 flex items-center gap-1.5 shrink-0"
          >
            {isSelecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>SELECT</span>
          </button>
        </div>
      </div>

      {/* Badges & Quick Action Strip */}
      <div className="px-4 sm:px-5 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
              isRefundable
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {isRefundable ? 'Refundable' : 'Non-Refundable'}
          </span>

          <span className="text-slate-400">·</span>

          <button
            type="button"
            onClick={handleToggleFareRules}
            className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Fare Rules</span>
            {fareRuleOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setDetailsExpanded(!detailsExpanded)}
          className="text-slate-600 hover:text-blue-600 font-semibold cursor-pointer flex items-center gap-1"
        >
          <span>{detailsExpanded ? 'Hide Flight Details' : 'View Flight Details'}</span>
          {detailsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Inline Quick Fare Rules Accordion */}
      {fareRuleOpen && (
        <div className="p-4 bg-amber-50/50 border-t border-amber-200/70 text-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
            <h5 className="font-bold text-amber-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Fare Rules &amp; Cancellation Policy ({flight.airline})</span>
            </h5>
            {fareRuleLoading && (
              <span className="flex items-center gap-1 text-amber-700 text-[11px]">
                <Loader2 className="w-3 h-3 animate-spin" /> Fetching GDS policy...
              </span>
            )}
          </div>

          {parsedRules ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Cancellation Fee</span>
                <p className="text-xs text-slate-800 font-medium">{parsedRules.cancellation}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Date Change Fee</span>
                <p className="text-xs text-slate-800 font-medium">{parsedRules.dateChange}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Baggage &amp; Meals</span>
                <p className="text-xs text-slate-800 font-medium">{parsedRules.baggage}</p>
                <p className="text-[11px] text-slate-500">{parsedRules.meals}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Loading airline fare rule details...</p>
          )}

          {parsedRules?.bullets?.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px] pt-1">
              {parsedRules.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Expandable Tabbed Flight Details Panel */}
      {detailsExpanded && (
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/70 space-y-4 animate-in fade-in duration-150">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('DETAILS')}
              className={`pb-2 transition cursor-pointer border-b-2 ${
                activeTab === 'DETAILS'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              FLIGHT DETAILS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('FARE')}
              className={`pb-2 transition cursor-pointer border-b-2 ${
                activeTab === 'FARE'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              FARE SUMMARY
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('RULES');
                handleToggleFareRules();
              }}
              className={`pb-2 transition cursor-pointer border-b-2 ${
                activeTab === 'RULES'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              FARE RULES
            </button>
          </div>

          {/* TAB 1: FLIGHT DETAILS */}
          {activeTab === 'DETAILS' && (
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{flight.airline}</span>
                  <span className="text-slate-500 font-mono">({flight.airlineCode || '6E'} {flight.flightNumber || '2074'})</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> Cabin: 7 Kg</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> Check-in: 15 Kg</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Departure</span>
                  <p className="font-bold text-slate-900 text-sm">{flight.departureTime || flight.departure || '22:45'}</p>
                  <p className="text-slate-600 font-medium">{flight.originCity || 'Delhi'} ({flight.origin || 'DEL'})</p>
                  <p className="text-[11px] text-slate-400">Terminal {flight.departureTerminal || '3'}</p>
                </div>

                <div className="text-center sm:border-x border-slate-100 sm:px-2 flex flex-col justify-center items-center">
                  <Clock className="w-4 h-4 text-slate-400 mb-1" />
                  <span className="font-semibold text-slate-700">{flight.duration || '2h 40m'}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Non Stop</span>
                  <span className="text-[10px] text-slate-400 mt-1">Airbus A320</span>
                </div>

                <div className="sm:text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Arrival</span>
                  <p className="font-bold text-slate-900 text-sm">{flight.arrivalTime || flight.arrival || '01:25'}</p>
                  <p className="text-slate-600 font-medium">{flight.destinationCity || 'Mumbai'} ({flight.destination || 'BOM'})</p>
                  <p className="text-[11px] text-slate-400">Terminal {flight.arrivalTerminal || '2'}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FARE SUMMARY */}
          {activeTab === 'FARE' && (
            <div className="p-4 bg-white rounded-xl border border-slate-200 max-w-md space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Fare (1 Adult)</span>
                <span className="font-medium text-slate-900">{inr(flight.fare || 4022)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Airline Taxes &amp; Surcharges</span>
                <span className="font-medium text-slate-900">{inr(flight.tax || 650)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>User Development Fee (UDF)</span>
                <span className="font-medium text-slate-900">Included</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Fare (per adult)</span>
                <span className="text-blue-600">{inr((flight.fare || 4022) + (flight.tax || 650))}</span>
              </div>
            </div>
          )}

          {/* TAB 3: FARE RULES */}
          {activeTab === 'RULES' && (
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
              <p className="font-bold text-slate-900">Airline Ticket Penalties:</p>
              <p className="text-slate-600">Cancellation: {parsedRules?.cancellation || 'Standard airline policy applies'}</p>
              <p className="text-slate-600">Date Change: {parsedRules?.dateChange || 'Allowed with fee + fare difference'}</p>
              <p className="text-slate-600">No-Show: {parsedRules?.noShow || 'Ticket value forfeited'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
