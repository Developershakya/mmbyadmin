'use client';

import React, { useState, useMemo } from 'react';
import {
  Users as UsersIcon,
  Search,
  Download,
  Eye,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader.jsx';
import StatCard from '@/components/admin/StatCard.jsx';
import StatusBadge from '@/components/admin/StatusBadge.jsx';
import CustomerDrawer from '@/components/admin/CustomerDrawer.jsx';

export default function UsersContent({
  users = [],
  onToggleStatus,
  onNavigate
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (statusFilter !== 'ALL' && user.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          user.name?.toLowerCase().includes(q) ||
          user.email?.toLowerCase().includes(q) ||
          user.phone?.toLowerCase().includes(q) ||
          user.id?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, statusFilter, searchQuery]);

  const activeCount = users.filter(u => u.status === 'Active').length;
  const totalBookings = users.reduce((sum, u) => sum + (u.bookingsCount || 0), 0);
  const totalSpent = users.reduce((sum, u) => sum + (u.totalSpent || 0), 0);

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsDrawerOpen(true);
  };

  const handleToggle = (id) => {
    if (onToggleStatus) {
      onToggleStatus(id);
    }
    if (selectedCustomer && selectedCustomer.id === id) {
      setSelectedCustomer(prev => ({
        ...prev,
        status: prev.status === 'Active' ? 'Suspended' : 'Active'
      }));
    }
  };

  return (
    <div id="users-page" className="space-y-6">
      <PageHeader
        title="Customer Directory & Account Access"
        subtitle="Manage verified travel customers, corporate accounts, member tiers, and booking history."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Users & Payments' },
          { label: 'Users / Customers' }
        ]}
        onNavigate={onNavigate}
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export User Base (CSV)</span>
          </button>
        }
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Customers"
          value={users.length}
          icon={UsersIcon}
          trend="+14.2% YoY"
          isPositive={true}
        />
        <StatCard
          title="Active Accounts"
          value={activeCount}
          icon={UserCheck}
          trend="96.5% active"
          isPositive={true}
        />
        <StatCard
          title="Lifetime Bookings"
          value={totalBookings}
          icon={TrendingUp}
          trend="+22 this month"
          isPositive={true}
        />
        <StatCard
          title="Total Gross Spend"
          value={`₹${(totalSpent / 100000).toFixed(1)}L`}
          icon={ShieldCheck}
          trend="Avg ₹18.4k / user"
          isPositive={true}
        />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['ALL', 'Active', 'Suspended'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {status === 'ALL' ? 'All Customers' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Customer</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Tier & Location</th>
                <th className="py-3.5 px-4">Bookings</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center shrink-0">
                          {user.avatar || user.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{user.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/50">
                          {user.tier || 'Standard Member'}
                        </span>
                        {user.city && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{user.city}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {user.bookingsCount || 0} trips
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{(user.totalSpent || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={user.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right pr-6">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleViewCustomer(user)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                          title="View Customer Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(user.id)}
                          className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            user.status === 'Active'
                              ? 'text-rose-500 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={user.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                        >
                          {user.status === 'Active' ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Drawer Modal */}
      <CustomerDrawer
        isOpen={isDrawerOpen}
        customer={selectedCustomer}
        onClose={() => setIsDrawerOpen(false)}
        onToggleStatus={handleToggle}
        onViewBooking={() => {}}
      />
    </div>
  );
}
