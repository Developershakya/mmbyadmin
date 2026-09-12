import React, { useRef, useState } from 'react';
import { X, Printer, Download, Bus, Plane, MapPin, User, Calendar, QrCode, Loader2 } from 'lucide-react';
import { downloadElementAsPdf } from '../../lib/pdfGenerator.js';

export default function TicketModal({
  isOpen,
  onClose,
  booking,
  type = 'bus', // 'bus' | 'flight'
  onDownloadSuccess
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const ticketRef = useRef(null);

  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setIsGeneratingPdf(true);
    try {
      const ticketFileName = `${type.toUpperCase()}-Ticket-${booking.id || 'MMBY'}.pdf`;
      await downloadElementAsPdf(
        ticketRef.current,
        ticketFileName,
        { booking, title: `${type.toUpperCase()} BOARDING PASS & E-TICKET` }
      );
      if (onDownloadSuccess) {
        onDownloadSuccess(`Ticket ${ticketFileName} downloaded successfully as PDF!`);
      }
    } catch (err) {
      console.error('PDF ticket download error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div
      id="ticket-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        id="ticket-modal-content"
        className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 my-6 print:p-0 print:border-none"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
              {type === 'bus' ? 'Bus E-Ticket & Boarding Pass' : 'Flight E-Ticket & Boarding Pass'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 disabled:opacity-60 cursor-pointer shadow-2xs"
            >
              {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div ref={ticketRef} className="pt-4">

        {/* Ticket Body with classic boarding pass styling */}
        <div className="pt-5 space-y-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-[#0F172A] text-white p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Make My Bharat Yatra</p>
                <h3 className="text-base font-bold mt-0.5">
                  {booking.operator || booking.airline || 'Official Transit Partner'}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#F97316] flex items-center justify-center">
                {type === 'bus' ? <Bus className="w-5 h-5" /> : <Plane className="w-5 h-5" />}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Booking ID</span>
                <p className="font-mono font-bold text-white">{booking.id}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase">
                  {type === 'bus' ? 'Seat Number(s)' : 'PNR Number'}
                </span>
                <p className="font-bold text-orange-400">
                  {booking.seatNumbers ? booking.seatNumbers.join(', ') : booking.pnr || booking.seat || 'A1, A2'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] uppercase">Status</span>
                <p className="font-bold text-emerald-400">{booking.status}</p>
              </div>
            </div>
          </div>

          {/* Route & Times */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
            <div className="flex items-center justify-between font-bold text-sm text-slate-900">
              <span>{booking.fromCity || booking.route?.split('→')[0] || 'Origin'}</span>
              <span className="text-slate-400 font-normal">→</span>
              <span>{booking.toCity || booking.route?.split('→')[1] || 'Destination'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-slate-200/60">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Departure</p>
                <p className="font-semibold text-slate-800">{booking.travelDate || '12 Sep 2025'}</p>
                <p className="text-xs text-orange-600 font-medium">{booking.departureTime || '10:30 PM'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Vehicle / Coach</p>
                <p className="font-semibold text-slate-800">{booking.busDetails || booking.flightNo || 'AC Sleeper'}</p>
                <p className="text-xs text-slate-500">{booking.distance || 'Terminal 3'}</p>
              </div>
            </div>
          </div>

          {/* Passenger Info */}
          <div className="border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passenger Details</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                  {booking.customer?.avatar || 'U'}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{booking.customer?.name}</p>
                  <p className="text-slate-500 text-[11px]">{booking.customer?.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px]">Total Paid</p>
                <p className="font-bold text-slate-900 text-sm">₹{booking.amount?.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Simulated QR Code & Barcode */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-orange-400 uppercase">Boarding Verification</p>
              <p className="text-xs text-slate-300 mt-0.5">Scan at terminal counter</p>
              <p className="font-mono text-[11px] text-slate-400 mt-2">||| | | |||| || | ||||| | |||</p>
            </div>
            <div className="w-14 h-14 bg-white p-1 rounded-lg flex items-center justify-center">
              <QrCode className="w-12 h-12 text-slate-900" />
            </div>
          </div>
        </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
