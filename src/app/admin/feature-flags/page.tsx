"use client";
import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useAdminApi } from "../use-admin-api";

interface FeatureFlag {
  id: string;
  key: string;
  value: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const adminApiFetch = useAdminApi();

  useEffect(() => {
    async function fetchFlags() {
      const res = await adminApiFetch("/api/admin/feature-flags");
      if (!res) return;
      const data = await res.json();
      setFlags(data);
      setLoading(false);
    }
    fetchFlags();
  }, [adminApiFetch]);

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Feature Flags</h1>
      
      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {flags.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No feature flags found.
          </div>
        ) : (
          flags.map((flag) => (
            <div key={flag.id} className="bg-white border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{flag.key}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  flag.value 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {flag.value ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Created: {new Date(flag.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(flag.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
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
            {flags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No feature flags found.
                </TableCell>
              </TableRow>
            ) : (
              flags.map((flag) => (
                <TableRow key={flag.id}>
                  <TableCell className="font-medium">{flag.key}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      flag.value 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {flag.value ? "Enabled" : "Disabled"}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(flag.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{new Date(flag.updatedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
