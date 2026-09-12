import React, { useState, useMemo } from 'react';
import {
  Package,
  CalendarCheck,
  IndianRupee,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Download,
  Plus,
  ArrowUpRight,
  Eye,
  Plane,
  Bus,
  Hotel,
  Car,
  FileText,
  Filter,
  ChevronDown
} from 'lucide-react';
import StatCard from '../components/admin/StatCard.jsx';
import PageHeader from '../components/admin/PageHeader.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import BookingDrawer from '../components/admin/BookingDrawer.jsx';
import LineTrendChart from '../components/admin/LineTrendChart.jsx';

export default function DashboardView({
  onNavigate,
  bookings = [],
  packageBookings = [],
  busBookings = [],
  flightBookings = [],
  hotelBookings = [],
  cabBookings = [],
  onViewInvoice,
  onViewTicket,
  onCancelBooking,
  onOpenAddPackage,
  onOpenAddBlog
}) {
  // Date Range state for Header
  const [dateRange, setDateRange] = useState('Last 7 Days');
  // Chart timeframe state
  const [chartPeriod, setChartPeriod] = useState('7d');
  const [activeChartService, setActiveChartService] = useState('ALL');
  // Selected Donut Service
  const [selectedService, setSelectedService] = useState('Package');
  // Selected Booking for Drawer Inspection
  const [inspectBooking, setInspectBooking] = useState(null);

  // Harmonize all bookings
  const allBookings = useMemo(() => {
    if (bookings && bookings.length > 0) return bookings;
    return [
      ...packageBookings.map(b => ({ ...b, type: 'package' })),
      ...busBookings.map(b => ({ ...b, type: 'bus' })),
      ...flightBookings.map(b => ({ ...b, type: 'flight' })),
      ...hotelBookings.map(b => ({ ...b, type: 'hotel' })),
      ...cabBookings.map(b => ({ ...b, type: 'cab' }))
    ];
  }, [bookings, packageBookings, busBookings, flightBookings, hotelBookings, cabBookings]);

  // Set default inspection booking
  const activeBooking = inspectBooking || allBookings[0] || null;

  // Overview Chart Trends Mock Data for 7 days
  const overviewTrendData7d = [
    { label: 'Mon', flight: 34, hotel: 22, bus: 28, car: 14, package: 42, total: 140 },
    { label: 'Tue', flight: 40, hotel: 25, bus: 32, car: 18, package: 48, total: 163 },
    { label: 'Wed', flight: 45, hotel: 30, bus: 38, car: 20, package: 56, total: 189 },
    { label: 'Thu', flight: 38, hotel: 28, bus: 30, car: 16, package: 50, total: 162 },
    { label: 'Fri', flight: 58, hotel: 44, bus: 52, car: 28, package: 74, total: 256 },
    { label: 'Sat', flight: 65, hotel: 52, bus: 60, car: 35, package: 88, total: 300 },
    { label: 'Sun', flight: 60, hotel: 48, bus: 55, car: 30, package: 82, total: 275 }
  ];

  const overviewTrendData30d = [
    { label: 'Week 1', flight: 260, hotel: 180, bus: 210, car: 110, package: 350, total: 1110 },
    { label: 'Week 2', flight: 290, hotel: 210, bus: 240, car: 130, package: 410, total: 1280 },
    { label: 'Week 3', flight: 340, hotel: 250, bus: 290, car: 160, package: 480, total: 1520 },
    { label: 'Week 4', flight: 390, hotel: 290, bus: 330, car: 190, package: 560, total: 1760 }
  ];

  const currentTrendData = chartPeriod === '7d' ? overviewTrendData7d : overviewTrendData30d;
  const maxTotal = Math.max(...currentTrendData.map(d => d.total)) * 1.15 || 300;

  // Donut Services Breakdown Data
  const servicesBreakdown = [
    {
      name: 'Package',
      label: 'Holiday Packages',
      count: 642,
      percentage: 43.3,
      revenue: '₹48,20,000',
      color: '#F97316', // orange
      bgLight: 'bg-orange-50',
      borderLight: 'border-orange-200',
      icon: Compass
    },
    {
      name: 'Flight',
      label: 'Flight Tickets',
      count: 384,
      percentage: 25.9,
      revenue: '₹19,45,000',
      color: '#2563EB', // blue
      bgLight: 'bg-blue-50',
      borderLight: 'border-blue-200',
      icon: Plane
    },
    {
      name: 'Hotel',
      label: 'Hotels & Stays',
      count: 210,
      percentage: 14.2,
      revenue: '₹9,80,000',
      color: '#10B981', // green
      bgLight: 'bg-emerald-50',
      borderLight: 'border-emerald-200',
      icon: Hotel
    },
    {
      name: 'Bus',
      label: 'Intercity Bus',
      count: 154,
      percentage: 10.4,
      revenue: '₹4,12,000',
      color: '#D97706', // amber
      bgLight: 'bg-amber-50',
      borderLight: 'border-amber-200',
      icon: Bus
    },
    {
      name: 'Car',
      label: 'Cabs & Transfers',
      count: 92,
      percentage: 6.2,
      revenue: '₹2,68,000',
      color: '#8B5CF6', // purple
      bgLight: 'bg-purple-50',
      borderLight: 'border-purple-200',
      icon: Car
    }
  ];

  const activeServiceObj = servicesBreakdown.find(s => s.name === selectedService) || servicesBreakdown[0];

  // Helper for Recent Bookings list with service filter
  const [recentServiceFilter, setRecentServiceFilter] = useState('ALL');

  const filteredRecentBookings = useMemo(() => {
    if (recentServiceFilter === 'ALL') {
      return allBookings.slice(0, 8);
    }
    return allBookings
      .filter(b => {
        const type = b.type || (b.busDetails ? 'bus' : b.airline ? 'flight' : b.hotel ? 'hotel' : b.vehicle ? 'cab' : 'package');
        return type.toLowerCase() === recentServiceFilter.toLowerCase();
      })
      .slice(0, 8);
  }, [allBookings, recentServiceFilter]);

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* 1. Header (Section 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, Admin! Here's what's happening with Make My Bharat Yatra today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-9.5 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-2xs transition-colors appearance-none"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/admin/reports')}
            className="h-9.5 inline-flex items-center gap-1.5 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddPackage}
            className="h-9.5 inline-flex items-center gap-1.5 px-4 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Package</span>
          </button>
        </div>
      </div>

      {/* 2. KPI CARDS - Exact 4 cards from reference (Section 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Bookings */}
        <StatCard
          id="kpi-total-bookings"
          title="Total Bookings"
          value="1,482"
          change="12.5%"
          isPositive={true}
          comparisonText="vs last period"
          icon={CalendarCheck}
          colorScheme="orange"
        />

        {/* Card 2: Total Revenue */}
        <StatCard
          id="kpi-total-revenue"
          title="Total Revenue"
          value="₹84,25,000"
          change="18.2%"
          isPositive={true}
          comparisonText="vs last period"
          icon={IndianRupee}
          colorScheme="green"
        />

        {/* Card 3: Total Customers */}
        <StatCard
          id="kpi-total-customers"
          title="Total Customers"
          value="3,840"
          change="9.4%"
          isPositive={true}
          comparisonText="vs last period"
          icon={Users}
          colorScheme="blue"
        />

        {/* Card 4: Package Bookings */}
        <StatCard
          id="kpi-package-bookings"
          title="Package Bookings"
          value="642"
          change="15.3%"
          isPositive={true}
          comparisonText="vs last period"
          icon={Compass}
          colorScheme="amber"
        />
      </div>

      {/* 3. Section 6: BOOKING OVERVIEW & Section 7: BOOKINGS BY SERVICE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Section 6: BOOKING OVERVIEW (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Booking Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Service booking volume and multi-category trends
              </p>
            </div>

            {/* Date & Filter Controls */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setChartPeriod('7d')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  chartPeriod === '7d'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setChartPeriod('30d')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  chartPeriod === '30d'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Last 30 Days
              </button>
            </div>
          </div>

          {/* Service Interactive Category Toggles */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter Service:</span>
            {[
              { id: 'ALL', label: 'All Services' },
              { id: 'package', label: 'Packages', color: 'bg-orange-500' },
              { id: 'flight', label: 'Flights', color: 'bg-blue-600' },
              { id: 'hotel', label: 'Hotels', color: 'bg-emerald-600' },
              { id: 'bus', label: 'Buses', color: 'bg-amber-600' },
              { id: 'car', label: 'Cars', color: 'bg-purple-600' }
            ].map(svc => (
              <button
                key={svc.id}
                type="button"
                onClick={() => setActiveChartService(svc.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  activeChartService === svc.id
                    ? 'bg-slate-900 text-white shadow-2xs ring-1 ring-slate-900'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {svc.color && <span className={`w-2 h-2 rounded-full ${svc.color}`} />}
                <span>{svc.label}</span>
              </button>
            ))}
          </div>

          {/* Line Trend Chart Component (Section 6) */}
          <div className="mt-4">
            <LineTrendChart
              data={currentTrendData}
              activeService={activeChartService}
              period={chartPeriod}
            />
          </div>

          {/* Chart Legend Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {[
                { id: 'package', label: 'Holiday Packages', color: '#F97316' },
                { id: 'flight', label: 'Flights', color: '#2563EB' },
                { id: 'hotel', label: 'Hotels', color: '#10B981' },
                { id: 'bus', label: 'Buses', color: '#F59E0B' },
                { id: 'car', label: 'Cabs', color: '#8B5CF6' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveChartService(activeChartService === item.id ? 'ALL' : item.id)}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                    activeChartService === item.id
                      ? 'bg-slate-900 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={`Click to filter only ${item.label}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <span className="text-slate-400 font-medium">Daily average: 211 bookings</span>
          </div>
        </div>

        {/* Section 7: BOOKINGS BY SERVICE (Donut + Clickable Legend) */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Bookings by Service</h2>
              <p className="text-xs text-slate-500 mt-0.5">Click any service to inspect category metrics</p>
            </div>

            {/* Visual Donut Chart with Center Stats */}
            <div className="relative flex items-center justify-center my-5">
              <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 100 100">
                {/* SVG Donut Slices */}
                {/* Package (43.3%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F97316"
                  strokeWidth={selectedService === 'Package' ? '12' : '9'}
                  strokeDasharray="103.5 238.8"
                  strokeDashoffset="0"
                  className="cursor-pointer transition-all duration-200 hover:opacity-85"
                  onClick={() => setSelectedService('Package')}
                />
                {/* Flight (25.9%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#2563EB"
                  strokeWidth={selectedService === 'Flight' ? '12' : '9'}
                  strokeDasharray="61.8 238.8"
                  strokeDashoffset="-103.5"
                  className="cursor-pointer transition-all duration-200 hover:opacity-85"
                  onClick={() => setSelectedService('Flight')}
                />
                {/* Hotel (14.2%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth={selectedService === 'Hotel' ? '12' : '9'}
                  strokeDasharray="33.9 238.8"
                  strokeDashoffset="-165.3"
                  className="cursor-pointer transition-all duration-200 hover:opacity-85"
                  onClick={() => setSelectedService('Hotel')}
                />
                {/* Bus (10.4%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#D97706"
                  strokeWidth={selectedService === 'Bus' ? '12' : '9'}
                  strokeDasharray="24.8 238.8"
                  strokeDashoffset="-199.2"
                  className="cursor-pointer transition-all duration-200 hover:opacity-85"
                  onClick={() => setSelectedService('Bus')}
                />
                {/* Car (6.2%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#8B5CF6"
                  strokeWidth={selectedService === 'Car' ? '12' : '9'}
                  strokeDasharray="14.8 238.8"
                  strokeDashoffset="-224.0"
                  className="cursor-pointer transition-all duration-200 hover:opacity-85"
                  onClick={() => setSelectedService('Car')}
                />
              </svg>

              {/* Center Metrics */}
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400">Selected</span>
                <span className="text-lg font-black text-slate-900 mt-0.5">{activeServiceObj.name}</span>
                <span className="text-xs font-bold text-orange-600">{activeServiceObj.percentage}%</span>
              </div>
            </div>

            {/* Selected Service Focus Box */}
            <div className={`p-3 rounded-xl border ${activeServiceObj.bgLight} ${activeServiceObj.borderLight} text-xs mb-3`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <activeServiceObj.icon className="w-4 h-4 text-slate-700" />
                  {activeServiceObj.label}
                </span>
                <span className="font-mono font-bold text-slate-800">{activeServiceObj.count} Bookings</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 mt-1">
                <span>Gross Revenue:</span>
                <span className="font-bold text-slate-900">{activeServiceObj.revenue}</span>
              </div>
            </div>

            {/* Clickable Legend Items (Section 7: The service legend should be clickable) */}
            <div className="space-y-1.5">
              {servicesBreakdown.map((s) => {
                const isSelected = selectedService === s.name;
                const Icon = s.icon;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSelectedService(s.name)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <Icon className="w-3.5 h-3.5 opacity-80" />
                      <span>{s.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={isSelected ? 'text-white font-mono' : 'text-slate-500 font-mono'}>
                        {s.count}
                      </span>
                      <span className={`font-bold w-12 text-right ${isSelected ? 'text-orange-400' : 'text-slate-900'}`}>
                        {s.percentage}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-3">
            <button
              type="button"
              onClick={() => onNavigate(`/admin/bookings/${selectedService.toLowerCase()}`)}
              className="w-full py-2 rounded-xl bg-slate-50 hover:bg-orange-50 hover:text-orange-600 text-slate-700 text-xs font-semibold cursor-pointer transition-colors text-center border border-slate-200"
            >
              View {activeServiceObj.name} Bookings Table →
            </button>
          </div>
        </div>
      </div>

      {/* 4. Section 8: QUICK ACTIONS (REQUIRED) */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Quick Actions</h2>
            <p className="text-xs text-slate-500 mt-0.5">Common administrative workflows and direct shortcuts</p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">4 Tools Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
          {/* Action 1: Add New Package */}
          <button
            type="button"
            onClick={onOpenAddPackage}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 group text-left transition-all cursor-pointer bg-white shadow-2xs"
          >
            <div className="w-11 h-11 rounded-xl bg-orange-100 text-[#F97316] group-hover:bg-[#F97316] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-[#F97316] transition-colors">
                Add New Package
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Publish new tour or package itinerary</p>
            </div>
          </button>

          {/* Action 2: Add Blog */}
          <button
            type="button"
            onClick={onOpenAddBlog}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 group text-left transition-all cursor-pointer bg-white shadow-2xs"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Add Blog
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Create travel guide or destination article</p>
            </div>
          </button>

          {/* Action 3: Manage Bookings */}
          <button
            type="button"
            onClick={() => onNavigate('/admin/bookings/package')}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 group text-left transition-all cursor-pointer bg-white shadow-2xs"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Manage Bookings
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Inspect reservations, tickets and vouchers</p>
            </div>
          </button>

          {/* Action 4: View Users */}
          <button
            type="button"
            onClick={() => onNavigate('/admin/users')}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 group text-left transition-all cursor-pointer bg-white shadow-2xs"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                View Users
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Manage customer directory & profiles</p>
            </div>
          </button>
        </div>
      </div>

      {/* 5. Section 9: MORE / RECENT BOOKINGS TABLE & DETAIL DRAWER (REQUIRED) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Table in 2 columns */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Bookings</h2>
              <p className="text-xs text-slate-500 mt-0.5">Click any booking row to view details in the inspector</p>
            </div>
            
            {/* Quick Filter Tabs for Recent Bookings */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'ALL', label: 'All Services' },
                { id: 'flight', label: 'Flights', icon: Plane },
                { id: 'hotel', label: 'Hotels', icon: Hotel },
                { id: 'package', label: 'Packages', icon: Compass },
                { id: 'cab', label: 'Cabs', icon: Car },
                { id: 'bus', label: 'Buses', icon: Bus }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRecentServiceFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    recentServiceFilter.toLowerCase() === tab.id.toLowerCase()
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-3">Service</th>
                  <th className="py-3.5 px-4">Destination / Route</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No bookings found for the selected service filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecentBookings.map((b) => {
                    const isSelected = activeBooking?.id === b.id;
                    const serviceType = b.type || (b.busDetails ? 'bus' : b.airline ? 'flight' : b.hotel ? 'hotel' : b.vehicle ? 'cab' : 'package');

                    const getBookingRouteOrTitle = () => {
                      if (serviceType === 'flight') {
                        return `${b.airline} ${b.flightNo} (${b.route || b.sector || 'Flight'})`;
                      }
                      if (serviceType === 'hotel') {
                        return `${b.hotel} ${b.city ? `(${b.city})` : ''}`;
                      }
                      if (serviceType === 'cab') {
                        return `${b.vehicle || 'Cab'} (${b.drop ? b.drop.split('(')[0] : 'Transfer'})`;
                      }
                      if (serviceType === 'bus') {
                        return `${b.operator || 'Bus'} (${b.route})`;
                      }
                      return b.packageName || b.route || 'Travel Package';
                    };

                    return (
                      <tr
                        key={b.id}
                        onClick={() => setInspectBooking(b)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-orange-50/60 hover:bg-orange-50/80'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Customer */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div>
                            <p className="font-bold">{b.customer?.name || 'Rahul Sharma'}</p>
                            <p className="text-[11px] text-slate-400 font-normal font-mono">{b.id}</p>
                          </div>
                        </td>

                        {/* Booking / Service */}
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
                            {serviceType === 'package' && <Compass className="w-3 h-3 text-orange-600" />}
                            {serviceType === 'bus' && <Bus className="w-3 h-3 text-amber-600" />}
                            {serviceType === 'flight' && <Plane className="w-3 h-3 text-blue-600" />}
                            {serviceType === 'hotel' && <Hotel className="w-3 h-3 text-emerald-600" />}
                            {serviceType === 'cab' && <Car className="w-3 h-3 text-purple-600" />}
                            <span className="capitalize">{serviceType}</span>
                          </span>
                        </td>

                        {/* Destination / Package / Route */}
                        <td className="py-3.5 px-4 text-slate-800 font-medium max-w-[200px] truncate" title={getBookingRouteOrTitle()}>
                          {getBookingRouteOrTitle()}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                          {b.travelDate || b.checkIn || b.date || '12 Sep 2025'}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          ₹{b.amount?.toLocaleString('en-IN')}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3">
                          <StatusBadge status={b.status} />
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setInspectBooking(b)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 cursor-pointer transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Booking Inspector Drawer (1 col sticky) */}
        <div className="xl:col-span-1 sticky top-24">
          <BookingDrawer
            booking={activeBooking}
            type={activeBooking?.type || (activeBooking?.airline ? 'flight' : activeBooking?.hotel ? 'hotel' : activeBooking?.vehicle ? 'cab' : activeBooking?.busDetails ? 'bus' : 'package')}
            onViewInvoice={onViewInvoice}
            onViewTicket={onViewTicket}
            onCancelBooking={onCancelBooking}
          />
        </div>
      </div>
    </div>
  );
}
