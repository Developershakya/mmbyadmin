import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  id,
  title,
  value,
  change,
  isPositive = true,
  comparisonText = 'vs last 7 days',
  icon: Icon,
  colorScheme = 'orange' // orange, green, amber, red, blue
}) {
  const schemeStyles = {
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-100'
    },
    green: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100'
    },
    red: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100'
    }
  }[colorScheme] || {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-100'
  };

  return (
    <div
      id={id || `stat-card-${title?.toLowerCase().replace(/\s+/g, '-')}`}
      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs md:text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl ${schemeStyles.bg} ${schemeStyles.text} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs">
        <span
          className={`inline-flex items-center font-semibold ${
            isPositive ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
          )}
          {change}
        </span>
        <span className="text-slate-400 font-normal">{comparisonText}</span>
      </div>
    </div>
  );
}
