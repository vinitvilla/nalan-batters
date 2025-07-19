"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { USER_ROLE } from "@/constants/userRole";
import type { UserResponse } from "@/types";

export default function UsersPage() {
  const adminApiFetch = useAdminApi();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleEdits, setRoleEdits] = useState<{ [userId: string]: string }>({});
  const [savingRole, setSavingRole] = useState<string | null>(null);

  useEffect(() => {
    adminApiFetch("/api/admin/users").then(async (res) => {
      if (!res) {
        setError("Failed to fetch users");
        setLoading(false);
        return;
      }
      try {
        const data = await res.json();
        setUsers(data);
        setLoading(false);
      } catch {
        setError("Failed to parse user data");
        setLoading(false);
      }
    }).catch(() => {
      setError("Failed to fetch users");
      setLoading(false);
    });
  }, [adminApiFetch]);

  const filteredUsers = users.filter((user) =>
    (user.fullName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
    (user.phone?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  // Helper to trim +1 from phone and format as Canadian (e.g., 416-857(4974))
  const displayPhone = (phone?: string) => {
    if (!phone) return "N/A";
    let p = phone.startsWith("+1") ? phone.slice(2) : phone;
    p = p.replace(/\D/g, ""); // Remove non-digits
    if (p.length === 10) {
      return `(${p.slice(0,3)}) ${p.slice(3,6)}-${p.slice(6,10)}`;
    }
    return p;
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSavingRole(userId);
    setRoleEdits((prev) => ({ ...prev, [userId]: newRole }));
    const res = await adminApiFetch("/api/admin/users/role", {
      method: "POST",
      body: JSON.stringify({ userId, role: newRole }),
      headers: { "Content-Type": "application/json" },
    });
    if (res && res.ok) {
      setUsers((prev) => prev.map(u => u.id === userId ? { ...u, role: newRole as USER_ROLE } : u));
    }
    setSavingRole(null);
  };

  // --- Render ---
  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <Input
              placeholder="Search users by name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
          
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No users found.
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="bg-white border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-gray-900">
                        {user.fullName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {displayPhone(user.phone)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        ID: {user.id}
                      </p>
                    </div>
                    <div className="ml-4">
                      <Select
                        value={roleEdits[user.id] ?? user.role}
                        onValueChange={val => handleRoleChange(user.id, val)}
                        disabled={savingRole === user.id}
                      >
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(USER_ROLE).map(role => (
                            <SelectItem key={role} value={role} className="text-xs">
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {savingRole === user.id && (
                    <div className="text-xs text-blue-600 animate-pulse">
                      Updating role...
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell>{displayPhone(user.phone)}</TableCell>
                      <TableCell>
                        <Select
                          value={roleEdits[user.id] ?? user.role}
                          onValueChange={val => handleRoleChange(user.id, val)}
                          disabled={savingRole === user.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(USER_ROLE).map(role => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {savingRole === user.id && (
                          <div className="text-xs text-blue-600 mt-1 animate-pulse">
                            Updating...
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 font-mono">{user.id}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
