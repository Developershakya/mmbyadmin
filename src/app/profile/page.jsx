import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import ProfilePage from '@/components/profile/ProfilePage.jsx';

export const dynamic = 'force-dynamic';

export default async function UserProfilePage() {
  const token = (await cookies()).get('token')?.value;
  if (!verifyToken(token)) redirect('/login');
  return <ProfilePage />;
}