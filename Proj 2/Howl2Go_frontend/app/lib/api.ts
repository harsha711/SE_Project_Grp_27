export async function apiFetch(path: string, options: any = {}) {
  const res = await fetch(`/api/proxy?path=${encodeURIComponent(path)}`, {
    ...options
  });

  if (res.status === 401) {
    await fetch("/api/auth/refresh", { method: "POST" });
    return apiFetch(path, options);
  }

  return res;
}
