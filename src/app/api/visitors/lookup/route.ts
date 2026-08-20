import { handleRouteError } from "@/server/api";
import { lookupVisitorsByPhoneController } from "@/server/controllers/visitor.controller";

export async function GET(request: Request) {
  try {
    return await lookupVisitorsByPhoneController(request);
  } catch (error) {
    return handleRouteError(error, {
      path: "/api/visitors/lookup",
      method: "GET",
    });
  }
}
