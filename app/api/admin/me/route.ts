import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/me
 * Diagnostic endpoint — shows current session and DB user info.
 * Use this to confirm the role is set correctly.
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'not authenticated', session: null });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });

  return NextResponse.json({
    sessionUserId: session.user.id,
    sessionUserRole: session.user.role,
    dbUser,
  });
}
