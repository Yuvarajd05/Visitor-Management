import { handleRouteError } from "@/server/api";
import {
  createVisitorController,
  listVisitorsController,
} from "@/server/controllers/visitor.controller";

export async function POST(request: Request) {
  try {
    return await createVisitorController(request);
  } catch (error) {
    return handleRouteError(error, { path: "/api/visitors", method: "POST" });
  }
}

export async function GET(request: Request) {
  try {
    return await listVisitorsController(request);
  } catch (error) {
    return handleRouteError(error, { path: "/api/visitors", method: "GET" });
  }
}
