import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings as SettingsIcon,
  LogOut,
  CheckCheck,
  Package,
  CreditCard,
  Bus,
  Menu,
  X
} from 'lucide-react';

export default function TopNavbar({
  onNavigate,
  onOpenLogoutModal,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  allMockData = {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search filter across bookings, customers, packages
  const searchResults = React.useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return null;
    const q = searchQuery.toLowerCase().trim();

    const packages = (allMockData.packages || []).filter(
      p => p.name.toLowerCase().includes(q) || p.destination.toLowerCase().includes(q)
    ).slice(0, 3);

    const packageBookings = (allMockData.packageBookings || []).filter(
      b => b.customer.name.toLowerCase().includes(q) ||
           b.id.toLowerCase().includes(q) ||
           b.packageName.toLowerCase().includes(q)
    ).slice(0, 3);

    const busBookings = (allMockData.busBookings || []).filter(
      b => b.customer.name.toLowerCase().includes(q) ||
           b.id.toLowerCase().includes(q) ||
           b.route.toLowerCase().includes(q)
    ).slice(0, 3);

    const users = (allMockData.users || []).filter(
      u => u.name.toLowerCase().includes(q) ||
           u.email.toLowerCase().includes(q) ||
           u.city.toLowerCase().includes(q)
    ).slice(0, 3);

    const totalCount = packages.length + packageBookings.length + busBookings.length + users.length;
    return { packages, packageBookings, busBookings, users, totalCount };
  }, [searchQuery, allMockData]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-[72px] bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          id="mobile-sidebar-toggle-btn"
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle navigation sidebar"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Global Search Box */}
        <div ref={searchRef} className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search bookings, users, packages, destinations..."
              className="w-full h-10.5 pl-10 pr-4 rounded-xl bg-slate-50/70 border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-3 text-slate-400 hover:text-slate-600 text-xs font-semibold px-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults && (
            <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 px-2 z-50 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between px-3 pb-2 mb-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>Matching Results ({searchResults.totalCount})</span>
                <span className="text-[11px] lowercase font-normal text-slate-400">press esc to close</span>
              </div>

              {searchResults.totalCount === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No matches found for <span className="font-semibold text-slate-800">"{searchQuery}"</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Customers / Users */}
                  {searchResults.users.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase px-3 py-1">Users & Customers</div>
                      {searchResults.users.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setShowSearchResults(false);
                            onNavigate('/admin/users');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-orange-50/70 rounded-xl flex items-center justify-between group cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">
                              {user.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 group-hover:text-orange-600">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.email} • {user.city}</p>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-slate-400 group-hover:text-orange-600">View Customer →</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Package Bookings */}
                  {searchResults.packageBookings.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase px-3 py-1">Package Bookings</div>
                      {searchResults.packageBookings.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setShowSearchResults(false);
                            onNavigate('/admin/bookings/packages');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-orange-50/70 rounded-xl flex items-center justify-between group cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-orange-600">{b.packageName}</p>
                            <p className="text-xs text-slate-500">{b.id} • {b.customer.name} • ₹{b.amount.toLocaleString('en-IN')}</p>
                          </div>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{b.status}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Packages */}
                  {searchResults.packages.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase px-3 py-1">Packages</div>
                      {searchResults.packages.map((pkg) => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => {
                            setShowSearchResults(false);
                            onNavigate('/admin/packages');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-orange-50/70 rounded-xl flex items-center justify-between group cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-orange-600">{pkg.name}</p>
                            <p className="text-xs text-slate-500">{pkg.destination} • {pkg.duration} • ₹{pkg.price.toLocaleString('en-IN')}</p>
                          </div>
                          <span className="text-xs font-medium text-orange-600">View →</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Notifications & Admin Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            id="topbar-notifications-btn"
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 relative transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => onMarkAllNotificationsRead && onMarkAllNotificationsRead()}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No new notifications right now
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (onMarkNotificationRead) onMarkNotificationRead(notif.id);
                        if (notif.category === 'Bookings') onNavigate('/admin/bookings/packages');
                        else if (notif.category === 'Payments') onNavigate('/admin/payments');
                        else if (notif.category === 'Packages') onNavigate('/admin/packages/customization');
                        setShowNotifications(false);
                      }}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                        !notif.read ? 'bg-orange-50/40' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                        {notif.category === 'Bookings' ? (
                          <Package className="w-4 h-4" />
                        ) : notif.category === 'Payments' ? (
                          <CreditCard className="w-4 h-4" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs ${!notif.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 px-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('/admin/notifications');
                  }}
                  className="w-full py-1.5 text-center text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            id="topbar-admin-profile-btn"
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
            aria-label="Admin Profile Menu"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Admin avatar"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-500/20"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </div>

            <div className="hidden md:block text-left">
              <div className="text-sm font-bold text-slate-900 leading-tight">Admin</div>
              <div className="text-[11px] font-medium text-slate-500 leading-tight">Super Admin</div>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {/* Profile Popover Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">Make My Bharat Yatra</p>
                <p className="text-xs text-slate-500 truncate">admin@mmby.com</p>
              </div>

              <div className="p-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('/admin/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('/admin/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors cursor-pointer"
                >
                  <SettingsIcon className="w-4 h-4" />
                  Account Settings
                </button>
              </div>

              <div className="p-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenLogoutModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
