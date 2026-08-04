import {
  apiCreated,
  apiMessage,
  apiSuccess,
  parseRequestBody,
  parseSearchParams,
  requireApiUser,
} from "@/server/api";
import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  listEmployees,
  updateEmployee,
} from "@/server/services/employee.service";
import {
  createEmployeeSchema,
  employeeIdParamSchema,
  employeeListQuerySchema,
  updateEmployeeSchema,
} from "@/server/validation/employee";

export async function listEmployeesController(request: Request) {
  await requireApiUser();
  const query = parseSearchParams(
    employeeListQuerySchema,
    new URL(request.url).searchParams,
  );
  return apiSuccess(await listEmployees(query));
}

export async function createEmployeeController(request: Request) {
  await requireApiUser();
  const body = parseRequestBody(createEmployeeSchema, await request.json());
  const employee = await createEmployee(body);
  return apiCreated(employee, "Employee created successfully.");
}

export async function getEmployeeController(params: Promise<{ id: string }>) {
  await requireApiUser();
  const { id } = employeeIdParamSchema.parse(await params);
  return apiSuccess(await getEmployeeById(id));
}

export async function updateEmployeeController(
  request: Request,
  params: Promise<{ id: string }>,
) {
  await requireApiUser();
  const { id } = employeeIdParamSchema.parse(await params);
  const body = parseRequestBody(updateEmployeeSchema, await request.json());
  const employee = await updateEmployee(id, body);
  return apiSuccess(employee, "Employee updated successfully.");
}

export async function deleteEmployeeController(params: Promise<{ id: string }>) {
  await requireApiUser();
  const { id } = employeeIdParamSchema.parse(await params);
  await deleteEmployee(id);
  return apiMessage("Employee deleted successfully.");
}
