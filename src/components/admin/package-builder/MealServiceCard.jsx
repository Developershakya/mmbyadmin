import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Trash2,
  CheckCircle2,
  Coffee
} from 'lucide-react';
import { mockMeals } from '../../../lib/mock/mockMeals.js';

export default function MealServiceCard({
  mealData = {},
  onChange
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeal, setNewMeal] = useState({
    mealType: 'Breakfast',
    name: '',
    provider: 'Hotel Dining',
    description: '',
    price: 500,
    isIncluded: true,
    customizable: true
  });

  const items = mealData.items || [];

  const handleAddItem = (item) => {
    onChange({
      ...mealData,
      items: [...items, { ...item, id: `MEL-${Date.now()}` }]
    });
    setShowAddForm(false);
  };

  const handleRemoveItem = (index) => {
    onChange({
      ...mealData,
      items: items.filter((_, i) => i !== index)
    });
  };

  const handleToggleIncluded = (index) => {
    const updated = [...items];
    updated[index].isIncluded = !updated[index].isIncluded;
    onChange({
      ...mealData,
      items: updated
    });
  };

  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 md:p-5 border border-orange-200/80 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center font-bold">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">Curated Meals & Culinary Plans</span>
            <span className="text-[11px] text-slate-500">
              Buffet breakfast, authentic regional lunches, and candlelight dinners ({items.length} configured)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Meal</span>
        </button>
      </div>

      {/* Quick Picks */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
        <span className="text-[11px] font-bold text-slate-600 block">Quick Culinary Plans:</span>
        <div className="flex flex-wrap gap-2">
          {mockMeals.map((mel) => (
            <button
              key={mel.id}
              type="button"
              onClick={() => handleAddItem(mel)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-orange-400 hover:bg-orange-50/40 text-xs font-medium text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="font-bold text-[#F97316]">[{mel.mealType}]</span>
              <span>{mel.name}</span>
              <span className="font-semibold text-slate-500">(₹{mel.price})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Form */}
      {showAddForm && (
        <div className="bg-white p-4 rounded-xl border border-orange-300 shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900">Configure Meal for this Day</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-[11px] text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Meal Type</label>
              <select
                value={newMeal.mealType}
                onChange={(e) => setNewMeal({ ...newMeal, mealType: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Breakfast + Dinner">Breakfast + Dinner</option>
                <option value="All Meals">All Meals</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Meal / Plan Name</label>
              <input
                type="text"
                value={newMeal.name}
                onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                placeholder="e.g. Himachali Dham Special Lunch"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Estimated Cost (₹)</label>
              <input
                type="number"
                value={newMeal.price}
                onChange={(e) => setNewMeal({ ...newMeal, price: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Menu Items & Description</label>
              <input
                type="text"
                value={newMeal.description}
                onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                placeholder="Multi-course spread, beverages included, restaurant provider..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => handleAddItem(newMeal)}
              className="px-4 py-2 bg-[#F97316] text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
            >
              Add this Meal
            </button>
          </div>
        </div>
      )}

      {/* Added Meals */}
      {items.length === 0 ? (
        <div className="p-4 bg-white rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
          No separate meals configured for this day.
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
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-orange-100 text-orange-800">
                    {item.mealType}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.description || item.provider}</p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="font-extrabold text-slate-900 text-xs">
                  ₹{item.price?.toLocaleString('en-IN')}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleIncluded(index)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                    item.isIncluded ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.isIncluded ? 'Included' : 'Paid Addon'}
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove Meal"
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
