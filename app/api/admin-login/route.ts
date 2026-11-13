import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const secret = process.env.SESSION_SECRET;

    if (!adminEmail || !adminPassword || !secret) {
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 },
      );
    }

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const secretKey = new TextEncoder().encode(secret);

    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(secretKey);

    const response = NextResponse.json({ success: true });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 },
    );
  }
}
