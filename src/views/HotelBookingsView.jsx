import React, { useState, useMemo } from 'react';
import { Hotel, CheckCircle2, Clock, XCircle, Download, Plus } from 'lucide-react';
import PageHeader from '../components/admin/PageHeader.jsx';
import StatCard from '../components/admin/StatCard.jsx';
import FilterBar from '../components/admin/FilterBar.jsx';
import DataTable from '../components/admin/DataTable.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import BookingDrawer from '../components/admin/BookingDrawer.jsx';

export default function HotelBookingsView({
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
        const matchHotel = b.hotel?.toLowerCase().includes(q);
        const matchCity = b.city?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchHotel && !matchCity) return false;
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
      key: 'hotel',
      header: 'Hotel / Resort',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.hotel}</p>
          <p className="text-[11px] text-slate-500">{row.city} • {row.rating || '4 Star'}</p>
        </div>
      )
    },
    {
      key: 'room',
      header: 'Room Category',
      render: (row) => row.room || 'Deluxe Room'
    },
    {
      key: 'dates',
      header: 'Check-in / Check-out',
      render: (row) => (
        <div>
          <p className="text-slate-800 font-medium">{row.checkIn || row.travelDate}</p>
          <p className="text-[11px] text-slate-400">{row.nights || '3 Nights'}</p>
        </div>
      )
    },
    {
      key: 'customer',
      header: 'Guest Name',
      render: (row) => row.customer?.name
    },
    {
      key: 'amount',
      header: 'Total Stay',
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
    <div id="hotel-bookings-page" className="space-y-6">
      <PageHeader
        title="Hotel Bookings"
        subtitle="Manage luxury resort reservations, room inventory allocations, check-ins, and guest vouchers."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Bookings' },
          { label: 'Hotel Bookings' }
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
          id="stat-hotel-total"
          title="Total Bookings"
          value={bookings.length.toString()}
          change="8%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={Hotel}
          colorScheme="green"
        />
        <StatCard
          id="stat-hotel-confirmed"
          title="Confirmed Stays"
          value={bookings.filter(b => b.status === 'Confirmed').length.toString()}
          change="12%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={CheckCircle2}
          colorScheme="green"
        />
        <StatCard
          id="stat-hotel-pending"
          title="Pending Approval"
          value={bookings.filter(b => b.status === 'Pending').length.toString()}
          change="2%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          id="stat-hotel-cancelled"
          title="Cancelled Stays"
          value={bookings.filter(b => b.status === 'Cancelled').length.toString()}
          change="5%"
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
        searchPlaceholder="Search hotel, city, guest name..."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2">
          <DataTable
            id="hotel-bookings-table"
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
            tableTitle="Hotel & Resort Bookings"
          />
        </div>

        <div className="xl:col-span-1 sticky top-24">
          <BookingDrawer
            booking={selectedBooking}
            type="hotel"
            onViewInvoice={() => onInvoice(selectedBooking)}
            onCancelBooking={onCancelBooking}
          />
        </div>
      </div>
    </div>
  );
}
