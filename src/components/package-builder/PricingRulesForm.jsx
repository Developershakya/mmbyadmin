import React from 'react';
import {
  DollarSign,
  Receipt,
  Percent,
  Tag,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  ArrowLeft,
  Check,
  Plane,
  Building2,
  Car,
  Bus,
  Mountain,
  Compass,
  Utensils,
  HelpCircle
} from 'lucide-react';
import StepperControl from './StepperControl.jsx';

const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

export default function PricingRulesForm({
  packageData,
  setPackageData,
  onBack,
  onContinue,
  showToast
}) {
  const travelers = packageData.travelers || { adults: 2, children: 0 };
  const totalTravelers = Math.max((travelers.adults || 0) + (travelers.children || 0), 1);

  // Compute breakdown from all days
  let flightTotal = 0;
  let hotelTotal = 0;
  let cabTotal = 0;
  let busTotal = 0;
  let sightseeingTotal = 0;
  let activityTotal = 0;
  let mealTotal = 0;

  (packageData.days || []).forEach((day) => {
    (day.services || []).forEach((svc) => {
      const d = svc.data || {};
      if (svc.type === 'flight') {
        const fare = Number(d.fare || 0);
        const tax = Number(d.tax || 0);
        flightTotal += (fare + tax) * totalTravelers;
      } else if (svc.type === 'hotel') {
        const price = Number(d.price || 0);
        const nights = Number(d.nights || 1);
        hotelTotal += price * nights;
      } else if (svc.type === 'cab') {
        cabTotal += Number(d.price || 0);
      } else if (svc.type === 'bus') {
        const busFare = Number(d.price || 0);
        busTotal += busFare * totalTravelers;
      } else if (svc.type === 'sightseeing') {
        (d.items || []).forEach((item) => {
          sightseeingTotal += Number(item.price || 0) * totalTravelers;
        });
      } else if (svc.type === 'activity') {
        (d.items || []).forEach((item) => {
          activityTotal += Number(item.price || 0) * totalTravelers;
        });
      } else if (svc.type === 'meal') {
        (d.items || []).forEach((item) => {
          if (item.enabled) {
            mealTotal += Number(item.price || 0) * totalTravelers;
          }
        });
      }
    });
  });

  const baseTotal =
    flightTotal +
    hotelTotal +
    cabTotal +
    busTotal +
    sightseeingTotal +
    activityTotal +
    mealTotal;

  const pricing = packageData.pricing || {
    markup: 3000,
    tax: 2600,
    discount: 1000,
    gstRate: 5
  };

  const gstRate = pricing.gstRate !== undefined ? pricing.gstRate : 5;
  const markup = Number(pricing.markup) || 0;
  const discount = Number(pricing.discount) || 0;

  // Auto calculate tax if GST rate is set
  const calculatedTax = Math.round(((baseTotal + markup) * gstRate) / 100);
  const finalTax = pricing.customTax !== undefined ? pricing.customTax : calculatedTax;

  const finalTotal = Math.max(baseTotal + markup + finalTax - discount, 0);
  const perPerson = Math.round(finalTotal / totalTravelers);

  const customization = packageData.customization || {
    flight: true,
    hotel: true,
    cab: true,
    bus: false,
    sightseeing: true,
    activity: true,
    meal: true
  };

  const toggleCustomization = (key) => {
    setPackageData((prev) => ({
      ...prev,
      customization: {
        ...(prev.customization || {}),
        [key]: !customization[key]
      }
    }));
  };

  const setGstRate = (rate) => {
    const newTax = Math.round(((baseTotal + markup) * rate) / 100);
    setPackageData((prev) => ({
      ...prev,
      pricing: {
        ...(prev.pricing || {}),
        gstRate: rate,
        tax: newTax,
        customTax: undefined
      }
    }));
  };

  return (
    <div id="pricing-rules-form" className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Pricing &amp; Commercial Rules</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time component aggregation, agency markup, GST calculation, and customer customization rules.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Itinerary</span>
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition cursor-pointer shadow-xs active:scale-98"
          >
            <span>Preview Voucher</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* COMPONENT BREAKDOWN GRID */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-[#0F172A]">Real-Time Base Cost Breakdown</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            For {totalTravelers} Traveler{totalTravelers > 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Flights */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
            <div className="flex items-center justify-between text-blue-700">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5" /> Flights
              </span>
              <span className="text-xs font-bold">{inr(flightTotal)}</span>
            </div>
            <p className="text-[11px] text-blue-600/80">Fare &amp; taxes for all travelers</p>
          </div>

          {/* Hotels */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
            <div className="flex items-center justify-between text-indigo-700">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Hotels &amp; Stay
              </span>
              <span className="text-xs font-bold">{inr(hotelTotal)}</span>
            </div>
            <p className="text-[11px] text-indigo-600/80">Room tariff x nights</p>
          </div>

          {/* Cabs */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5" /> Private Transfers
              </span>
              <span className="text-xs font-bold">{inr(cabTotal)}</span>
            </div>
            <p className="text-[11px] text-emerald-600/80">Cabs &amp; vehicle rentals</p>
          </div>

          {/* Buses */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5" /> Volvo / Buses
              </span>
              <span className="text-xs font-bold">{inr(busTotal)}</span>
            </div>
            <p className="text-[11px] text-amber-600/80">Intercity bus tickets</p>
          </div>

          {/* Sightseeing */}
          <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 space-y-1">
            <div className="flex items-center justify-between text-teal-700">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5" /> Sightseeing Tours
              </span>
              <span className="text-xs font-bold">{inr(sightseeingTotal)}</span>
            </div>
            <p className="text-[11px] text-teal-600/80">Entry tickets &amp; viewpoints</p>
          </div>

          {/* Activities & Meals */}
          <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1">
            <div className="flex items-center justify-between text-purple-700">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Activities &amp; Meals
              </span>
              <span className="text-xs font-bold">{inr(activityTotal + mealTotal)}</span>
            </div>
            <p className="text-[11px] text-purple-600/80">Adventure &amp; dining plans</p>
          </div>
        </div>

        {/* Aggregated Base Banner */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 text-white font-medium text-sm">
          <span className="text-slate-300">Total Net Service Supplier Cost (A):</span>
          <span className="text-lg font-bold text-orange-400">{inr(baseTotal)}</span>
        </div>
      </div>

      {/* MARKUP, TAXES & DISCOUNT CONFIGURATION (With Stepper Controls) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Markup Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-sm text-[#0F172A]">Agency Margin (Markup)</h3>
          </div>

          <StepperControl
            id="stepper-markup"
            label="Profit Markup"
            value={markup}
            onChange={(val) =>
              setPackageData((prev) => ({
                ...prev,
                pricing: { ...(prev.pricing || {}), markup: val }
              }))
            }
            step={500}
            min={0}
            max={500000}
            prefix="₹"
            subLabel="Agency gross profit"
          />

          <p className="text-xs text-slate-500">
            Added on top of net supplier cost before GST calculation.
          </p>
        </div>

        {/* GST / Tax Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-sm text-[#0F172A]">Taxes &amp; GST</h3>
            </div>
            <span className="text-xs font-bold text-blue-600">{inr(finalTax)}</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
              GST Slab Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '0% Exempt', rate: 0 },
                { label: '5% Standard', rate: 5 },
                { label: '12% Combined', rate: 12 },
                { label: '18% Luxury', rate: 18 }
              ].map((slab) => (
                <button
                  key={slab.rate}
                  type="button"
                  onClick={() => setGstRate(slab.rate)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                    gstRate === slab.rate
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {slab.label}
                </button>
              ))}
            </div>
          </div>

          <StepperControl
            id="stepper-tax-adjust"
            label="Tax Amount (₹)"
            value={finalTax}
            onChange={(val) =>
              setPackageData((prev) => ({
                ...prev,
                pricing: { ...(prev.pricing || {}), customTax: val, tax: val }
              }))
            }
            step={100}
            min={0}
            max={100000}
            prefix="₹"
            subLabel="Computed or custom"
          />
        </div>

        {/* Promotional Discount Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Tag className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-sm text-[#0F172A]">Customer Discount</h3>
          </div>

          <StepperControl
            id="stepper-discount"
            label="Special Promo Offer"
            value={discount}
            onChange={(val) =>
              setPackageData((prev) => ({
                ...prev,
                pricing: { ...(prev.pricing || {}), discount: val }
              }))
            }
            step={500}
            min={0}
            max={50000}
            prefix="₹"
            subLabel="Early bird / coupon"
          />

          <p className="text-xs text-slate-500">
            Deducted from the grand total to incentivize instant bookings.
          </p>
        </div>
      </div>

      {/* NET CALCULATION SUMMARY CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-400">
              Commercial Net Pricing Formula
            </span>
            <h3 className="text-lg font-bold text-white">
              Grand Total Package Value
            </h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Per Person ({totalTravelers} Pax)</p>
            <p className="text-2xl font-black text-emerald-400">{inr(perPerson)}</p>
          </div>
        </div>

        {/* Math equation bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-[11px] text-slate-400">Net Base Cost</p>
            <p className="text-base font-bold text-white">{inr(baseTotal)}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-[11px] text-emerald-400">+ Agency Markup</p>
            <p className="text-base font-bold text-emerald-400">+{inr(markup)}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-[11px] text-blue-400">+ GST Taxes ({gstRate}%)</p>
            <p className="text-base font-bold text-blue-400">+{inr(finalTax)}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-[11px] text-orange-400">- Promo Discount</p>
            <p className="text-base font-bold text-orange-400">-{inr(discount)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-sm font-semibold text-slate-300">
            Customer Selling Price (All In):
          </span>
          <span className="text-2xl sm:text-3xl font-black text-orange-400">
            {inr(finalTotal)}
          </span>
        </div>
      </div>

      {/* CUSTOMER CUSTOMIZATION PERMISSIONS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <h3 className="font-bold text-sm text-[#0F172A]">
            Customer Customization Permissions
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Specify which services the customer is allowed to upgrade, change, or remove when customizing this package online.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {[
            { key: 'flight', label: 'Flight Airlines & Timings', icon: Plane },
            { key: 'hotel', label: 'Hotel & Room Upgrades', icon: Building2 },
            { key: 'cab', label: 'Cab Vehicle Category', icon: Car },
            { key: 'bus', label: 'Bus Operator & Seats', icon: Bus },
            { key: 'sightseeing', label: 'Sightseeing Tours Selection', icon: Mountain },
            { key: 'activity', label: 'Adventure Activities', icon: Compass },
            { key: 'meal', label: 'Meal Inclusions (MAP / AP)', icon: Utensils }
          ].map((item) => {
            const isEnabled = customization[item.key] !== false;
            const IconComp = item.icon;
            return (
              <div
                key={item.key}
                onClick={() => toggleCustomization(item.key)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  isEnabled
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconComp className={`w-4 h-4 ${isEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold">{item.label}</span>
                </div>
                {isEnabled ? (
                  <ToggleRight className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Itinerary</span>
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition cursor-pointer shadow-sm active:scale-98"
        >
          <span>Continue to Policy</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
