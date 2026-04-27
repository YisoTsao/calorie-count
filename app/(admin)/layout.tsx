import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminShell } from '@/components/admin/AdminShell';
import { hasRole } from '@/lib/rbac';
import type { UserRole } from '@/lib/rbac';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const role = (session.user.role ?? 'USER') as UserRole;

  if (!hasRole(role, 'SUPPORT')) {
    redirect('/dashboard');
  }

  return (
    <>
      {/* Blocking script — apply saved admin theme BEFORE first paint to prevent FOUC */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('admin-theme');document.documentElement.setAttribute('data-admin-theme',t==='light'?'light':'dark');}catch(e){}})();`,
        }}
      />
      <AdminShell
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role,
        }}
      >
        {children}
      </AdminShell>
    </>
  );
}
