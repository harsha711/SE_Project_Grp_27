// User-related API calls

/**
 * Get current user profile
 */
export async function fetchUserProfile() {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  const data = await response.json();
  return data.data.user;
}

/**
 * Login user
 */
export async function loginUser(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

/**
 * Register new user
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
}
