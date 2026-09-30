import MyBookingsDashboard from '@/components/my-bookings/MyBookingsDashboard.jsx';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';

export default async function MyBookingsPage() {
  const token = (await cookies()).get('token')?.value;
  if (!verifyToken(token)) redirect('/login');
  return <MyBookingsDashboard />;
}
