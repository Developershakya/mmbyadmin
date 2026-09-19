import React, { useState, useEffect } from 'react';
import {
  X,
  Plane,
  Building2,
  Bus,
  Car,
  Search,
  Filter,
  Printer,
  Ban,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  FileText
} from 'lucide-react';

const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

export default function BookingManagerModal({
  isOpen,
  onClose,
  initialServiceType = 'ALL',
  showToast = (msg, type) => console.log(msg)
}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState(initialServiceType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of travel plan');
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const url = activeType === 'ALL' ? '/api/bookings' : `/api/bookings?serviceType=${activeType}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBookings();
    }
  }, [isOpen, activeType]);

  if (!isOpen) return null;

  const filteredBookings = bookings.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.displayTitle?.toLowerCase().includes(q) ||
      b.bookingId?.toLowerCase().includes(q) ||
      b.refCode?.toLowerCase().includes(q) ||
      b.pnr?.toLowerCase().includes(q) ||
      b.confirmationNo?.toLowerCase().includes(q) ||
      b.ticketNo?.toLowerCase().includes(q)
    );
  });

  const handleOpenCancel = (booking) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.serviceType.toLowerCase()}/${selectedBooking.bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(`Booking cancelled. Refund: ₹${data.cancellation.RefundAmount}`, 'success');
        setCancelModalOpen(false);
        fetchBookings();
      } else {
        throw new Error(data.error || 'Failed to cancel booking');
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  const getDocUrl = (b) => {
    const type = b.serviceType.toLowerCase();
    const id = b.bookingId || b.id || b.refCode;
    if (type === 'flight') return `/api/bookings/flight/${id}/ticket`;
    if (type === 'hotel') return `/api/bookings/hotel/${id}/voucher`;
    if (type === 'bus') return `/api/bookings/bus/${id}/ticket`;
    if (type === 'car') return `/api/bookings/car/${id}/voucher`;
    return `/api/bookings/flight/${id}/ticket`;
  };

  const getServiceIcon = (type) => {
    switch (type) {
      case 'FLIGHT': return <Plane className="w-4 h-4 text-blue-600" />;
      case 'HOTEL': return <Building2 className="w-4 h-4 text-emerald-600" />;
      case 'BUS': return <Bus className="w-4 h-4 text-orange-600" />;
      case 'CAR': return <Car className="w-4 h-4 text-amber-600" />;
      default: return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <span>Travel Reservations & Voucher Center</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                {bookings.length} Bookings
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live bookings, printable e-tickets, and instant cancellation management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBookings}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              title="Refresh Bookings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row gap-3 py-4 items-center justify-between">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {['ALL', 'FLIGHT', 'HOTEL', 'BUS', 'CAR'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeType === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'ALL' ? 'All Services' : t}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search PNR, City, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-600" />
              <p className="text-xs">Loading travel bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-sm font-semibold text-slate-600">No bookings found</p>
              <p className="text-xs text-slate-400 mt-1">Book services through the Itinerary Builder or Search Modals</p>
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id || b.bookingId}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getServiceIcon(b.serviceType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{b.displayTitle}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {b.status || 'CONFIRMED'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span>Ref / PNR: <strong className="font-mono text-slate-700">{b.refCode || b.pnr || b.confirmationNo || b.ticketNo}</strong></span>
                      <span>Booking ID: <strong className="font-mono text-slate-700">{b.bookingId}</strong></span>
                      <span>Booked on: {new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>

                    {b.status === 'CANCELLED' && b.refundDetails && (
                      <div className="text-[11px] text-red-600 font-medium mt-1">
                        Cancelled • Refund Amount: ₹{b.refundDetails.refundAmount || 0} ({b.refundDetails.refundStatus || 'PROCESSED'})
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <div className="text-right">
                    <div className="text-base font-black text-slate-900">
                      {inr(b.totalAmount || b.fare)}
                    </div>
                    <div className="text-[10px] text-slate-400">Total Paid</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={getDocUrl(b)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs"
                      title="View & Print Official Voucher / E-Ticket"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Voucher</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>

                    {b.status !== 'CANCELLED' && (
                      <button
                        type="button"
                        onClick={() => handleOpenCancel(b)}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 flex items-center gap-1"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cancellation Confirm Modal */}
        {cancelModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Ban className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-center text-slate-900 text-base mb-1">
                Cancel {selectedBooking.serviceType} Booking?
              </h4>
              <p className="text-xs text-center text-slate-500 mb-4">
                Booking ID: {selectedBooking.bookingId}. A nominal cancellation charge applies as per policy.
              </p>

              <div className="mb-4">
                <label className="text-xs font-medium text-slate-600 block mb-1">Reason for cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option>Change of travel plan</option>
                  <option>Found alternative flight/transport</option>
                  <option>Medical or personal emergency</option>
                  <option>Trip rescheduled</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold border border-slate-300 rounded-xl hover:bg-slate-50"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelLoading}
                  className="flex-1 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center gap-1"
                >
                  {cancelLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
