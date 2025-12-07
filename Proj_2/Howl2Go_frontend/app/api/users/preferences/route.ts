/**
 * User preferences API route
 * Proxies GET/PATCH requests to the backend /api/users/preferences endpoint
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

async function handler(req: Request) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        const headers: HeadersInit = {
            Authorization: `Bearer ${accessToken}`,
        };

        let body: string | undefined;
        if (req.method === "PATCH") {
            headers["Content-Type"] = "application/json";
            body = await req.text();
        }

        const backendResp = await fetch(`${BACKEND_URL}/api/users/preferences`, {
            method: req.method,
            headers,
            body,
        });

        const data = await backendResp.json();

        return NextResponse.json(data, { status: backendResp.status });
    } catch (error) {
        console.error("Preferences API error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to process request" },
            { status: 500 }
        );
    }
}

export const GET = handler;
export const PATCH = handler;
