import { handleRouteError } from "@/server/api";
import {
  createUserController,
  listUsersController,
} from "@/server/controllers/user.controller";

export async function GET(request: Request) {
  try {
    return await listUsersController(request);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    return await createUserController(request);
  } catch (error) {
    return handleRouteError(error);
  }
}
