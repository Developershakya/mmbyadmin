import React from 'react';
import {
  LayoutDashboard,
  Plane,
  Bus,
  Hotel,
  Car,
  Package,
  Sliders,
  MapPin,
  FileText,
  Tags,
  Users,
  CreditCard,
  BarChart3,
  Bell,
  Settings as SettingsIcon,
  ChevronDown,
  Compass,
  X,
  Sparkles
} from 'lucide-react';

export default function Sidebar({
  currentPath = '/admin/dashboard',
  onNavigate,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  onOpenLogoutModal,
  unreadNotificationsCount = 3
}) {
  const navSections = [
    {
      items: [
        {
          label: 'Dashboard',
          path: '/admin/dashboard',
          icon: LayoutDashboard
        }
      ]
    },
    {
      title: 'BOOKINGS',
      items: [
        { label: 'Flight Bookings', path: '/admin/bookings/flights', icon: Plane },
        { label: 'Bus Bookings', path: '/admin/bookings/buses', icon: Bus },
        { label: 'Hotel Bookings', path: '/admin/bookings/hotels', icon: Hotel },
        { label: 'Car/Cab Bookings', path: '/admin/bookings/cabs', icon: Car },
        { label: 'Package Bookings', path: '/admin/bookings/packages', icon: Package }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { label: 'Holiday Packages', path: '/admin/packages', icon: Package },
        { label: 'Package Builder', path: '/admin/packages/builder', icon: Sparkles, badge: 'NEW' },
        { label: 'Package Customization', path: '/admin/packages/customization', icon: Sliders },
        { label: 'Destinations', path: '/admin/destinations', icon: MapPin },
        { label: 'Blogs', path: '/admin/blogs', icon: FileText },
        { label: 'Blog Categories', path: '/admin/blog-categories', icon: Tags }
      ]
    },
    {
      title: 'USERS & PAYMENTS',
      items: [
        { label: 'Users / Customers', path: '/admin/users', icon: Users },
        { label: 'Payments / Transactions', path: '/admin/payments', icon: CreditCard },
        { label: 'Reports', path: '/admin/reports', icon: BarChart3 }
      ]
    },
    {
      title: 'OTHER',
      items: [
        {
          label: 'Notifications',
          path: '/admin/notifications',
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null
        },
        { label: 'Settings', path: '/admin/settings', icon: SettingsIcon }
      ]
    }
  ];

  const handleItemClick = (path) => {
    onNavigate(path);
    if (setMobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="admin-sidebar"
        className={`fixed top-0 bottom-0 left-0 w-[250px] bg-[#111827] text-white flex flex-col z-50 transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-[72px] px-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <div
            onClick={() => handleItemClick('/admin/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold leading-tight tracking-tight flex items-center gap-1">
                <span>Make My</span>
                <span className="text-[#F97316]">Bharat Yatra</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight font-medium tracking-wide truncate">
                Travel Beyond Boundaries
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && (
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 tracking-wider">
                  {section.title}
                </div>
              )}

              {section.items.map((item) => {
                const isActive = currentPath === item.path;
                const Icon = item.icon;

                return (
                  <button
                    key={item.path}
                    id={`nav-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    type="button"
                    onClick={() => handleItemClick(item.path)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#F97316] text-white shadow-sm shadow-orange-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white leading-none">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Admin Profile */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <div
            onClick={onOpenLogoutModal}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 ring-1 ring-slate-600 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0">
                AD
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-slate-200 truncate group-hover:text-white">Admin</p>
                <p className="text-[11px] text-slate-400 truncate">admin@mmby.com</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-200 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
}
