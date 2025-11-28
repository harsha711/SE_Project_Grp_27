import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken");

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Call backend to get user profile
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/users/profile`,
      {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      }
    );

    if (!response.ok) {
      // If token is invalid, clear cookies
      if (response.status === 401) {
        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");
      }

      return NextResponse.json(
        { success: false, message: "Failed to fetch profile" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: data.data.user.id,
          _id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          dailyGoal: data.data.user.preferences?.maxCalories || 2000,
          avatar: data.data.user.avatar,
          role: data.data.user.role || 'user',
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
