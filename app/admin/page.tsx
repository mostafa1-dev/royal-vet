import { getDashboardData } from '@/app/admin/actions';
import DashboardClient from '@/app/admin/DashboardClient';

// Ensure this page is not statically cached since it shows real-time data
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { waitlist, downloadsCount } = await getDashboardData();
  
  return (
    <div className="min-h-[100dvh] w-full relative z-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      <DashboardClient initialData={waitlist} initialDownloadsCount={downloadsCount} />
    </div>
  );
}
