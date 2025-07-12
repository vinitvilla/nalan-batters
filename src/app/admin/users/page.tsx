"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { USER_ROLE } from "@/constants/userRole";

export default function UsersPage() {
  const adminApiFetch = useAdminApi();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleEdits, setRoleEdits] = useState<{ [userId: string]: string }>({});
  const [savingRole, setSavingRole] = useState<string | null>(null);

  useEffect(() => {
    adminApiFetch("/api/admin/users").then(async (res) => {
      if (!res) return;
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    user.phone.toLowerCase().includes(search.toLowerCase())
  );

  // Helper to trim +1 from phone and format as Canadian (e.g., 416-857(4974))
  const displayPhone = (phone: string) => {
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
      setUsers((prev) => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
    setSavingRole(null);
  };

  // --- Render ---
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
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
          <div className="overflow-x-auto">
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
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.fullName}</TableCell>
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
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{user.id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
