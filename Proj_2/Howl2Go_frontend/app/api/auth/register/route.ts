import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  const res = await fetch(`${process.env.BACKEND_URL}/api/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    return new Response(JSON.stringify(data), { status: res.status });
  }

  const { accessToken, refreshToken } = data.data;

  // Store tokens in httpOnly cookies
  const cookieStore = await cookies();
  cookieStore.set("accessToken", accessToken, { httpOnly: true, secure: true, path: "/" });
  cookieStore.set("refreshToken", refreshToken, { httpOnly: true, secure: true, path: "/" });

  return Response.json({ success: true, user: data.data.user });
}
