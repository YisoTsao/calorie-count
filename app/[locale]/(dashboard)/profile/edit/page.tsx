import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  if (!user) redirect('/login');

  const defaultValues = {
    name: user.name || undefined,
    height: user.profile?.height || undefined,
    weight: user.profile?.weight || undefined,
    birthDate: user.profile?.dateOfBirth
      ? user.profile.dateOfBirth.toISOString().split('T')[0]
      : undefined,
    gender: user.profile?.gender || undefined,
    activityLevel: user.profile?.activityLevel || undefined,
    bio: user.profile?.bio || undefined,
  };

  return (
    <div className="container max-w-2xl py-8">
      <ProfileEditForm defaultValues={defaultValues} />
    </div>
  );
}
