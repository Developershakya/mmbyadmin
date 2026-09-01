import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuth from '../lib/useAuth';

export default function UserMenu() {
  const router = useRouter();
  const user = useAuth();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
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
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-gray-700">
        Hi, {user.name || user.email.split('@')[0]}
      </span>
      <button
        onClick={handleLogout}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm px-4 py-2 rounded-lg transition"
      >
        Logout
      </button>
    </div>
  );
}