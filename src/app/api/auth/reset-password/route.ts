import { handleRouteError } from "@/server/api";
import { resetPasswordController } from "@/server/controllers/auth.controller";

export async function POST(request: Request) {
  try {
    return await resetPasswordController(request);
  } catch (error) {
    return handleRouteError(error);
  }
}
