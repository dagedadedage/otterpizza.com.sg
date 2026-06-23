"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  AlertCircle,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminUserRow {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AccessControlPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New user form
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("MANAGER");
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editActive, setEditActive] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/access", {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error("Access denied — Admin only");
        throw new Error("Failed to load users");
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: newEmail,
          name: newName,
          password: newPassword,
          role: newRole,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create user");
      }
      setShowForm(false);
      setNewEmail("");
      setNewName("");
      setNewPassword("");
      setNewRole("MANAGER");
      showSuccess("User created successfully");
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateRole = async (id: number, role: string) => {
    try {
      const res = await fetch(`/api/admin/access/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      setEditingId(null);
      showSuccess("Role updated");
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/access/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      showSuccess(isActive ? "User deactivated" : "User activated");
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/access/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      showSuccess("User deleted");
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-SG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark">Access Control</h2>
          <p className="text-sm text-muted mt-1">
            Manage admin users and permissions
          </p>
        </div>
        {!showForm && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* New User Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-border p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-dark">Add New User</h3>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setShowForm(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Name
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Email
              </label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@otterpizza.com.sg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-warm-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={creating}>
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create User
            </Button>
          </div>
        </form>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-dark">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-semibold text-dark">
                  Email
                </th>
                <th className="text-center px-4 py-3 font-semibold text-dark">
                  Role
                </th>
                <th className="text-center px-4 py-3 font-semibold text-dark">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-dark">
                  Created
                </th>
                <th className="text-center px-4 py-3 font-semibold text-dark">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-warm-white/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-dark">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-muted">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    {editingId === user.id ? (
                      <select
                        value={editRole}
                        onChange={(e) => {
                          setEditRole(e.target.value);
                          handleUpdateRole(user.id, e.target.value);
                        }}
                        className="h-8 rounded border border-border px-2 text-xs"
                      >
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(user.id);
                          setEditRole(user.role);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        }`}
                      >
                        {user.role === "ADMIN" ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <ShieldCheck className="w-3 h-3" />
                        )}
                        {user.role === "ADMIN" ? "Admin" : "Manager"}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        handleToggleActive(user.id, user.isActive)
                      }
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user.id, user.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted"
                  >
                    No admin users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
