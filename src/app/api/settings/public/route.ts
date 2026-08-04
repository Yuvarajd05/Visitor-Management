import { handleRouteError } from "@/server/api";
import { getPublicSettingsController } from "@/server/controllers/settings.controller";

export async function GET() {
  try {
    return await getPublicSettingsController();
  } catch (error) {
    return handleRouteError(error);
  }
}
