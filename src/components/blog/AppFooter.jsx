import React from 'react';
import { Compass, Mail, Phone, MapPin, Heart, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function AppFooter({ onNavigate }) {
  const handleNav = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return (
    <footer className="bg-[#111827] text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div
              onClick={() => handleNav('/blogs')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-9 h-9 rounded-full bg-[#F97316] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
                  <span>Make My</span>
                  <span className="text-[#F97316]">Bharat Yatra</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Travel Beyond Boundaries
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's trusted travel portal curating holiday packages, spiritual yatras, transport bookings, and authentic regional travel guides across every state.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Tour Operator &amp; IATA Accredited</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Explore Bharat
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button type="button" onClick={() => handleNav('/blogs')} className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <span>Travel Stories &amp; Blog</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('/admin/packages')} className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <span>Trending Holiday Packages</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('/blog-category/destinations')} className="hover:text-orange-400 transition-colors">
                  Himachal Pradesh Hidden Gems
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('/blog-category/spiritual')} className="hover:text-orange-400 transition-colors">
                  Vrindavan &amp; Mathura Spiritual Trails
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('/blog-category/food')} className="hover:text-orange-400 transition-colors">
                  Gujarat Food Tour &amp; Thali Guides
                </button>
              </li>
            </ul>
          </div>

          {/* Travel Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Blog Categories
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Destinations', 'Food & Cuisine', 'Spiritual Journey', 'Travel Tips', 'Adventure', 'Culture', 'Stay'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleNav(`/blog-category/${cat.toLowerCase().replace(/[\s&]+/g, '-')}`)}
                  className="text-[11px] px-2.5 py-1 rounded bg-slate-800/80 hover:bg-orange-500 hover:text-white text-slate-300 transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Customer Support
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>Connaught Place, Central Delhi, New Delhi 110001, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Toll Free: 1800-123-YATRA (92872)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>support@makemybharatyatra.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Make My Bharat Yatra Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => handleNav('/admin/dashboard')} className="hover:text-slate-300">
              Admin Portal
            </button>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Indian Travelers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
