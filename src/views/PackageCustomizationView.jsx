import React, { useState } from 'react';
import {
  Sliders,
  Plane,
  Hotel,
  Car,
  Compass,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  ShieldAlert,
  ArrowRight,
  Settings,
  Edit3,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Calendar,
  IndianRupee,
  Eye,
  Check
} from 'lucide-react';
import PageHeader from '../components/admin/PageHeader.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import {
  FlightCustomizationModal,
  HotelCustomizationModal,
  CabCustomizationModal,
  SightseeingCustomizationModal,
  CustomizationRulesModal
} from '../components/admin/CustomizationModals.jsx';

export default function PackageCustomizationView({
  packages = [],
  customizationConfig = {},
  onSaveCustomization,
  onShowToast,
  onNavigate
}) {
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || 'PKG-001');
  const [activeConfig, setActiveConfig] = useState(customizationConfig);

  // Service permission toggles (Allow Customization)
  const [serviceToggles, setServiceToggles] = useState({
    flight: true,
    hotel: true,
    cab: true,
    sightseeing: true
  });

  // Modal states
  const [flightModalOpen, setFlightModalOpen] = useState(false);
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [cabModalOpen, setCabModalOpen] = useState(false);
  const [sightseeingModalOpen, setSightseeingModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [editingRuleService, setEditingRuleService] = useState('Flight');

  const currentPkg = packages.find(p => p.id === selectedPackageId) || packages[0];

  // Calculate dynamic custom price
  const basePrice = currentPkg ? currentPkg.price : 24999;
  const flightDiff = serviceToggles.flight ? (activeConfig.flight?.selectedOption?.priceDiff || 0) : 0;
  const hotelDiff = serviceToggles.hotel ? (activeConfig.hotel?.selectedOption?.priceDiff || 0) : 0;
  const cabDiff = serviceToggles.cab ? (activeConfig.cab?.selectedOption?.priceDiff || 0) : 0;
  const optionalSightseeingTotal = serviceToggles.sightseeing
    ? (activeConfig.sightseeing?.optionalActivities || [])
        .filter(a => a.selected)
        .reduce((sum, a) => sum + (a.price || 0), 0)
    : 0;

  const customTotal = basePrice + flightDiff + hotelDiff + cabDiff + optionalSightseeingTotal;

  // Option selection handler
  const handleSelectOption = (category, option) => {
    setActiveConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        selectedOption: option
      }
    }));
    onShowToast(`Selected ${category} option updated!`);
  };

  // Toggle optional sightseeing activity
  const handleToggleSightseeing = (actId) => {
    setActiveConfig(prev => {
      const updatedActs = (prev.sightseeing.optionalActivities || []).map(act => {
        if (act.id === actId) {
          return { ...act, selected: !act.selected };
        }
        return act;
      });
      return {
        ...prev,
        sightseeing: {
          ...prev.sightseeing,
          optionalActivities: updatedActs
        }
      };
    });
    onShowToast('Sightseeing selection updated!');
  };

  // Save rules handler
  const handleSaveRules = (newRules) => {
    setActiveConfig(prev => {
      const key = editingRuleService.toLowerCase();
      return {
        ...prev,
        rules: {
          ...prev.rules,
          [key]: {
            ...prev.rules[key],
            ...newRules
          }
        }
      };
    });
    onShowToast(`${editingRuleService} customization rules updated!`);
  };

  const handleToggleService = (svcKey) => {
    setServiceToggles(prev => {
      const next = !prev[svcKey];
      onShowToast(`${svcKey.toUpperCase()} customization is now ${next ? 'enabled' : 'locked/fixed'}.`);
      return { ...prev, [svcKey]: next };
    });
  };

  return (
    <div id="package-customization-page" className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Package Customization Engine"
        subtitle="Manage flexible component substitutions, hotel tier upgrades, airlines, and custom add-on pricing."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Packages', path: '/admin/packages' },
          { label: 'Package Customization' }
        ]}
        onNavigate={onNavigate}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onShowToast('Customization changes saved to system!')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 cursor-pointer shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        }
      />

      {/* Package Selector Bar */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Selected Package:
          </label>
          <select
            value={selectedPackageId}
            onChange={(e) => setSelectedPackageId(e.target.value)}
            className="h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer w-full sm:min-w-[320px]"
          >
            {packages.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.duration})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Customization Engine Status:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Live & Operational
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout: Left (Settings + Rules), Right (Package Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Summary + Service Cards + Rules Table */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Section 23: Top Package Summary Card */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <img
                src={currentPkg?.image || 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=600&auto=format&fit=crop&q=80'}
                alt={currentPkg?.name}
                className="w-full sm:w-36 h-36 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0"
              />

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {currentPkg?.name || 'Grand Golden Triangle Heritage'}
                  </h3>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Base Price</span>
                    <span className="text-lg font-black text-[#F97316]">
                      ₹{basePrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    {currentPkg?.duration || '5N / 6D'}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {currentPkg?.route || currentPkg?.destination || 'Delhi → Agra → Jaipur'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {currentPkg?.description || 'Complete guided tour across historical monuments, heritage palaces, luxury hotels, and private transfers.'}
                </p>

                {/* Package Services Status Badges (Section 23) */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Components:</span>
                  {[
                    { key: 'flight', label: 'Flight', icon: Plane },
                    { key: 'hotel', label: 'Hotel', icon: Hotel },
                    { key: 'cab', label: 'Cab', icon: Car },
                    { key: 'sightseeing', label: 'Sightseeing', icon: Compass }
                  ].map(item => {
                    const isCustom = serviceToggles[item.key];
                    const Icon = item.icon;
                    return (
                      <span
                        key={item.key}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          isCustom
                            ? 'bg-orange-50/80 border-orange-200 text-orange-700'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{item.label}:</span>
                        <strong className={isCustom ? 'text-[#F97316]' : 'text-slate-700'}>
                          {isCustom ? 'Customizable' : 'Fixed'}
                        </strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 24: 4 Service Customization Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Flight Settings */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Plane className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Flight Settings</h4>
                      <p className="text-[11px] text-slate-400">Airline & Class Upgrades</p>
                    </div>
                  </div>

                  {/* Allow Customization Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleService('flight')}
                    className="cursor-pointer focus:outline-none"
                    title="Toggle Customization"
                  >
                    {serviceToggles.flight ? (
                      <ToggleRight className="w-8 h-8 text-[#F97316]" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-300" />
                    )}
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Allow Customization:</span>
                    <span className={`font-bold ${serviceToggles.flight ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {serviceToggles.flight ? 'Enabled' : 'Disabled (Fixed)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Flight:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                      {activeConfig.flight?.selectedOption?.airline} ({activeConfig.flight?.selectedOption?.flightNo})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Upgrade Surcharge:</span>
                    <span className="font-bold text-orange-600">
                      +₹{activeConfig.flight?.selectedOption?.priceDiff || 0}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Rules: Upgrades allowed • Max Diff: ₹15,000
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFlightModalOpen(true)}
                  className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold cursor-pointer transition-colors text-center"
                >
                  Choose Flight →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRuleService('Flight');
                    setRulesModalOpen(true);
                  }}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  title="Edit Rules"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 2: Hotel Settings */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Hotel className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Hotel Settings</h4>
                      <p className="text-[11px] text-slate-400">Room & Property Tier</p>
                    </div>
                  </div>

                  {/* Allow Customization Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleService('hotel')}
                    className="cursor-pointer focus:outline-none"
                    title="Toggle Customization"
                  >
                    {serviceToggles.hotel ? (
                      <ToggleRight className="w-8 h-8 text-[#F97316]" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-300" />
                    )}
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Allow Customization:</span>
                    <span className={`font-bold ${serviceToggles.hotel ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {serviceToggles.hotel ? 'Enabled' : 'Disabled (Fixed)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Hotel:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                      {activeConfig.hotel?.selectedOption?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Upgrade Surcharge:</span>
                    <span className="font-bold text-orange-600">
                      +₹{activeConfig.hotel?.selectedOption?.priceDiff || 0}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Rules: Upgrades allowed • Free Breakfast Included
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setHotelModalOpen(true)}
                  className="flex-1 py-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold cursor-pointer transition-colors text-center"
                >
                  Choose Hotel →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRuleService('Hotel');
                    setRulesModalOpen(true);
                  }}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  title="Edit Rules"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 3: Cab Settings */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Cab / Transfer Settings</h4>
                      <p className="text-[11px] text-slate-400">Sedan, SUV & Tempo</p>
                    </div>
                  </div>

                  {/* Allow Customization Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleService('cab')}
                    className="cursor-pointer focus:outline-none"
                    title="Toggle Customization"
                  >
                    {serviceToggles.cab ? (
                      <ToggleRight className="w-8 h-8 text-[#F97316]" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-300" />
                    )}
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Allow Customization:</span>
                    <span className={`font-bold ${serviceToggles.cab ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {serviceToggles.cab ? 'Enabled' : 'Disabled (Fixed)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Vehicle:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                      {activeConfig.cab?.selectedOption?.vehicle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Upgrade Surcharge:</span>
                    <span className="font-bold text-orange-600">
                      +₹{activeConfig.cab?.selectedOption?.priceDiff || 0}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Rules: Dedicated AC Vehicle • Tolls included
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCabModalOpen(true)}
                  className="flex-1 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold cursor-pointer transition-colors text-center"
                >
                  Choose Cab →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRuleService('Cab');
                    setRulesModalOpen(true);
                  }}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  title="Edit Rules"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 4: Sightseeing Settings */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Sightseeing Settings</h4>
                      <p className="text-[11px] text-slate-400">Included Spots & Add-ons</p>
                    </div>
                  </div>

                  {/* Allow Customization Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleService('sightseeing')}
                    className="cursor-pointer focus:outline-none"
                    title="Toggle Customization"
                  >
                    {serviceToggles.sightseeing ? (
                      <ToggleRight className="w-8 h-8 text-[#F97316]" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-300" />
                    )}
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Allow Customization:</span>
                    <span className={`font-bold ${serviceToggles.sightseeing ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {serviceToggles.sightseeing ? 'Enabled' : 'Disabled (Fixed)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Included Tours:</span>
                    <span className="font-semibold text-slate-800">
                      {(activeConfig.sightseeing?.included || []).length} Heritage Spots
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Add-ons:</span>
                    <span className="font-bold text-orange-600">
                      +₹{optionalSightseeingTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Rules: Verified Tourist Guides • Audio equipment
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSightseeingModalOpen(true)}
                  className="flex-1 py-2 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-semibold cursor-pointer transition-colors text-center"
                >
                  Configure Tours →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRuleService('Sightseeing');
                    setRulesModalOpen(true);
                  }}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  title="Edit Rules"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Service Customization Rules Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Customization Policy Matrix</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Control permissions, maximum surcharges, upgrade/downgrade limits
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                Admin Controlled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-3 text-center">Allow Mod</th>
                    <th className="py-3 px-3 text-center">Upgrades</th>
                    <th className="py-3 px-3 text-center">Downgrades</th>
                    <th className="py-3 px-4 text-center">Admin Surcharge</th>
                    <th className="py-3 px-4 text-center">Max Price Cap</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {['Flight', 'Hotel', 'Cab', 'Sightseeing'].map((srv) => {
                    const key = srv.toLowerCase();
                    const rule = activeConfig.rules?.[key] || {
                      allowChange: true,
                      allowUpgrade: true,
                      allowDowngrade: false,
                      additionalCharge: 250,
                      maxPriceDiff: 15000
                    };

                    return (
                      <tr key={srv} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                          {srv === 'Flight' && <Plane className="w-4 h-4 text-blue-600" />}
                          {srv === 'Hotel' && <Hotel className="w-4 h-4 text-amber-600" />}
                          {srv === 'Cab' && <Car className="w-4 h-4 text-emerald-600" />}
                          {srv === 'Sightseeing' && <Compass className="w-4 h-4 text-orange-600" />}
                          {srv}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700">
                            Yes
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700">
                            Allowed
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">
                            No
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-800">
                          ₹{rule.additionalCharge?.toLocaleString('en-IN') || 250}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-800">
                          ₹{rule.maxPriceDiff?.toLocaleString('en-IN') || 15000}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRuleService(srv);
                              setRulesModalOpen(true);
                            }}
                            className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                          >
                            Configure
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Sections 25-29 PACKAGE PREVIEW PANEL */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
          <div
            id="package-preview-panel"
            className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-sm space-y-5"
          >
            {/* Header: Title & Subtitle */}
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">Package Preview</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">What the user will see</p>
            </div>

            {/* Section 25: Service Journey / Stepper (Flight -> Hotel -> Cab -> Sightseeing) */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Service Journey:</span>
                <span className="text-[10px] text-orange-600 font-normal">Click icon to configure</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                {/* Flight Icon */}
                <button
                  type="button"
                  onClick={() => setFlightModalOpen(true)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                  title="Configure Flight"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
                    <Plane className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 group-hover:text-blue-600">
                    Flight
                  </span>
                </button>

                <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                {/* Hotel Icon */}
                <button
                  type="button"
                  onClick={() => setHotelModalOpen(true)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                  title="Configure Hotel"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
                    <Hotel className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 group-hover:text-amber-600">
                    Hotel
                  </span>
                </button>

                <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                {/* Cab Icon */}
                <button
                  type="button"
                  onClick={() => setCabModalOpen(true)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                  title="Configure Cab"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
                    <Car className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 group-hover:text-emerald-600">
                    Cab
                  </span>
                </button>

                <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                {/* Sightseeing Icon */}
                <button
                  type="button"
                  onClick={() => setSightseeingModalOpen(true)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                  title="Configure Sightseeing"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F97316] group-hover:bg-[#F97316] group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 group-hover:text-orange-600">
                    Tour
                  </span>
                </button>
              </div>
            </div>

            {/* Live Customized Selections (What user will see in real-time) */}
            <div className="space-y-2.5 text-xs">
              {/* Flight Item */}
              <div
                onClick={() => setFlightModalOpen(true)}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Plane className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {activeConfig.flight?.selectedOption?.airline} ({activeConfig.flight?.selectedOption?.flightNo})
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {activeConfig.flight?.selectedOption?.time} • {activeConfig.flight?.selectedOption?.class}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-blue-600 text-xs">
                  {flightDiff > 0 ? `+₹${flightDiff.toLocaleString('en-IN')}` : 'Included'}
                </span>
              </div>

              {/* Hotel Item */}
              <div
                onClick={() => setHotelModalOpen(true)}
                className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Hotel className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {activeConfig.hotel?.selectedOption?.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {activeConfig.hotel?.selectedOption?.rating} • {activeConfig.hotel?.selectedOption?.room}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-amber-600 text-xs">
                  {hotelDiff > 0 ? `+₹${hotelDiff.toLocaleString('en-IN')}` : 'Included'}
                </span>
              </div>

              {/* Cab Item */}
              <div
                onClick={() => setCabModalOpen(true)}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Car className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {activeConfig.cab?.selectedOption?.vehicle}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {activeConfig.cab?.selectedOption?.type} • Private AC Cab
                    </p>
                  </div>
                </div>
                <span className="font-bold text-emerald-600 text-xs">
                  {cabDiff > 0 ? `+₹${cabDiff.toLocaleString('en-IN')}` : 'Included'}
                </span>
              </div>

              {/* Sightseeing Item */}
              <div
                onClick={() => setSightseeingModalOpen(true)}
                className="p-3 rounded-xl border border-slate-200 hover:border-orange-400 bg-white hover:bg-orange-50/30 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {(activeConfig.sightseeing?.included || []).length} Included + {(activeConfig.sightseeing?.optionalActivities || []).filter(a => a.selected).length} Add-ons
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Monuments, Safari, Forts & Guides
                    </p>
                  </div>
                </div>
                <span className="font-bold text-orange-600 text-xs">
                  {optionalSightseeingTotal > 0 ? `+₹${optionalSightseeingTotal.toLocaleString('en-IN')}` : 'Included'}
                </span>
              </div>
            </div>

            {/* Dynamic Price Calculation Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Standard Package Price:</span>
                <span className="font-semibold text-slate-800">₹{basePrice.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Custom Flight Upgrade:</span>
                <span className="font-semibold text-slate-800">
                  {flightDiff > 0 ? `+₹${flightDiff.toLocaleString('en-IN')}` : '₹0'}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Hotel Room Upgrade:</span>
                <span className="font-semibold text-slate-800">
                  {hotelDiff > 0 ? `+₹${hotelDiff.toLocaleString('en-IN')}` : '₹0'}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Vehicle Upgrade:</span>
                <span className="font-semibold text-slate-800">
                  {cabDiff > 0 ? `+₹${cabDiff.toLocaleString('en-IN')}` : '₹0'}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Sightseeing Add-ons:</span>
                <span className="font-semibold text-slate-800">
                  {optionalSightseeingTotal > 0 ? `+₹${optionalSightseeingTotal.toLocaleString('en-IN')}` : '₹0'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between text-slate-900 font-bold">
                <span className="text-xs uppercase font-extrabold">Total Live Quote:</span>
                <span className="text-xl font-black text-[#F97316]">
                  ₹{customTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => onShowToast(`Interactive Quote of ₹${customTotal.toLocaleString('en-IN')} is ready!`)}
              className="w-full py-3 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Apply Customized Quote</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FlightCustomizationModal
        isOpen={flightModalOpen}
        onClose={() => setFlightModalOpen(false)}
        config={activeConfig}
        onSelectOption={handleSelectOption}
      />

      <HotelCustomizationModal
        isOpen={hotelModalOpen}
        onClose={() => setHotelModalOpen(false)}
        config={activeConfig}
        onSelectOption={handleSelectOption}
      />

      <CabCustomizationModal
        isOpen={cabModalOpen}
        onClose={() => setCabModalOpen(false)}
        config={activeConfig}
        onSelectOption={handleSelectOption}
      />

      <SightseeingCustomizationModal
        isOpen={sightseeingModalOpen}
        onClose={() => setSightseeingModalOpen(false)}
        config={activeConfig}
        onToggleActivity={handleToggleSightseeing}
      />

      <CustomizationRulesModal
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
        serviceName={editingRuleService}
        initialRules={activeConfig.rules?.[editingRuleService.toLowerCase()] || {}}
        onSaveRules={handleSaveRules}
      />
    </div>
  );
}
