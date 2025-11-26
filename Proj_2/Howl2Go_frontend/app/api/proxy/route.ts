import { cookies } from "next/headers";

async function handleRequest(req: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const url = req.url.split("?path=")[1];
  
  // Get cookie header from request to forward session cookies
  const cookieHeader = req.headers.get('Cookie') || '';

  const headers: HeadersInit = {};

  // Forward cookies for session management
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  // Add authorization token if available
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Get request body if present
  let body: BodyInit | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text();
    const contentType = req.headers.get('Content-Type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
  }

  const backendReq = await fetch(`${process.env.BACKEND_URL}${decodeURIComponent(url)}`, {
    method: req.method,
    headers,
    body,
  });

  // Create response and forward Set-Cookie headers for session management
  const responseHeaders = new Headers(backendReq.headers);
  
  // Forward Set-Cookie headers to client
  const setCookieHeaders = backendReq.headers.getSetCookie();
  if (setCookieHeaders.length > 0) {
    responseHeaders.delete('Set-Cookie');
    setCookieHeaders.forEach(cookie => {
      responseHeaders.append('Set-Cookie', cookie);
    });
  }

  const response = new Response(backendReq.body, {
    status: backendReq.status,
    statusText: backendReq.statusText,
    headers: responseHeaders,
  });

  return response;
}

export async function GET(req: Request) {
  return handleRequest(req);
}

export async function POST(req: Request) {
  return handleRequest(req);
}

export async function PATCH(req: Request) {
  return handleRequest(req);
}

export async function PUT(req: Request) {
  return handleRequest(req);
}

export async function DELETE(req: Request) {
  return handleRequest(req);
}
