import { handleRouteError } from "@/server/api";
import { testEmailController } from "@/server/controllers/settings.controller";

export async function POST(request: Request) {
  try {
    return await testEmailController(request);
  } catch (error) {
    return handleRouteError(error, {
      path: "/api/settings/test-email",
      method: "POST",
    });
  }
}
