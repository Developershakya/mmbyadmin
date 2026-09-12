import React from 'react';
import { Minus, Plus } from 'lucide-react';

export default function StepperControl({
  label,
  value = 0,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  suffix = '',
  prefix = '',
  subLabel = '',
  size = 'md',
  className = '',
  id
}) {
  const numVal = Number(value) || 0;

  const handleDecrement = (e) => {
    e.preventDefault();
    if (numVal - step >= min) {
      onChange(numVal - step);
    }
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    if (numVal + step <= max) {
      onChange(numVal + step);
    }
  };

  const isMin = numVal <= min;
  const isMax = numVal >= max;

  return (
    <div id={id} className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
          {subLabel && (
            <span className="text-[11px] text-slate-400">{subLabel}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-2xs hover:border-slate-300 transition">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={isMin}
          aria-label={`Decrease ${label || 'value'}`}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer font-bold ${
            isMin
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
              : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-slate-200 shadow-xs active:scale-95'
          }`}
        >
          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Central Counter Display */}
        <div className="px-3 py-1 flex items-center justify-center text-center font-bold text-sm text-[#0F172A] tracking-tight">
          {prefix && <span className="mr-0.5 text-slate-500 font-semibold">{prefix}</span>}
          <span>{numVal.toLocaleString('en-IN')}</span>
          {suffix && <span className="ml-1 text-xs font-medium text-slate-500">{suffix}</span>}
        </div>

        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={isMax}
          aria-label={`Increase ${label || 'value'}`}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer font-bold ${
            isMax
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
              : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-slate-200 shadow-xs active:scale-95'
          }`}
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
