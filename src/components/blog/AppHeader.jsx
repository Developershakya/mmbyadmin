import React, { useState } from 'react';
import {
  Compass,
  Plane,
  Building2,
  Palmtree,
  Bus,
  Car,
  FileText,
  PhoneCall,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  Search
} from 'lucide-react';

export default function AppHeader({ currentPath = '/blogs', onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Flights', path: '/admin/bookings/flights', icon: Plane },
    { label: 'Hotels', path: '/admin/bookings/hotels', icon: Building2 },
    { label: 'Holidays', path: '/admin/packages', icon: Palmtree },
    { label: 'Buses', path: '/admin/bookings/buses', icon: Bus },
    { label: 'Cabs', path: '/admin/bookings/cabs', icon: Car },
    { label: 'Blog', path: '/blogs', icon: FileText, active: true }
  ];

  const handleNav = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div
            onClick={() => handleNav('/blogs')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            id="site-logo"
          >
            <div className="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight leading-none text-slate-900 flex items-center gap-1">
                <span>Make My</span>
                <span className="text-[#F97316]">Bharat Yatra</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                Travel Beyond Boundaries
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.active || currentPath.startsWith(item.path);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNav(item.path)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-[#F97316] bg-orange-50 font-bold border-b-2 border-[#F97316]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F97316]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full">
              <PhoneCall className="w-3.5 h-3.5 text-[#F97316]" />
              <span>24/7 Helpline: <strong className="text-slate-800">1800-123-YATRA</strong></span>
            </div>

            <button
              type="button"
              onClick={() => handleNav('/admin/blogs')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md"
              id="header-admin-btn"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-orange-400" />
              <span>Admin Portal</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => handleNav('/admin/blogs')}
              className="p-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active || currentPath.startsWith(item.path);
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? 'bg-orange-50 text-[#F97316]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="text-xs text-slate-500 flex items-center gap-2 px-3 py-1">
              <PhoneCall className="w-3.5 h-3.5 text-[#F97316]" />
              <span>24/7 Helpline: 1800-123-YATRA</span>
            </div>
            <button
              type="button"
              onClick={() => handleNav('/admin/blogs')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-xs font-bold"
            >
              <LayoutDashboard className="w-4 h-4 text-orange-400" />
              <span>Go to Admin Panel</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
