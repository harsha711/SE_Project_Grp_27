export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(`${process.env.BACKEND_URL}/api/food/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    return new Response(JSON.stringify(data), { status: res.status });
  }

  return Response.json(data);
}
