'use client';

import React, { useState } from 'react';
import {
  Settings,
  Save,
  Building2,
  Mail,
  Phone,
  Globe,
  KeyRound,
  BellRing,
  ShieldAlert,
  Percent,
  CheckCircle2
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader.jsx';

export default function SettingsContent({ onShowToast, onNavigate }) {
  const [formData, setFormData] = useState({
    companyName: 'TravelPro Holidays Pvt Ltd',
    supportEmail: 'support@travelpro.in',
    supportPhone: '+91 1800 200 4545',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (GMT+5:30)',
    autoConfirmFlights: true,
    autoConfirmHotels: true,
    agentMarkupPercent: 8.5,
    b2cMarkupPercent: 12.0,
    emailNotifications: true,
    smsAlerts: true,
    whatsappUpdates: true,
    srdvApiKeyConfigured: true,
    razorpayWebhookConfigured: true
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e?.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (onShowToast) {
        onShowToast('Platform settings and markup configuration updated successfully!');
      }
    }, 600);
  };

  return (
    <div id="settings-page" className="space-y-6 max-w-5xl">
      <PageHeader
        title="System Preferences & Platform Settings"
        subtitle="Manage agency profiles, markup commissions, notification channels, and global booking policies."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'System' },
          { label: 'Settings' }
        ]}
        onNavigate={onNavigate}
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 disabled:opacity-50 cursor-pointer shadow-xs transition-colors"
          >
            {saving ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Identity */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-slate-900">Agency & Portal Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Legal Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Support Email</label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Toll-Free Support Phone</label>
              <input
                type="text"
                value={formData.supportPhone}
                onChange={(e) => handleChange('supportPhone', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Display Currency & Symbol</label>
              <input
                type="text"
                value={formData.currency}
                disabled
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Markups */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Percent className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900">Commission & Markup Engine</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">B2C Retail Package Markup (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.b2cMarkupPercent}
                onChange={(e) => handleChange('b2cMarkupPercent', parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Applied over wholesale supplier net rate on all direct guest bookings.</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">B2B Travel Agent Markup (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.agentMarkupPercent}
                onChange={(e) => handleChange('agentMarkupPercent', parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Special partner wholesale commission distributed to sub-agents.</p>
            </div>
          </div>
        </div>

        {/* Notifications & Automation */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <BellRing className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900">Communication & Alert Channels</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800">Email Booking Confirmations & Invoices</span>
                <p className="text-[11px] text-slate-400">Instantly email PDF vouchers to guests upon checkout completion.</p>
              </div>
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="w-4 h-4 accent-orange-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800">WhatsApp Travel Itinerary Sharing</span>
                <p className="text-[11px] text-slate-400">Send direct WhatsApp itinerary links with real-time cab driver assignment.</p>
              </div>
              <input
                type="checkbox"
                checked={formData.whatsappUpdates}
                onChange={(e) => handleChange('whatsappUpdates', e.target.checked)}
                className="w-4 h-4 accent-orange-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800">SMS Flight Status & Gate Alert Updates</span>
                <p className="text-[11px] text-slate-400">Notify guests 4 hours prior to departure regarding terminal changes.</p>
              </div>
              <input
                type="checkbox"
                checked={formData.smsAlerts}
                onChange={(e) => handleChange('smsAlerts', e.target.checked)}
                className="w-4 h-4 accent-orange-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* Integration Statuses */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <KeyRound className="w-4 h-4 text-violet-500" />
            <h3 className="text-sm font-bold text-slate-900">API Gateway & Supplier Connectors</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold text-slate-800">SRDV Live Travel API</div>
                  <div className="text-[11px] text-slate-500">Flights, Hotels, Cabs, Buses active</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">ONLINE</span>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold text-slate-800">Razorpay Payment Gateway</div>
                  <div className="text-[11px] text-slate-500">Auto-capture & webhooks operational</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">ONLINE</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
