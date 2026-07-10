import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { loginSchema } from "@/utils/validation";
import { authenticateUser } from "@/services/auth.service";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { getTokenMaxAge } from "@/lib/auth";
import { getErrorMessage, AppError } from "@/utils/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const credentials = loginSchema.parse(body);
    const { user, token } = await authenticateUser(credentials);

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: getTokenMaxAge(credentials.rememberMe),
    });

    return NextResponse.json({
      message: "Login successful.",
      user,
    });
  } catch (error) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: statusCode },
    );
  }
}
