import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Trash2,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { mockActivities } from '../../../lib/mock/mockActivities.js';

export default function ActivityServiceCard({
  activityData = {},
  onChange,
  defaultCity = 'Manali'
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: '',
    location: `Solang Valley, ${defaultCity}`,
    category: 'Adventure Sport',
    duration: '1 Hour',
    price: 1500,
    isIncluded: true,
    customizable: false,
    description: ''
  });

  const items = activityData.items || [];

  const handleAddItem = (itemToAdd) => {
    onChange({
      ...activityData,
      items: [...items, { ...itemToAdd, id: `ACT-${Date.now()}` }]
    });
    setShowAddForm(false);
  };

  const handleRemoveItem = (index) => {
    onChange({
      ...activityData,
      items: items.filter((_, i) => i !== index)
    });
  };

  const handleToggleIncluded = (index) => {
    const updated = [...items];
    updated[index].isIncluded = !updated[index].isIncluded;
    onChange({
      ...activityData,
      items: updated
    });
  };

  const handleToggleCustomizable = (index) => {
    const updated = [...items];
    updated[index].customizable = !updated[index].customizable;
    onChange({
      ...activityData,
      items: updated
    });
  };

  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 md:p-5 border border-indigo-200/80 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">Adventure Activities & Excursions</span>
            <span className="text-[11px] text-slate-500">
              High-thrill adventures, snow experiences, and sports ({items.length} added)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Quick Picks from Catalog */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
        <span className="text-[11px] font-bold text-slate-600 block">Quick Catalog Recommendations:</span>
        <div className="flex flex-wrap gap-2">
          {mockActivities.map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => handleAddItem(act)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-xs font-medium text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ {act.name}</span>
              <span className="font-bold text-indigo-600">₹{act.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Activity Form */}
      {showAddForm && (
        <div className="bg-white p-4 rounded-xl border border-indigo-300 shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900">Add Custom Activity to Day</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-[11px] text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Activity Name</label>
              <input
                type="text"
                value={newActivity.name}
                onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                placeholder="e.g. Beas River White Water Rafting"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Location</label>
              <input
                type="text"
                value={newActivity.location}
                onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Duration</label>
              <input
                type="text"
                value={newActivity.duration}
                onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
                placeholder="e.g. 45 Mins"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Price per Person (₹)</label>
              <input
                type="number"
                value={newActivity.price}
                onChange={(e) => setNewActivity({ ...newActivity, price: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
              <input
                type="text"
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                placeholder="Safety equipment, guide, instructions..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => handleAddItem(newActivity)}
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
            >
              Add this Activity
            </button>
          </div>
        </div>
      )}

      {/* Added Activities List */}
      {items.length === 0 ? (
        <div className="p-4 bg-white rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
          No activities configured for this day. Click quick recommendations above or create a new one.
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700">
                    {item.duration}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.location} • {item.description}</p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <span className="font-extrabold text-slate-900 block text-xs">
                    ₹{item.price?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400">per person</span>
                </div>

                {/* Included toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleIncluded(index)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                    item.isIncluded ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.isIncluded ? 'Included in Base' : 'Optional Addon'}
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove Activity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
