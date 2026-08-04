import { handleRouteError } from "@/server/api";
import {
  deleteEmployeeController,
  getEmployeeController,
  updateEmployeeController,
} from "@/server/controllers/employee.controller";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    return await getEmployeeController(context.params);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    return await updateEmployeeController(request, context.params);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    return await deleteEmployeeController(context.params);
  } catch (error) {
    return handleRouteError(error);
  }
}
