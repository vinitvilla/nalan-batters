"use client";
import React, { useEffect, useState } from "react";
import { prisma } from "@/lib/prisma";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useAdminApi } from "../use-admin-api";

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const adminApiFetch = useAdminApi();
  const adminApiFetchRef = React.useRef(adminApiFetch);

  useEffect(() => {
    adminApiFetchRef.current = adminApiFetch;
  }, [adminApiFetch]);

  useEffect(() => {
    async function fetchFlags() {
      const res = await adminApiFetchRef.current("/api/admin/feature-flags");
      if (!res) return;
      const data = await res.json();
      setFlags(data);
      setLoading(false);
    }
    fetchFlags();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Feature Flags</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flags.map((flag: any) => (
            <TableRow key={flag.id}>
              <TableCell>{flag.key}</TableCell>
              <TableCell>{flag.value ? "Enabled" : "Disabled"}</TableCell>
              <TableCell>{new Date(flag.createdAt).toLocaleString()}</TableCell>
              <TableCell>{new Date(flag.updatedAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
