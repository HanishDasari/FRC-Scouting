import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('admin_token')?.value === 'true';

  if (!isAdmin) {
    redirect('/admin/login');
  }

  return <AdminDashboardClient />;
}
