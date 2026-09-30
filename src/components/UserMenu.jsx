import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import useAuth from '../lib/useAuth';

export default function UserMenu() {
  const router = useRouter();
  const user = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setIsOpen(false);
      router.replace('/login');
      router.refresh();
    }
  }

  if (user === undefined) {
    return null;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition"
      >
        Login / Signup
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-gray-700 transition hover:bg-orange-50"
      >
        <span className="max-w-[150px] truncate">Hi, {user.name || user.email?.split('@')[0] || 'User'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div role="menu" className="absolute right-0 top-full z-[70] mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <Link role="menuitem" href="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50">Dashboard</Link>
          <Link role="menuitem" href="/profile" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50">Profile</Link>
          <Link role="menuitem" href="/my-bookings" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50">My Bookings</Link>
          <div className="my-1 border-t border-gray-100" />
          <button type="button" role="menuitem" onClick={handleLogout} className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-orange-50">Logout</button>
        </div>
      )}
    </div>
  );
}