import { handleRouteError } from "@/server/api";
import {
  getSettingsController,
  updateSettingsController,
} from "@/server/controllers/settings.controller";

export async function GET() {
  try {
    return await getSettingsController();
  } catch (error) {
    return handleRouteError(error, { path: "/api/settings", method: "GET" });
  }
}

export async function PUT(request: Request) {
  try {
    return await updateSettingsController(request);
  } catch (error) {
    return handleRouteError(error, {
      path: "/api/settings",
      method: "PUT",
    });
  }
}
