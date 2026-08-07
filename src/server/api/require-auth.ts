import { getCurrentUser } from "@/server/auth/session";
import { ForbiddenError, UnauthorizedError } from "@/server/api/errors";
import type { AuthUser } from "@/types/auth";

type RequireApiUserOptions = {
  /** Allow access while a forced password change is pending (change-password only). */
  allowMustChangePassword?: boolean;
};

export async function requireApiUser(
  options: RequireApiUserOptions = {},
): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  if (user.mustChangePassword && !options.allowMustChangePassword) {
    throw new ForbiddenError(
      "You must change your password before continuing.",
    );
  }

  return user;
}

export async function requireApiAdmin(
  options: RequireApiUserOptions = {},
): Promise<AuthUser> {
  const user = await requireApiUser(options);

  if (user.role !== "ADMIN") {
    throw new ForbiddenError("Only administrators can manage users.");
  }

  return user;
}
