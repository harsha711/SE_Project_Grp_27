import { cookies } from "next/headers";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const url = req.url.split("?path=")[1];

  const backendReq = await fetch(`${process.env.BACKEND_URL}${decodeURIComponent(url)}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  return backendReq;
}
