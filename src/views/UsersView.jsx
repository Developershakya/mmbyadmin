import React, { useState, useMemo } from 'react';
import { Users, UserCheck, ShieldCheck, UserX, Search, Download, Eye, Ban, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/admin/PageHeader.jsx';
import StatCard from '../components/admin/StatCard.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import CustomerDrawer from '../components/admin/CustomerDrawer.jsx';

export default function UsersView({
  users = [],
  onToggleStatus,
  onNavigate
}) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!u.name.toLowerCase().includes(q) &&
            !u.email.toLowerCase().includes(q) &&
            !u.city.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [users, statusFilter, searchQuery]);

  const activeCount = users.filter(u => u.status === 'Active').length;
  const totalSpentAll = users.reduce((sum, u) => sum + (u.totalSpent || 0), 0);

  return (
    <div id="users-page" className="space-y-6">
      <PageHeader
        title="Customers & Registered Travelers"
        subtitle="Manage traveler profiles, contact credentials, past booking history, and loyalty status."
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
            <span>Export User List</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-users-total"
          title="Total Registered Users"
          value={users.length.toString()}
          change="14%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={Users}
          colorScheme="blue"
        />
        <StatCard
          id="stat-users-active"
          title="Active Travelers"
          value={activeCount.toString()}
          change="18%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={UserCheck}
          colorScheme="green"
        />
        <StatCard
          id="stat-users-kyc"
          title="Verified Profiles"
          value="98%"
          change="2%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={ShieldCheck}
          colorScheme="orange"
        />
        <StatCard
          id="stat-users-revenue"
          title="Avg Lifetime Value"
          value={`₹${Math.round(totalSpentAll / (users.length || 1)).toLocaleString('en-IN')}`}
          change="9%"
          isPositive={true}
          comparisonText="vs last 7 days"
          icon={CheckCircle2}
          colorScheme="amber"
        />
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Users</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, city..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Contact Info</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4 text-center">Bookings</th>
              <th className="py-3.5 px-4">Total Spent</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  setDrawerOpen(true);
                }}
                className="hover:bg-slate-50/70 transition-colors cursor-pointer"
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {user.avatar || user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <p className="text-slate-800 font-medium">{user.email}</p>
                  <p className="text-[11px] text-slate-400">{user.phone}</p>
                </td>
                <td className="py-3.5 px-4 text-slate-600">{user.city}</td>
                <td className="py-3.5 px-4 text-center font-bold text-slate-800">{user.bookingsCount}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  ₹{user.totalSpent?.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(user);
                        setDrawerOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 cursor-pointer"
                      title="Inspect Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(user.id)}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        user.status === 'Active'
                          ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Profile Drawer */}
      <CustomerDrawer
        isOpen={drawerOpen}
        customer={selectedUser}
        onClose={() => setDrawerOpen(false)}
        onToggleStatus={onToggleStatus}
      />
    </div>
  );
}
