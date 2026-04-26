import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';

export type UserRole = 'USER' | 'SUPPORT' | 'EDITOR' | 'ADMIN';

/** Role hierarchy: higher = more permissions */
export const ROLE_LEVEL: Record<UserRole, number> = {
  USER: 0,
  SUPPORT: 1,
  EDITOR: 2,
  ADMIN: 3,
};

/** Returns true if userRole meets or exceeds requiredRole */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return (ROLE_LEVEL[userRole] ?? 0) >= ROLE_LEVEL[requiredRole];
}

/** Validates session role for API routes.
 *  Returns a 401/403 NextResponse if the check fails, or null if it passes.
 */
export function checkAdminAccess(
  session: Session | null,
  requiredRole: UserRole = 'SUPPORT'
): NextResponse | null {
  if (!session?.user) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }
  const role = (session.user.role ?? 'USER') as UserRole;
  if (!hasRole(role, requiredRole)) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }
  return null;
}
