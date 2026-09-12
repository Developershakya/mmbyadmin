import React, { useRef, useState } from 'react';
import { X, Printer, Download, Compass, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { downloadElementAsPdf } from '../../lib/pdfGenerator.js';

export default function InvoiceModal({
  isOpen,
  onClose,
  booking,
  onDownloadSuccess
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printableAreaRef = useRef(null);

  if (!isOpen || !booking) return null;

  const invoiceNo = `INV-MMBY-${booking.id?.replace(/[^0-9]/g, '') || '20250912'}`;
  const baseFare = booking.basePrice || booking.baseFare || Math.round(booking.amount * 0.82);
  const taxes = booking.taxes || booking.gst || Math.round(booking.amount * 0.18);
  const total = booking.amount || (baseFare + taxes);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadElementAsPdf(
        printableAreaRef.current,
        `Invoice-${invoiceNo}.pdf`,
        { booking, title: `TAX INVOICE #${invoiceNo}` }
      );
      if (onDownloadSuccess) {
        onDownloadSuccess(`Invoice ${invoiceNo}.pdf downloaded successfully!`);
      }
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div
      id="invoice-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        id="invoice-modal-content"
        className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 my-8 print:p-0 print:border-none print:shadow-none"
      >
        {/* Header Actions (hidden on print) */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
              Tax Invoice
            </span>
            <span className="text-xs text-slate-400 font-mono">#{invoiceNo}</span>
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
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div ref={printableAreaRef} className="pt-6 space-y-6 bg-white p-4 rounded-xl">
          {/* Top Brand Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F97316] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <div className="text-lg font-black tracking-tight text-slate-900">
                  Make My <span className="text-[#F97316]">Bharat Yatra</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Travel Beyond Boundaries Pvt. Ltd.</p>
                <p className="text-[11px] text-slate-400">GSTIN: 07AAACM9218P1Z8 • Reg #MBY-2024-IN</p>
              </div>
            </div>

            <div className="sm:text-right text-xs text-slate-500">
              <p className="font-bold text-slate-900">Invoice Date: 12 Sep 2025</p>
              <p>Booking ID: <span className="font-mono font-semibold text-slate-700">{booking.id}</span></p>
              <div className="inline-flex items-center gap-1 mt-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PAYMENT COMPLETED
              </div>
            </div>
          </div>

          {/* Bill To & Travel Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Billed To (Customer)
              </p>
              <p className="font-bold text-slate-900 text-sm">{booking.customer?.name || 'Rahul Sharma'}</p>
              <p className="text-slate-600">{booking.customer?.email || 'rahul@gmail.com'}</p>
              <p className="text-slate-600">{booking.customer?.phone || '+91 98765 43210'}</p>
            </div>

            <div className="sm:text-right">
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Trip Details
              </p>
              <p className="font-bold text-slate-900">
                {booking.packageName || booking.route || 'Holiday Package'}
              </p>
              <p className="text-slate-600">Travel Date: {booking.travelDate || '12 Sep 2025'}</p>
              <p className="text-slate-600">{booking.duration || 'All Included Services'}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-center">Service Type</th>
                  <th className="pb-2 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 font-medium">
                    {booking.packageName || 'Package Base Services (Flight, Hotel, Transport)'}
                  </td>
                  <td className="py-2.5 text-center text-slate-500">Holiday Package</td>
                  <td className="py-2.5 text-right font-semibold">₹{baseFare.toLocaleString('en-IN')}</td>
                </tr>
                {booking.flight && (
                  <tr>
                    <td className="py-2 text-slate-500">Flight: {booking.flight.airline} ({booking.flight.flightNo})</td>
                    <td className="py-2 text-center text-slate-400">Air Travel</td>
                    <td className="py-2 text-right text-slate-500">Included</td>
                  </tr>
                )}
                {booking.hotel && (
                  <tr>
                    <td className="py-2 text-slate-500">Hotel: {booking.hotel.name} ({booking.hotel.room})</td>
                    <td className="py-2 text-center text-slate-400">Hospitality</td>
                    <td className="py-2 text-right text-slate-500">Included</td>
                  </tr>
                )}
                {booking.transfer && (
                  <tr>
                    <td className="py-2 text-slate-500">Transfer: {booking.transfer.type}</td>
                    <td className="py-2 text-center text-slate-400">Cab Transfer</td>
                    <td className="py-2 text-right text-slate-500">Included</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Amount Breakdown */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-xs text-slate-500 max-w-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                This is a computer-generated tax invoice verified under the laws of the Government of India.
              </span>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Fare / Package Price:</span>
                <span className="font-semibold">₹{baseFare.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Applicable GST & Fees:</span>
                <span className="font-semibold">₹{taxes.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Promotional Discount:</span>
                <span className="font-semibold">-₹0</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Amount Paid:</span>
                <span className="text-[#F97316] text-base font-extrabold">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
