import { handleRouteError } from "@/server/api";
import { forgotPasswordController } from "@/server/controllers/auth.controller";

export async function POST(request: Request) {
  try {
    return await forgotPasswordController(request);
  } catch (error) {
    return handleRouteError(error, {
      path: "/api/auth/forgot-password",
      method: "POST",
    });
  }
}
