import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default async function UserDashboardPage() {
  const token = (await cookies()).get('token')?.value;
  if (!verifyToken(token)) redirect('/login');
  redirect('/my-bookings');
}