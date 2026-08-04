import { handleRouteError } from "@/server/api";
import {
  createEmployeeController,
  listEmployeesController,
} from "@/server/controllers/employee.controller";

export async function POST(request: Request) {
  try {
    return await createEmployeeController(request);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request: Request) {
  try {
    return await listEmployeesController(request);
  } catch (error) {
    return handleRouteError(error);
  }
}
