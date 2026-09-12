import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Package,
  Award,
  ShieldCheck,
  CheckCircle,
  Clock
} from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

export default function CustomerDrawer({
  customer,
  isOpen,
  onClose,
  onToggleStatus,
  onViewBooking
}) {
  const [activeTab, setActiveTab] = useState('bookings');

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Customer Profile</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Customer Avatar & Bio */}
          <div className="mt-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-orange-500/20">
              {customer.avatar || customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-900">{customer.name}</h4>
                <StatusBadge status={customer.status} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{customer.email}</p>
              <p className="text-xs text-slate-500">{customer.phone} • {customer.city}</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 mt-6">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Bookings</span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">{customer.bookingsCount || 3}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Spent</span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">
                ₹{(customer.totalSpent || 65000).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tier</span>
              <p className="text-xs font-bold text-amber-600 mt-1 flex items-center justify-center gap-0.5">
                <Award className="w-3.5 h-3.5" />
                Gold
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 mt-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`pb-2 px-1 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'bookings'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Booking History
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`pb-2 px-1 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'details'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Traveler Preferences
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'bookings' ? (
            <div className="mt-4 space-y-3">
              {(customer.bookingsHistory || [
                { id: 'PKG-0045', name: 'Andaman & Nicobar Islands', date: '12 Sep 2025', amount: 25900, status: 'Confirmed' },
                { id: 'BUS-1029', name: 'Delhi → Jaipur Volvo Sleeper', date: '28 Aug 2025', amount: 1250, status: 'Completed' },
                { id: 'PKG-0012', name: 'Golden Triangle Heritage', date: '15 Jun 2025', amount: 18500, status: 'Completed' }
              ]).map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{b.id}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1">{b.name}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>{b.date}</span>
                    <span className="font-bold text-slate-800">₹{b.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Meal Preference</span>
                <p className="font-semibold text-slate-900 mt-0.5">Vegetarian (Jain Available)</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Seat Preference</span>
                <p className="font-semibold text-slate-900 mt-0.5">Aisle / Front Rows</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Registration Date</span>
                <p className="font-semibold text-slate-900 mt-0.5">{customer.registeredDate || '14 Jan 2024'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleStatus(customer.id)}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            {customer.status === 'Active' ? 'Deactivate User' : 'Activate User'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
