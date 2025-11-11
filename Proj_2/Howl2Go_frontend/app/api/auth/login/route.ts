
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const res = await fetch(`${process.env.BACKEND_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    return new Response(JSON.stringify(data), { status: res.status });
  }

  const { accessToken, refreshToken } = data.data;

  // Store tokens in httpOnly cookies
  const cookieStore = await cookies();
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });

  return Response.json({ success: true });
}
