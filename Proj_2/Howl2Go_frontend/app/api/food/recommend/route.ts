import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  // Build headers, including auth token if available for preference application
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${process.env.BACKEND_URL}/api/food/recommend`, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    return new Response(JSON.stringify(data), { status: res.status });
  }

  return Response.json(data);
}
