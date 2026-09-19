import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Smartphone,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Printer,
  FileText
} from 'lucide-react';

const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

export default function RazorpayCheckoutModal({
  isOpen,
  onClose,
  bookingData, // { serviceType: 'FLIGHT'|'HOTEL'|'BUS'|'CAR'|'PACKAGE', title, amount, details, packageId, serviceItemId, itineraryDayId, rawPayload }
  onBookingConfirmed,
  showToast = (msg, type) => console.log(msg)
}) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [upiId, setUpiId] = useState('traveler@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen || !bookingData) return null;

  const totalAmount = Number(bookingData.amount || 0);

  const handlePayNow = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Create order on backend
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          serviceType: bookingData.serviceType,
          packageId: bookingData.packageId,
          serviceItemId: bookingData.serviceItemId
        })
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize payment order');
      }

      const orderId = orderData.orderId;
      const testPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const testSignature = `test_sig_${orderId}_${testPaymentId}`;

      // 2. Verify payment and execute atomic booking
      const verifyRes = await fetch('/api/payments/verify-and-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentId: testPaymentId,
          signature: testSignature,
          serviceType: bookingData.serviceType,
          packageId: bookingData.packageId,
          serviceItemId: bookingData.serviceItemId,
          itineraryDayId: bookingData.itineraryDayId,
          bookingPayload: {
            ...bookingData.rawPayload,
            totalAmount
          }
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }

      setConfirmedBooking(verifyData.booking);
      if (showToast) showToast('Payment successful & booking confirmed!', 'success');
      if (onBookingConfirmed) onBookingConfirmed(verifyData.booking);
    } catch (err) {
      console.error('Payment checkout error:', err);
      setError(err.message || 'Payment processing failed');
      if (showToast) showToast(err.message || 'Payment failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTicketUrl = () => {
    if (!confirmedBooking) return '#';
    const type = bookingData.serviceType.toLowerCase();
    const id = confirmedBooking.bookingId || confirmedBooking.id || confirmedBooking.pnr || confirmedBooking.confirmationNo;
    if (type === 'flight') return `/api/bookings/flight/${id}/ticket`;
    if (type === 'hotel') return `/api/bookings/hotel/${id}/voucher`;
    if (type === 'bus') return `/api/bookings/bus/${id}/ticket`;
    if (type === 'car') return `/api/bookings/car/${id}/voucher`;
    return `/api/bookings/flight/${id}/ticket`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmedBooking ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                ₹
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Razorpay Checkout</h3>
                <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  TEST Mode (Live Simulation)
                </div>
              </div>
            </div>

            {/* Service & Amount Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {bookingData.serviceType}
                  </span>
                  <h4 className="font-semibold text-slate-900 text-sm mt-1">
                    {bookingData.title || `${bookingData.serviceType} Booking`}
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-slate-900">{inr(totalAmount)}</div>
                  <div className="text-[11px] text-slate-500">Taxes & fees included</div>
                </div>
              </div>
              {bookingData.details && (
                <div className="text-xs text-slate-600 border-t border-slate-200/60 pt-2 mt-2">
                  {bookingData.details}
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Payment Mode
            </label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 mb-1 text-blue-600" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 mb-1 text-emerald-600" />
                <span>Card (Test)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'netbanking'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building className="w-4 h-4 mb-1 text-purple-600" />
                <span>NetBanking</span>
              </button>
            </div>

            {/* Method Inputs */}
            {paymentMethod === 'upi' && (
              <div className="mb-5 space-y-2">
                <label className="text-xs font-medium text-slate-600">UPI Virtual Payment Address</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="username@okhdfcbank"
                />
                <p className="text-[11px] text-slate-400">Simulation: Pre-approved test UPI ID</p>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="mb-5 space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">Test Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="4111 2222 3333 4444"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      placeholder="12/28"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength={3}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="mb-5">
                <label className="text-xs font-medium text-slate-600 block mb-1">Select Bank</label>
                <select className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white">
                  <option>HDFC Bank (Test Sandbox)</option>
                  <option>State Bank of India (Test Sandbox)</option>
                  <option>ICICI Bank (Test Sandbox)</option>
                  <option>Axis Bank (Test Sandbox)</option>
                </select>
              </div>
            )}

            {/* Trust and Pay button */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-bit SSL Encrypted • Test Mode Only</span>
            </div>

            <button
              type="button"
              onClick={handlePayNow}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing & Confirming Booking...</span>
                </>
              ) : (
                <>
                  <span>Authorize Test Payment ({inr(totalAmount)})</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Confirmation State */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50 duration-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1">Booking Confirmed!</h3>
            <p className="text-xs text-slate-500 mb-4">
              Payment was verified and reservation confirmed with provider.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-800">{bookingData.serviceType}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-mono font-bold text-blue-600">
                  {confirmedBooking.pnr || confirmedBooking.confirmationNo || confirmedBooking.ticketNo || confirmedBooking.bookingId}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total Paid:</span>
                <span className="font-bold text-emerald-600">{inr(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                  {confirmedBooking.status || 'CONFIRMED'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={getTicketUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>View & Print Official E-Ticket / Voucher</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
