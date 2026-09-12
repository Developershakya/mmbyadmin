import React from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, RotateCcw, Download, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

export default function TransactionModal({
  isOpen,
  onClose,
  transaction,
  onRefund
}) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 my-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-slate-900">Payment Transaction Details</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-5 space-y-5">
          {/* Top Amount Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Transacted</span>
              <h2 className="text-2xl font-black tracking-tight text-white mt-0.5">
                ₹{transaction.amount?.toLocaleString('en-IN')}
              </h2>
              <p className="text-xs text-slate-300 mt-1">{transaction.purpose || 'Holiday Booking Payment'}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={transaction.status} />
              <p className="text-[10px] text-slate-400 font-mono mt-1.5">{transaction.date}</p>
            </div>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Transaction ID</span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{transaction.id}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Booking Reference</span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{transaction.bookingId}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Customer</span>
              <p className="font-bold text-slate-800 mt-0.5">{transaction.customer?.name || 'Customer'}</p>
              <p className="text-slate-500 text-[11px]">{transaction.customer?.email}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Payment Gateway</span>
              <p className="font-bold text-slate-800 mt-0.5">{transaction.method}</p>
              <p className="text-slate-500 text-[11px]">{transaction.gatewayRef || 'Razorpay Verified'}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-center gap-2.5 text-xs text-emerald-800">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Payment securely authenticated via 256-bit SSL encryption. Gateway webhook acknowledged.
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          {transaction.status === 'Success' ? (
            <button
              type="button"
              onClick={() => onRefund(transaction)}
              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Initiate Refund
            </button>
          ) : (
            <span className="text-xs text-slate-400">No further action available</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
