/**
 * Proxy route for the frontend.
 *
 * This server-side route forwards frontend requests to the backend API and
 * attaches the httpOnly `accessToken` cookie as an `Authorization: Bearer <token>`
 * header so backend authentication middleware can populate `req.user`.
 * It supports GET/POST/PUT/PATCH/DELETE and forwards request bodies and headers.
 *
 * @author Ahmed Hassan
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function handler(req: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    if (!path) {
      return NextResponse.json(
        { success: false, message: "Missing path parameter" },
        { status: 400 }
      );
    }

    const backendUrl = `${process.env.BACKEND_URL}${path}`;

    const headers = new Headers();
    if (req.headers.get("content-type")) {
      headers.set("content-type", req.headers.get("content-type")!);
    }
    if (accessToken) {
      headers.set("authorization", `Bearer ${accessToken}`);
    }

    const backendResp = await fetch(backendUrl, {
      method: req.method,
      headers,
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : await req.arrayBuffer(),
    });

    const respHeaders = new Headers(backendResp.headers);
    respHeaders.delete("transfer-encoding");

    const body = await backendResp.arrayBuffer();

    return new NextResponse(body, {
      status: backendResp.status,
      headers: respHeaders,
    });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Proxy failed" },
      { status: 500 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
