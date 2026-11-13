import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function verifyAdmin() {
  try {
    const secret = process.env.SESSION_SECRET;

    if (!secret) {
      return false;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return false;
    }

    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey);

    return payload.role === "admin";
  } catch {
    return false;
  }
}
