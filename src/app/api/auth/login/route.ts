import { authErrorResponse, loginController } from "@/server/controllers/auth.controller";

export async function POST(request: Request) {
  try {
    return await loginController(request);
  } catch (error) {
    return authErrorResponse(error);
  }
}
