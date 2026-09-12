import React, { useState, useMemo } from 'react';
import { Plane, CheckCircle2, Clock, XCircle, Download, Plus } from 'lucide-react';
import PageHeader from '../components/admin/PageHeader.jsx';
import StatCard from '../components/admin/StatCard.jsx';
import FilterBar from '../components/admin/FilterBar.jsx';
import DataTable from '../components/admin/DataTable.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import BookingDrawer from '../components/admin/BookingDrawer.jsx';

export default function FlightBookingsView({
  bookings = [],
  onViewTicket,
  onCancelBooking,
  onInvoice,
  onNavigate
}) {
  const [selectedBookingId, setSelectedBookingId] = useState(bookings[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterAirline, setFilterAirline] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const selectedBooking = useMemo(() => {
    return bookings.find(b => b.id === selectedBookingId) || bookings[0] || null;
  }, [bookings, selectedBookingId]);

  const airlineOptions = useMemo(() => {
    const airlines = Array.from(new Set(bookings.map(b => b.airline).filter(Boolean)));
    return [
      { value: 'ALL', label: 'All Airlines' },
      ...airlines.map(a => ({ value: a, label: a }))
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
      key: 'airline',
      label: 'Airline Carrier',
      options: airlineOptions
    }
  ];

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
      if (filterAirline !== 'ALL' && b.airline !== filterAirline) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = b.customer?.name?.toLowerCase().includes(q);
        const matchId = b.id?.toLowerCase().includes(q);
        const matchRoute = b.route?.toLowerCase().includes(q);
        const matchPnr = b.pnr?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchRoute && !matchPnr) return false;
      }
      return true;
    });
  }, [bookings, filterStatus, filterAirline, searchQuery]);

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
      key: 'airline',
      header: 'Flight & Airline',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.airline}</p>
          <p className="text-[11px] font-mono text-slate-500">{row.flightNo} • {row.cabinClass || 'Economy'}</p>
        </div>
      )
    },
    {
      key: 'route',
      header: 'Sector',
      render: (row) => (
        <span className="font-semibold text-slate-800">{row.route}</span>
      )
    },
    {
      key: 'pnr',
      header: 'PNR',
      render: (row) => (
        <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs">
          {row.pnr || 'PNR-8832'}
        </span>
      )
    },
    {
      key: 'departure',
      header: 'Departure',
      render: (row) => (
        <div>
          <p className="text-slate-800 font-medium">{row.travelDate}</p>
          <p className="text-[11px] text-slate-400">{row.departureTime}</p>
        </div>
      )
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
    <div id="flight-bookings-page" className="space-y-6">
      <PageHeader
        title="Flight Bookings"
        subtitle="Manage domestic and international air tickets, PNR issuance, and airline passenger manifests."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Bookings' },
          { label: 'Flight Bookings' }
        ]}
        onNavigate={onNavigate}
        actions={
          <button
            type="button"
            onClick={() => onViewTicket(selectedBooking)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Manifest</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-flight-total"
          title="Total Flights"
          value={bookings.length.toString()}
          change="12%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={Plane}
          colorScheme="blue"
        />
        <StatCard
          id="stat-flight-confirmed"
          title="Confirmed PNRs"
          value={bookings.filter(b => b.status === 'Confirmed').length.toString()}
          change="15%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={CheckCircle2}
          colorScheme="green"
        />
        <StatCard
          id="stat-flight-pending"
          title="Pending Issuance"
          value={bookings.filter(b => b.status === 'Pending').length.toString()}
          change="4%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          id="stat-flight-cancelled"
          title="Cancelled Flights"
          value={bookings.filter(b => b.status === 'Cancelled').length.toString()}
          change="8%"
          isPositive={false}
          comparisonText="vs last 7 days"
          icon={XCircle}
          colorScheme="red"
        />
      </div>

      <FilterBar
        filters={filters}
        filterValues={{ status: filterStatus, airline: filterAirline }}
        onFilterChange={(key, val) => {
          if (key === 'status') setFilterStatus(val);
          if (key === 'airline') setFilterAirline(val);
          setCurrentPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={(val) => setSearchQuery(val)}
        onApplySearch={() => setCurrentPage(1)}
        onReset={() => {
          setFilterStatus('ALL');
          setFilterAirline('ALL');
          setSearchQuery('');
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by passenger, PNR, flight no..."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2">
          <DataTable
            id="flight-bookings-table"
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
            tableTitle="Airline Ticket Bookings"
          />
        </div>

        <div className="xl:col-span-1 sticky top-24">
          <BookingDrawer
            booking={selectedBooking}
            type="flight"
            onViewTicket={() => onViewTicket(selectedBooking)}
            onViewInvoice={() => onInvoice(selectedBooking)}
            onCancelBooking={onCancelBooking}
          />
        </div>
      </div>
    </div>
  );
}
