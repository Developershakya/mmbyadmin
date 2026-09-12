import React, { useState, useMemo } from 'react';
import { Car, CheckCircle2, Clock, XCircle, Download } from 'lucide-react';
import PageHeader from '../components/admin/PageHeader.jsx';
import StatCard from '../components/admin/StatCard.jsx';
import FilterBar from '../components/admin/FilterBar.jsx';
import DataTable from '../components/admin/DataTable.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import BookingDrawer from '../components/admin/BookingDrawer.jsx';

export default function CabBookingsView({
  bookings = [],
  onInvoice,
  onCancelBooking,
  onNavigate
}) {
  const [selectedBookingId, setSelectedBookingId] = useState(bookings[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const selectedBooking = useMemo(() => {
    return bookings.find(b => b.id === selectedBookingId) || bookings[0] || null;
  }, [bookings, selectedBookingId]);

  const filters = [
    {
      key: 'status',
      label: 'Booking Status',
      options: [
        { value: 'ALL', label: 'All Status' },
        { value: 'Confirmed', label: 'Confirmed' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Cancelled', label: 'Cancelled' }
      ]
    }
  ];

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = b.customer?.name?.toLowerCase().includes(q);
        const matchId = b.id?.toLowerCase().includes(q);
        const matchVehicle = b.vehicle?.toLowerCase().includes(q);
        const matchPickup = b.pickup?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchVehicle && !matchPickup) return false;
      }
      return true;
    });
  }, [bookings, filterStatus, searchQuery]);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  const columns = [
    {
      key: 'id',
      header: 'Booking ID',
      className: 'font-mono font-bold text-slate-900',
      render: (row) => row.id
    },
    {
      key: 'vehicle',
      header: 'Vehicle Model',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.vehicle || 'Toyota Innova Crysta'}</p>
          <p className="text-[11px] text-slate-500">{row.carType || 'SUV 6-Seater AC'}</p>
        </div>
      )
    },
    {
      key: 'pickup',
      header: 'Pickup & Drop',
      render: (row) => (
        <div>
          <p className="text-slate-800 font-semibold">{row.pickup || 'Airport Terminal'}</p>
          <p className="text-[11px] text-slate-400">to {row.drop || 'Hotel / Resort'}</p>
        </div>
      )
    },
    {
      key: 'travelDate',
      header: 'Pickup Date & Time',
      render: (row) => (
        <div>
          <p className="text-slate-800">{row.travelDate}</p>
          <p className="text-[11px] text-orange-600 font-medium">{row.pickupTime || '09:00 AM'}</p>
        </div>
      )
    },
    {
      key: 'customer',
      header: 'Passenger',
      render: (row) => row.customer?.name
    },
    {
      key: 'amount',
      header: 'Fare',
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
    <div id="cab-bookings-page" className="space-y-6">
      <PageHeader
        title="Car & Cab Bookings"
        subtitle="Manage airport transfers, intercity rentals, chauffeur dispatches, and local sightseeing cabs."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Bookings' },
          { label: 'Cab Bookings' }
        ]}
        onNavigate={onNavigate}
        actions={
          <button
            type="button"
            onClick={() => onInvoice(selectedBooking)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-cab-total"
          title="Total Transfers"
          value={bookings.length.toString()}
          change="10%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={Car}
          colorScheme="amber"
        />
        <StatCard
          id="stat-cab-confirmed"
          title="Dispatched Cabs"
          value={bookings.filter(b => b.status === 'Confirmed').length.toString()}
          change="14%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={CheckCircle2}
          colorScheme="green"
        />
        <StatCard
          id="stat-cab-pending"
          title="Pending Allocation"
          value={bookings.filter(b => b.status === 'Pending').length.toString()}
          change="3%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          id="stat-cab-cancelled"
          title="Cancelled Trips"
          value={bookings.filter(b => b.status === 'Cancelled').length.toString()}
          change="4%"
          isPositive={false}
          comparisonText="vs last 7 days"
          icon={XCircle}
          colorScheme="red"
        />
      </div>

      <FilterBar
        filters={filters}
        filterValues={{ status: filterStatus }}
        onFilterChange={(key, val) => {
          if (key === 'status') setFilterStatus(val);
          setCurrentPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={(val) => setSearchQuery(val)}
        onApplySearch={() => setCurrentPage(1)}
        onReset={() => {
          setFilterStatus('ALL');
          setSearchQuery('');
          setCurrentPage(1);
        }}
        searchPlaceholder="Search passenger, vehicle, or pickup spot..."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2">
          <DataTable
            id="cab-bookings-table"
            columns={columns}
            data={paginatedBookings}
            totalItems={filteredBookings.length}
            selectedId={selectedBookingId}
            onRowClick={(row) => setSelectedBookingId(row.id)}
            onView={(row) => setSelectedBookingId(row.id)}
            onInvoice={(row) => onInvoice(row)}
            onCancel={(row) => onCancelBooking(row)}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            tableTitle="Cab & Airport Transfer Bookings"
          />
        </div>

        <div className="xl:col-span-1 sticky top-24">
          <BookingDrawer
            booking={selectedBooking}
            type="cab"
            onViewInvoice={() => onInvoice(selectedBooking)}
            onCancelBooking={onCancelBooking}
          />
        </div>
      </div>
    </div>
  );
}
