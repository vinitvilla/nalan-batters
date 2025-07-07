"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAdminApi } from "@/app/admin/use-admin-api";

export default function UsersPage() {
  const adminApiFetch = useAdminApi();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminApiFetch("/api/admin/users").then(async (res) => {
      if (res && res.ok) {
        setUsers(await res.json());
      } else {
        setError("Failed to load users");
      }
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
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{displayPhone(user.phone)}</TableCell>
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
