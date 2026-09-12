import React, { useState } from 'react';
import { BarChart3, Download, TrendingUp, Calendar, MapPin, Package, ArrowUpRight } from 'lucide-react';
import PageHeader from '../components/admin/PageHeader.jsx';
import StatCard from '../components/admin/StatCard.jsx';

export default function ReportsView({ onShowToast, onNavigate }) {
  const [selectedPeriod, setSelectedPeriod] = useState('This Year (2025)');

  const monthlyTrends = [
    { month: 'Jan', revenue: 42, bookings: 180, height: '45%' },
    { month: 'Feb', revenue: 48, bookings: 210, height: '52%' },
    { month: 'Mar', revenue: 55, bookings: 240, height: '60%' },
    { month: 'Apr', revenue: 64, bookings: 280, height: '70%' },
    { month: 'May', revenue: 78, bookings: 350, height: '85%' },
    { month: 'Jun', revenue: 88, bookings: 410, height: '95%' },
    { month: 'Jul', revenue: 72, bookings: 330, height: '78%' },
    { month: 'Aug', revenue: 68, bookings: 305, height: '74%' },
    { month: 'Sep', revenue: 82, bookings: 380, height: '90%' }
  ];

  const topDestinations = [
    { name: 'Andaman & Nicobar Islands', bookings: 245, revenue: '₹61.2 Lakhs', share: '32%' },
    { name: 'Kashmir Paradise (Gulmarg & Pahalgam)', bookings: 198, revenue: '₹49.5 Lakhs', share: '26%' },
    { name: 'Kerala Backwaters & Munnar', bookings: 162, revenue: '₹35.6 Lakhs', share: '19%' },
    { name: 'Ladakh High Passes', bookings: 114, revenue: '₹34.2 Lakhs', share: '15%' },
    { name: 'Golden Triangle (Delhi, Agra, Jaipur)', bookings: 88, revenue: '₹18.4 Lakhs', share: '8%' }
  ];

  const handleExport = () => {
    onShowToast('Analytics report exported as CSV successfully!');
  };

  return (
    <div id="reports-page" className="space-y-6">
      <PageHeader
        title="Business Analytics & Financial Reports"
        subtitle="In-depth breakdown of seasonal travel demand, revenue distribution, and package performance."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Users & Payments' },
          { label: 'Reports' }
        ]}
        onNavigate={onNavigate}
        actions={
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 cursor-pointer shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Annual Report (CSV)</span>
          </button>
        }
      />

      {/* Top High-level stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="rep-stat-revenue"
          title="YTD Total Bookings Revenue"
          value="₹ 5.97 Cr"
          change="28%"
          isPositive={true}
          comparisonText="vs previous year"
          icon={TrendingUp}
          colorScheme="blue"
        />
        <StatCard
          id="rep-stat-volume"
          title="Total Confirmed Travelers"
          value="2,685"
          change="34%"
          isPositive={true}
          comparisonText="vs previous year"
          icon={Package}
          colorScheme="green"
        />
        <StatCard
          id="rep-stat-aov"
          title="Average Booking Value (ABV)"
          value="₹ 22,250"
          change="12%"
          isPositive={true}
          comparisonText="vs previous year"
          icon={BarChart3}
          colorScheme="orange"
        />
        <StatCard
          id="rep-stat-retention"
          title="Repeat Traveler Rate"
          value="31.8%"
          change="6%"
          isPositive={true}
          comparisonText="vs previous year"
          icon={ArrowUpRight}
          colorScheme="amber"
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Monthly Revenue Growth (in Lakhs INR)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Seasonal surge observed in peak vacation periods</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
            <span className="text-xs text-slate-600 font-semibold">2025 Revenue</span>
          </div>
        </div>

        {/* Bar chart visualization */}
        <div className="h-64 flex items-end justify-between gap-3 px-2 pt-6">
          {monthlyTrends.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="relative w-full max-w-[48px] flex items-end justify-center">
                <div
                  style={{ height: d.height }}
                  className="w-full rounded-t-xl bg-orange-500 group-hover:bg-orange-600 transition-all duration-200 shadow-xs relative"
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-2 rounded whitespace-nowrap pointer-events-none transition-opacity">
                    ₹{d.revenue} Lakhs
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">
                {d.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Destinations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Top Performing Bharat Destinations</h3>
          <p className="text-xs text-slate-500 mt-0.5">Ranked by revenue generation and popularity</p>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
              <th className="py-3.5 px-4">Destination</th>
              <th className="py-3.5 px-4 text-center">Bookings</th>
              <th className="py-3.5 px-4">Gross Revenue</th>
              <th className="py-3.5 px-4">Market Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {topDestinations.map((dest, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                  {dest.name}
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-slate-800">{dest.bookings}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">{dest.revenue}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: dest.share }} />
                    </div>
                    <span className="font-semibold text-slate-700">{dest.share}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
