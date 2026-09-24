import { redirect } from 'next/navigation';

export default async function PackageRedirectPage({ params }) {
  const resolvedParams = await params;
  redirect(`/admin/packages/builder?id=${encodeURIComponent(resolvedParams.id)}`);
}
