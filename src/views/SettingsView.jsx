import React, { useState } from 'react';
import { Settings, Save, Building, CreditCard, Shield, Bell, Mail, Phone, MapPin, Check } from 'lucide-react';
import PageHeader from '../components/admin/PageHeader.jsx';

export default function SettingsView({ onShowToast, onNavigate }) {
  const [formData, setFormData] = useState({
    siteName: 'Make My Bharat Yatra',
    tagline: 'Discover the Soul of Incredible India',
    supportPhone: '+91 98765 43210',
    supportEmail: 'care@makemybharatyatra.com',
    address: '4th Floor, Barakhamba Road, Connaught Place, New Delhi - 110001',
    currency: 'INR (₹)',
    gstRate: '5%',
    convenienceFee: '150',
    razorpayActive: true,
    upiActive: true,
    autoConfirm: true,
    emailVoucherAuto: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onShowToast('System settings and gateway preferences saved successfully!');
  };

  return (
    <div id="settings-page" className="space-y-6">
      <PageHeader
        title="Portal & System Settings"
        subtitle="Manage business credentials, tax rules, payment gateways, and automated traveler communications."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Other' },
          { label: 'Settings' }
        ]}
        onNavigate={onNavigate}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Profile */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-slate-900">Brand & Company Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Brand Name</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Helpline</label>
              <input
                type="text"
                value={formData.supportPhone}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Support Email</label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Headquarters Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Taxes & Gateway */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-slate-900">Tax Rates & Gateways</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Display Currency</label>
              <input
                type="text"
                disabled
                value={formData.currency}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">GST Tax Rate (%)</label>
              <input
                type="text"
                value={formData.gstRate}
                onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Convenience Fee (₹)</label>
              <input
                type="text"
                value={formData.convenienceFee}
                onChange={(e) => setFormData({ ...formData, convenienceFee: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Options</h4>
            <div className="flex flex-col sm:flex-row gap-4 text-xs">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.razorpayActive}
                  onChange={(e) => setFormData({ ...formData, razorpayActive: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-800">Enable Razorpay (Cards, NetBanking, UPI)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.upiActive}
                  onChange={(e) => setFormData({ ...formData, upiActive: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-800">Enable Instant QR & UPI Intent</span>
              </label>
            </div>
          </div>
        </div>

        {/* Automation switches */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-slate-900">Automation & Notification Rules</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900">Auto-Confirm Paid Bookings</p>
                <p className="text-slate-500 text-[11px]">Instantly move successful payment reservations to Confirmed status</p>
              </div>
              <input
                type="checkbox"
                checked={formData.autoConfirm}
                onChange={(e) => setFormData({ ...formData, autoConfirm: e.target.checked })}
                className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900">Auto-Dispatch Invoices & Vouchers</p>
                <p className="text-slate-500 text-[11px]">Send PDF itinerary and payment receipt to customer email on confirmation</p>
              </div>
              <input
                type="checkbox"
                checked={formData.emailVoucherAuto}
                onChange={(e) => setFormData({ ...formData, emailVoucherAuto: e.target.checked })}
                className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
              />
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-orange-600 cursor-pointer shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
