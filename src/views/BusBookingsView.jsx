import React, { useState, useMemo } from 'react';
import {
  Bus,
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

export default function BusBookingsView({
  bookings = [],
  onViewTicket,
  onCancelBooking,
  onOpenAddBooking,
  onNavigate
}) {
  const [selectedBookingId, setSelectedBookingId] = useState(bookings[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterOperator, setFilterOperator] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const selectedBooking = useMemo(() => {
    return bookings.find(b => b.id === selectedBookingId) || bookings[0] || null;
  }, [bookings, selectedBookingId]);

  const operatorOptions = useMemo(() => {
    const ops = Array.from(new Set(bookings.map(b => b.operator).filter(Boolean)));
    return [
      { value: 'ALL', label: 'All Operators' },
      ...ops.map(o => ({ value: o, label: o }))
    ];
  }, [bookings]);

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
    },
    {
      key: 'operator',
      label: 'Bus Operator',
      options: operatorOptions
    }
  ];

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
      if (filterOperator !== 'ALL' && b.operator !== filterOperator) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = b.customer?.name?.toLowerCase().includes(q);
        const matchId = b.id?.toLowerCase().includes(q);
        const matchRoute = b.route?.toLowerCase().includes(q);
        const matchOp = b.operator?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchRoute && !matchOp) return false;
      }
      return true;
    });
  }, [bookings, filterStatus, filterOperator, searchQuery]);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

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
      key: 'operator',
      header: 'Bus Operator',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.operator}</p>
          <p className="text-[11px] text-slate-500">{row.busDetails}</p>
        </div>
      )
    },
    {
      key: 'route',
      header: 'Route',
      render: (row) => (
        <div className="font-semibold text-slate-800">
          <span>{row.route}</span>
          <span className="block text-[10px] text-slate-400 font-normal">{row.distance || '450 km'}</span>
        </div>
      )
    },
    {
      key: 'travelDate',
      header: 'Departure',
      render: (row) => (
        <div>
          <p className="text-slate-800 font-medium">{row.travelDate}</p>
          <p className="text-[11px] text-orange-600 font-semibold">{row.departureTime}</p>
        </div>
      )
    },
    {
      key: 'seats',
      header: 'Seats',
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
          {row.seatNumbers ? row.seatNumbers.join(', ') : 'A1'}
        </span>
      )
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
    <div id="bus-bookings-page" className="space-y-6">
      <PageHeader
        title="Bus Bookings"
        subtitle="Manage intercity bus reservations, passenger seat maps, operator dispatches, and tickets."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Bookings' },
          { label: 'Bus Bookings' }
        ]}
        onNavigate={onNavigate}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onViewTicket(selectedBooking)}
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
              <span>Add Bus Booking</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-bus-total"
          title="Total Bus Bookings"
          value={totalCount.toString()}
          change="16%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={Bus}
          colorScheme="orange"
        />
        <StatCard
          id="stat-bus-confirmed"
          title="Confirmed"
          value={confirmedCount.toString()}
          change="18%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={CheckCircle2}
          colorScheme="green"
        />
        <StatCard
          id="stat-bus-pending"
          title="Pending"
          value={pendingCount.toString()}
          change="5%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          id="stat-bus-cancelled"
          title="Cancelled"
          value={cancelledCount.toString()}
          change="12%"
          isPositive={false}
          comparisonText="vs last 7 days"
          icon={XCircle}
          colorScheme="red"
        />
      </div>

      <FilterBar
        filters={filters}
        filterValues={{ status: filterStatus, operator: filterOperator }}
        onFilterChange={(key, val) => {
          if (key === 'status') setFilterStatus(val);
          if (key === 'operator') setFilterOperator(val);
          setCurrentPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={(val) => setSearchQuery(val)}
        onApplySearch={() => setCurrentPage(1)}
        onReset={() => {
          setFilterStatus('ALL');
          setFilterOperator('ALL');
          setSearchQuery('');
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by passenger, booking ID, or route..."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2">
          <DataTable
            id="bus-bookings-table"
            columns={columns}
            data={paginatedBookings}
            totalItems={filteredBookings.length}
            selectedId={selectedBookingId}
            onRowClick={(row) => setSelectedBookingId(row.id)}
            onView={(row) => setSelectedBookingId(row.id)}
            onEdit={(row) => setSelectedBookingId(row.id)}
            onInvoice={(row) => onViewTicket(row)}
            onCancel={(row) => onCancelBooking(row)}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            tableTitle="Intercity Bus Bookings"
          />
        </div>

        <div className="xl:col-span-1 sticky top-24">
          <BookingDrawer
            booking={selectedBooking}
            type="bus"
            onViewTicket={onViewTicket}
            onCancelBooking={onCancelBooking}
          />
        </div>
      </div>
    </div>
  );
}
