import React, { useState, useMemo } from 'react';
import {
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Plus
} from 'lucide-react';
import PageHeader from '../components/admin/PageHeader.jsx';
import StatCard from '../components/admin/StatCard.jsx';
import FilterBar from '../components/admin/FilterBar.jsx';
import DataTable from '../components/admin/DataTable.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import BookingDrawer from '../components/admin/BookingDrawer.jsx';

export default function PackageBookingsView({
  bookings = [],
  onViewInvoice,
  onCancelBooking,
  onOpenAddBooking,
  onNavigate
}) {
  const [selectedBookingId, setSelectedBookingId] = useState(bookings[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPackage, setFilterPackage] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected booking object
  const selectedBooking = useMemo(() => {
    return bookings.find(b => b.id === selectedBookingId) || bookings[0] || null;
  }, [bookings, selectedBookingId]);

  // Unique package list for dropdown filter
  const packageOptions = useMemo(() => {
    const names = Array.from(new Set(bookings.map(b => b.packageName).filter(Boolean)));
    return [
      { value: 'ALL', label: 'All Packages' },
      ...names.map(name => ({ value: name, label: name }))
    ];
  }, [bookings]);

  // Filter criteria
  const filters = [
    {
      key: 'status',
      label: 'Booking Status',
      options: [
        { value: 'ALL', label: 'All Status' },
        { value: 'Confirmed', label: 'Confirmed' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Cancelled', label: 'Cancelled' },
        { value: 'Processing', label: 'Processing' }
      ]
    },
    {
      key: 'package',
      label: 'Package Selection',
      options: packageOptions
    }
  ];

  // Filtering data
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
      if (filterPackage !== 'ALL' && b.packageName !== filterPackage) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = b.customer?.name?.toLowerCase().includes(q);
        const matchId = b.id?.toLowerCase().includes(q);
        const matchEmail = b.customer?.email?.toLowerCase().includes(q);
        const matchPkg = b.packageName?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchEmail && !matchPkg) return false;
      }
      return true;
    });
  }, [bookings, filterStatus, filterPackage, searchQuery]);

  // Pagination slice
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  // Stats calculation
  const totalCount = bookings.length;
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;

  const columns = [
    {
      key: 'id',
      header: 'Booking ID',
      className: 'font-mono font-bold text-slate-900',
      render: (row) => row.id
    },
    {
      key: 'packageName',
      header: 'Package Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image}
            alt={row.packageName}
            className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-bold text-slate-900 truncate">{row.packageName}</p>
            <p className="text-[11px] text-slate-400 truncate">{row.route || 'Delhi → Port Blair'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.customer?.name}</p>
          <p className="text-[11px] text-slate-400">{row.customer?.phone}</p>
        </div>
      )
    },
    {
      key: 'travelDate',
      header: 'Travel Date',
      render: (row) => row.travelDate
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (row) => row.duration
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'font-bold text-slate-900',
      render: (row) => `₹${row.amount?.toLocaleString('en-IN')}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div id="package-bookings-page" className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Package Bookings"
        subtitle="Manage holiday reservations, customer travelers, itinerary vouchers, and invoicing."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Bookings' },
          { label: 'Package Bookings' }
        ]}
        onNavigate={onNavigate}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onViewInvoice(selectedBooking)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onOpenAddBooking}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Booking</span>
            </button>
          </div>
        }
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-pkg-total"
          title="Total Bookings"
          value={totalCount.toString()}
          change="16%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={Package}
          colorScheme="orange"
        />
        <StatCard
          id="stat-pkg-confirmed"
          title="Confirmed"
          value={confirmedCount.toString()}
          change="18%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={CheckCircle2}
          colorScheme="green"
        />
        <StatCard
          id="stat-pkg-pending"
          title="Pending"
          value={pendingCount.toString()}
          change="5%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          id="stat-pkg-cancelled"
          title="Cancelled"
          value={cancelledCount.toString()}
          change="12%"
          isPositive={false}
          comparisonText="vs last 7 days"
          icon={XCircle}
          colorScheme="red"
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        filterValues={{ status: filterStatus, package: filterPackage }}
        onFilterChange={(key, val) => {
          if (key === 'status') setFilterStatus(val);
          if (key === 'package') setFilterPackage(val);
          setCurrentPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={(val) => setSearchQuery(val)}
        onApplySearch={() => setCurrentPage(1)}
        onReset={() => {
          setFilterStatus('ALL');
          setFilterPackage('ALL');
          setSearchQuery('');
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by name, booking ID, or email..."
      />

      {/* Main Split Layout (Table on left, Details on right) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left: Data Table (2 cols on xl) */}
        <div className="xl:col-span-2">
          <DataTable
            id="package-bookings-table"
            columns={columns}
            data={paginatedBookings}
            totalItems={filteredBookings.length}
            selectedId={selectedBookingId}
            onRowClick={(row) => setSelectedBookingId(row.id)}
            onView={(row) => setSelectedBookingId(row.id)}
            onEdit={(row) => setSelectedBookingId(row.id)}
            onInvoice={(row) => onViewInvoice(row)}
            onCancel={(row) => onCancelBooking(row)}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            tableTitle="Holiday Package Bookings"
          />
        </div>

        {/* Right: Booking Details Panel (1 col on xl) */}
        <div className="xl:col-span-1 sticky top-24">
          <BookingDrawer
            booking={selectedBooking}
            type="package"
            onViewInvoice={onViewInvoice}
            onEditBooking={(b) => onViewInvoice(b)}
            onCancelBooking={onCancelBooking}
          />
        </div>
      </div>
    </div>
  );
}
