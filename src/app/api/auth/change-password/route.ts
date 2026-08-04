import { handleRouteError } from "@/server/api";
import { changePasswordController } from "@/server/controllers/auth.controller";

export async function POST(request: Request) {
  try {
    return await changePasswordController(request);
  } catch (error) {
    return handleRouteError(error);
  }
}
