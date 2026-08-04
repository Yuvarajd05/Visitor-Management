import {
  apiCreated,
  apiSuccess,
  parseRequestBody,
  parseSearchParams,
  requireApiAdmin,
} from "@/server/api";
import {
  adminResetPassword,
  createUser,
  getUserById,
  listUsers,
  updateUser,
} from "@/server/services/user.service";
import {
  adminResetPasswordSchema,
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  userListQuerySchema,
} from "@/server/validation/user";

export async function listUsersController(request: Request) {
  await requireApiAdmin();
  const query = parseSearchParams(
    userListQuerySchema,
    new URL(request.url).searchParams,
  );
  return apiSuccess(await listUsers(query));
}

export async function createUserController(request: Request) {
  await requireApiAdmin();
  const body = parseRequestBody(createUserSchema, await request.json());
  const user = await createUser(body);
  return apiCreated(user, "User created successfully.");
}

export async function getUserController(params: Promise<{ id: string }>) {
  await requireApiAdmin();
  const { id } = userIdParamSchema.parse(await params);
  return apiSuccess(await getUserById(id));
}

export async function updateUserController(
  request: Request,
  params: Promise<{ id: string }>,
) {
  const actor = await requireApiAdmin();
  const { id } = userIdParamSchema.parse(await params);
  const body = parseRequestBody(updateUserSchema, await request.json());
  const user = await updateUser(id, body, actor.id);
  return apiSuccess(user, "User updated successfully.");
}

export async function resetUserPasswordController(
  request: Request,
  params: Promise<{ id: string }>,
) {
  const actor = await requireApiAdmin();
  const { id } = userIdParamSchema.parse(await params);
  const body = parseRequestBody(
    adminResetPasswordSchema,
    await request.json().catch(() => ({ generatePassword: true })),
  );

  const result = await adminResetPassword(
    id,
    {
      temporaryPassword: body.temporaryPassword,
      generatePassword: body.generatePassword ?? true,
    },
    actor.id,
  );

  return apiSuccess(
    result,
    "Temporary password created. Share it with the user securely, then ask them to change it after login.",
  );
}
