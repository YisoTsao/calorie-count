import { redirect } from '@/i18n/navigation';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
