import React, { useState, useMemo } from 'react';
import { CreditCard, CheckCircle2, Clock, RotateCcw, Search, Download, Eye } from 'lucide-react';
import PageHeader from '../components/admin/PageHeader.jsx';
import StatCard from '../components/admin/StatCard.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import TransactionModal from '../components/admin/TransactionModal.jsx';

export default function PaymentsView({
  transactions = [],
  onRefund,
  onNavigate
}) {
  const [selectedTx, setSelectedTx] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!t.id.toLowerCase().includes(q) &&
            !t.bookingId.toLowerCase().includes(q) &&
            !t.customer?.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [transactions, statusFilter, searchQuery]);

  const totalRevenue = transactions
    .filter(t => t.status === 'Success')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunded = transactions
    .filter(t => t.status === 'Refunded')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div id="payments-page" className="space-y-6">
      <PageHeader
        title="Payments & Financial Transactions"
        subtitle="Track gateway settlement batches, customer payments, Razorpay webhooks, and refunds."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Users & Payments' },
          { label: 'Payments / Transactions' }
        ]}
        onNavigate={onNavigate}
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Settlements</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-pay-gross"
          title="Gross Collected"
          value={`₹${(totalRevenue / 100000).toFixed(2)} Lakhs`}
          change="24%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={CreditCard}
          colorScheme="blue"
        />
        <StatCard
          id="stat-pay-success"
          title="Successful Transactions"
          value={transactions.filter(t => t.status === 'Success').length.toString()}
          change="21%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={CheckCircle2}
          colorScheme="green"
        />
        <StatCard
          id="stat-pay-pending"
          title="Pending Gateways"
          value={transactions.filter(t => t.status === 'Pending').length.toString()}
          change="4%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          id="stat-pay-refund"
          title="Processed Refunds"
          value={`₹${totalRefunded.toLocaleString('en-IN')}`}
          change="2%"
          isPositive={false}
          comparisonText="vs last 7 days"
          icon={RotateCcw}
          colorScheme="red"
        />
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Payments</option>
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tx ID, booking, customer..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
              <th className="py-3.5 px-4">Transaction ID</th>
              <th className="py-3.5 px-4">Booking Ref</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Payment Method</th>
              <th className="py-3.5 px-4">Date & Time</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((t) => (
              <tr
                key={t.id}
                onClick={() => {
                  setSelectedTx(t);
                  setModalOpen(true);
                }}
                className="hover:bg-slate-50/70 transition-colors cursor-pointer"
              >
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.id}</td>
                <td className="py-3.5 px-4 font-mono text-slate-600">{t.bookingId}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">{t.customer?.name}</td>
                <td className="py-3.5 px-4 text-slate-600">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                    {t.method}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500">{t.date}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">₹{t.amount?.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={t.status} />
                </td>
                <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTx(t);
                      setModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 cursor-pointer"
                    title="View Transaction"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TransactionModal
        isOpen={modalOpen}
        transaction={selectedTx}
        onClose={() => setModalOpen(false)}
        onRefund={(tx) => {
          onRefund(tx);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
