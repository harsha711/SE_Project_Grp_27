// Authentication utility functions

/**
 * Check if user is authenticated by making a request to /api/auth/me
 * This works server-side and client-side
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include", // Include cookies
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get the current user's profile
 * Returns null if not authenticated
 */
export async function getUserProfile() {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data?.user || null;
  } catch {
    return null;
  }
}

/**
 * Logout the current user
 * Clears tokens and redirects to homepage
 */
export async function logout() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    // Redirect to homepage after logout
    window.location.href = "/";
  } catch (error) {
    console.error("Logout error:", error);
    // Still redirect even if API call fails
    window.location.href = "/";
  }
}

/**
 * Redirect to login with optional return URL
 */
export function redirectToLogin(returnUrl?: string) {
  const url = returnUrl
    ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
    : "/login";

  if (typeof window !== "undefined") {
    window.location.href = url;
  }
}
