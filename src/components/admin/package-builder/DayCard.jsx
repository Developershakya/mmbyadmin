import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plane,
  Hotel,
  Car,
  Bus,
  Camera,
  Compass,
  Utensils,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  MapPin,
  Image as ImageIcon,
  Sparkles,
  Layers
} from 'lucide-react';
import FlightServiceCard from './FlightServiceCard.jsx';
import HotelServiceCard from './HotelServiceCard.jsx';
import CabServiceCard from './CabServiceCard.jsx';
import BusServiceCard from './BusServiceCard.jsx';
import SightseeingServiceCard from './SightseeingServiceCard.jsx';
import ActivityServiceCard from './ActivityServiceCard.jsx';
import MealServiceCard from './MealServiceCard.jsx';

export default function DayCard({
  day,
  dayIndex,
  totalDays,
  packageHotelRules = {},
  packageDestination = 'Manali',
  onChange,
  onDuplicate,
  onDelete,
  onMove
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update day core fields
  const updateDayField = (field, value) => {
    onChange({
      ...day,
      [field]: value
    });
  };

  // Update a specific service
  const updateDayService = (serviceKey, serviceData) => {
    onChange({
      ...day,
      services: {
        ...(day.services || {}),
        [serviceKey]: serviceData
      }
    });
  };

  // Toggle service ON/OFF
  const toggleService = (serviceKey) => {
    const currentService = day.services?.[serviceKey] || { enabled: false };
    const nextEnabled = !currentService.enabled;

    onChange({
      ...day,
      services: {
        ...(day.services || {}),
        [serviceKey]: {
          ...currentService,
          enabled: nextEnabled
        }
      }
    });
  };

  const services = day.services || {};

  // Summary counts
  const enabledCount = [
    services.flight?.enabled,
    services.hotel?.enabled,
    services.cab?.enabled,
    services.bus?.enabled,
    services.sightseeing?.enabled,
    services.activity?.enabled,
    services.meal?.enabled
  ].filter(Boolean).length;

  const sightseeingCount = services.sightseeing?.enabled ? (services.sightseeing?.items?.length || 0) : 0;
  const activityCount = services.activity?.enabled ? (services.activity?.items?.length || 0) : 0;
  const mealCount = services.meal?.enabled ? (services.meal?.items?.length || 0) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
      {/* 1. Collapsible Day Header */}
      <div
        className={`p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
          isExpanded ? 'bg-slate-50/80 border-b border-slate-200' : 'hover:bg-slate-50'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F97316] font-black text-sm flex items-center justify-center shrink-0 border border-orange-200">
            D{day.dayNumber || dayIndex + 1}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {day.title || `Day ${day.dayNumber || dayIndex + 1} Itinerary`}
              </h3>
              {day.location && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-medium">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{day.location}</span>
                </span>
              )}
            </div>

            {/* Quick Summary Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">
                {enabledCount} {enabledCount === 1 ? 'Service' : 'Services'}
              </span>
              {sightseeingCount > 0 && (
                <span>• {sightseeingCount} Sightseeing</span>
              )}
              {activityCount > 0 && (
                <span>• {activityCount} {activityCount === 1 ? 'Activity' : 'Activities'}</span>
              )}
              {mealCount > 0 && (
                <span>• {mealCount} {mealCount === 1 ? 'Meal' : 'Meals'}</span>
              )}

              {/* Service Icons Pills */}
              <div className="flex items-center gap-1 ml-2">
                {services.flight?.enabled && <Plane className="w-3.5 h-3.5 text-blue-600" title="Flight Active" />}
                {services.hotel?.enabled && <Hotel className="w-3.5 h-3.5 text-emerald-600" title="Hotel Active" />}
                {services.cab?.enabled && <Car className="w-3.5 h-3.5 text-purple-600" title="Cab Active" />}
                {services.bus?.enabled && <Bus className="w-3.5 h-3.5 text-amber-600" title="Bus Active" />}
                {services.sightseeing?.enabled && <Camera className="w-3.5 h-3.5 text-rose-600" title="Sightseeing Active" />}
                {services.activity?.enabled && <Compass className="w-3.5 h-3.5 text-indigo-600" title="Activity Active" />}
                {services.meal?.enabled && <Utensils className="w-3.5 h-3.5 text-orange-600" title="Meal Active" />}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            disabled={dayIndex === 0}
            onClick={() => onMove(dayIndex, -1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move Day Up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={dayIndex === totalDays - 1}
            onClick={() => onMove(dayIndex, 1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move Day Down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(dayIndex)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Duplicate Day"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Day"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors ml-1"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Banner */}
      {showDeleteConfirm && (
        <div className="p-3 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs text-rose-900 animate-fadeIn">
          <span className="font-semibold">Are you sure you want to delete Day {day.dayNumber || dayIndex + 1}? All configured services will be removed.</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-2.5 py-1 rounded-md text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete(dayIndex);
              }}
              className="px-2.5 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 font-bold"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}

      {/* 2. Expanded Day Configuration */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Core Day Settings Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Day Number</label>
              <input
                type="number"
                min={1}
                value={day.dayNumber || dayIndex + 1}
                onChange={(e) => updateDayField('dayNumber', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Day Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={day.title || ''}
                onChange={(e) => updateDayField('title', e.target.value)}
                placeholder="e.g. Day 1 — Delhi to Manali & Leisure Evening"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Day Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={day.location || ''}
                onChange={(e) => updateDayField('location', e.target.value)}
                placeholder="e.g. Manali"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Day Itinerary Description
              </label>
              <textarea
                rows={2}
                value={day.description || ''}
                onChange={(e) => updateDayField('description', e.target.value)}
                placeholder="Describe the day's travel schedule, scenic highlights, and tips..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Day Cover Photo URL
              </label>
              <input
                type="url"
                value={day.image || ''}
                onChange={(e) => updateDayField('image', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
              />
            </div>
          </div>

          {/* 3. Service Toggle Bar for this Day */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#F97316]" />
                <span className="text-xs font-bold text-slate-900">
                  Services for Day {day.dayNumber || dayIndex + 1}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Click toggles to enable or disable service configurations</span>
            </div>

            {/* Toggle Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'flight', label: 'Flight', icon: Plane, color: 'hover:border-blue-500 text-blue-600', activeBg: 'bg-blue-600 text-white' },
                { key: 'hotel', label: 'Hotel', icon: Hotel, color: 'hover:border-emerald-500 text-emerald-600', activeBg: 'bg-emerald-600 text-white' },
                { key: 'cab', label: 'Cab', icon: Car, color: 'hover:border-purple-500 text-purple-600', activeBg: 'bg-purple-600 text-white' },
                { key: 'bus', label: 'Bus', icon: Bus, color: 'hover:border-amber-500 text-amber-600', activeBg: 'bg-amber-600 text-white' },
                { key: 'sightseeing', label: 'Sightseeing', icon: Camera, color: 'hover:border-rose-500 text-rose-600', activeBg: 'bg-rose-600 text-white' },
                { key: 'activity', label: 'Activity', icon: Compass, color: 'hover:border-indigo-500 text-indigo-600', activeBg: 'bg-indigo-600 text-white' },
                { key: 'meal', label: 'Meal', icon: Utensils, color: 'hover:border-orange-500 text-orange-600', activeBg: 'bg-orange-600 text-white' }
              ].map(t => {
                const Icon = t.icon;
                const isEnabled = !!services[t.key]?.enabled;

                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => toggleService(t.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer shadow-2xs ${
                      isEnabled
                        ? `${t.activeBg} border-transparent shadow-xs`
                        : `bg-slate-50 border-slate-200 text-slate-600 ${t.color}`
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}: {isEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Active Service Cards for this Day */}
          <div className="space-y-5">
            {services.flight?.enabled && (
              <FlightServiceCard
                flightData={services.flight}
                onChange={(data) => updateDayService('flight', data)}
                defaultDate="2026-09-15"
              />
            )}

            {services.hotel?.enabled && (
              <HotelServiceCard
                hotelData={services.hotel}
                packageHotelRules={packageHotelRules}
                defaultCity={day.location || packageDestination || 'Manali'}
                onChange={(data) => updateDayService('hotel', data)}
              />
            )}

            {services.cab?.enabled && (
              <CabServiceCard
                cabData={services.cab}
                onChange={(data) => updateDayService('cab', data)}
                defaultDate="2026-09-15"
              />
            )}

            {services.bus?.enabled && (
              <BusServiceCard
                busData={services.bus}
                onChange={(data) => updateDayService('bus', data)}
                defaultDate="2026-09-15"
              />
            )}

            {services.sightseeing?.enabled && (
              <SightseeingServiceCard
                sightseeingData={services.sightseeing}
                defaultCity={day.location || packageDestination || 'Manali'}
                onChange={(data) => updateDayService('sightseeing', data)}
              />
            )}

            {services.activity?.enabled && (
              <ActivityServiceCard
                activityData={services.activity}
                defaultCity={day.location || packageDestination || 'Manali'}
                onChange={(data) => updateDayService('activity', data)}
              />
            )}

            {services.meal?.enabled && (
              <MealServiceCard
                mealData={services.meal}
                onChange={(data) => updateDayService('meal', data)}
              />
            )}

            {enabledCount === 0 && (
              <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                <span className="text-xs font-bold text-slate-600 block">No services active for Day {day.dayNumber || dayIndex + 1}</span>
                <p className="text-xs text-slate-400">
                  Click any service button above (Flight, Hotel, Cab, Sightseeing, Activity, Meal) to turn it ON and configure it.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
