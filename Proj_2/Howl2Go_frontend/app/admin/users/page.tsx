"use client";

import { useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import { UserPlus, Trash2, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * Admin Users Management Page
 * - Fetches user list from `/api/admin/users` via the frontend proxy
 * - Allows creating staff users (POST `/api/admin/users/staff`)
 * - Allows updating/deactivating users
 *
 * This page should only be accessible to admin accounts. It uses the frontend
 * proxy so the httpOnly accessToken is forwarded.
 */

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
      );
    });
  }, [users, query, roleFilter]);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const resp = await fetch(
        `/api/proxy?path=${encodeURIComponent("/api/admin/users")}`
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || "Failed to load users");
      setUsers(data.data.users || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function createStaff(e: React.FormEvent) {
    e.preventDefault();
    try {
      const resp = await fetch(
        `/api/proxy?path=${encodeURIComponent("/api/admin/users/staff")}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        }
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || "Failed to create staff");
      setShowAdd(false);
      setNewUser({ name: "", email: "", password: "" });
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg || "Error");
    }
  }

  // Toggle active state: if `activate` is true, set isActive=true, otherwise set false.
  async function toggleActive(id: string, activate: boolean) {
    const confirmMessage = activate
      ? "Activate this user?"
      : "Deactivate this user?";
    if (!confirm(confirmMessage)) return;
    try {
      const resp = await fetch(
        `/api/proxy?path=${encodeURIComponent(`/api/admin/users/${id}`)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: activate }),
        }
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || "Failed to update user");
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg || "Error");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-8">
      <div className="max-w-6xl mx-auto">
        <Header />

        <header className="mb-6 pt-16">
          <h1 className="text-3xl font-bold text-center">Manage Users</h1>
          <p className="text-sm text-center text-[var(--text-subtle)]">
            Manage users and create staff accounts.
          </p>
        </header>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email"
                className="pl-10 pr-3 py-2 rounded border w-full bg-[var(--bg-card)] text-[var(--text)]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-2 px-3 rounded border bg-[var(--bg-card)] text-[var(--text)] w-36 flex-shrink-0 cursor-pointer"
            >
              <option value="all">All roles</option>
              <option value="user">User</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 bg-[var(--orange)] rounded text-[var(--text)] flex items-center gap-2 cursor-pointer"
              onClick={() => setShowAdd(!showAdd)}
            >
              <UserPlus className="h-4 w-4" />
              {showAdd ? "Cancel" : "Add Staff"}
            </button>
          </div>
        </div>

        {showAdd && (
          <form
            onSubmit={createStaff}
            className="mb-6 space-y-3 bg-[var(--bg-card)] border rounded-lg p-4 shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                required
                placeholder="Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="p-2 rounded border w-full bg-[var(--bg)] text-[var(--text)]"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="p-2 rounded border w-full bg-[var(--bg)] text-[var(--text)]"
              />
              <input
                required
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="p-2 rounded border w-full bg-[var(--bg)] text-[var(--text)]"
              />
            </div>

            <div className="flex justify-center py-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--success)] rounded text-[var(--text)] font-semibold cursor-pointer"
              >
                Create Staff
              </button>
            </div>
          </form>
        )}

        {loading && <div>Loading...</div>}
        {error && <div className="text-[var(--error)]">{error}</div>}

        {!loading && !error && (
          <div>
            <div className="overflow-x-auto bg-[var(--bg-card)] border rounded-lg shadow-sm">
              <table className="w-full table-auto">
                <thead className="bg-[var(--bg)]">
                  <tr className="text-left">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Active</th>
                    <th className="p-3">Created</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u: User, idx: number) => {
                    const maybe = u as User & { _id?: string };
                    const uid = maybe.id || maybe._id || "";
                    return (
                      <tr
                        key={uid}
                        className={`${
                          idx % 2 === 0 ? "bg-[transparent]" : "bg-[var(--bg)]"
                        }`}
                      >
                        <td className="p-3 py-4">
                          <div className="font-medium">{u.name}</div>
                          <div className="text-sm text-[var(--text-subtle)]">
                            {u.email}
                          </div>
                        </td>
                        <td className="p-3 hidden sm:table-cell">{u.email}</td>
                        <td className="p-3">{u.role}</td>
                        <td className="p-3">
                          {u.isActive ? (
                            <span className="text-[var(--success)] font-semibold">
                              Yes
                            </span>
                          ) : (
                            <span className="text-[var(--text-subtle)]">
                              No
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {new Date(
                            u.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {
                              // Disable deactivation for admin accounts and for the currently-logged-in user
                            }
                            {(() => {
                              const isAdminAccount = u.role === "admin";
                              const isCurrentUser = currentUser
                                ? currentUser.email === u.email
                                : false;
                              const disabledForDeactivate =
                                isAdminAccount || isCurrentUser;

                              return (
                                <button
                                  title={
                                    u.isActive
                                      ? disabledForDeactivate
                                        ? isCurrentUser
                                          ? "Cannot deactivate yourself"
                                          : "Cannot deactivate an admin account"
                                        : "Deactivate"
                                      : "Activate"
                                  }
                                  className={`px-3 py-1 ${
                                    u.isActive
                                      ? disabledForDeactivate
                                        ? "bg-[var(--bg)] text-[var(--text-subtle)] cursor-not-allowed"
                                        : "bg-[var(--error)] text-white cursor-pointer"
                                      : "bg-[var(--success)] text-white cursor-pointer"
                                  } rounded flex items-center gap-2`}
                                  onClick={() => {
                                    if (u.isActive) {
                                      if (!disabledForDeactivate)
                                        toggleActive(uid, false);
                                    } else {
                                      toggleActive(uid, true);
                                    }
                                  }}
                                  aria-disabled={
                                    u.isActive && disabledForDeactivate
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="hidden sm:inline">
                                    {u.isActive ? "Deactivate" : "Activate"}
                                  </span>
                                </button>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-[var(--text-subtle)]">
                No users matched your criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
