"use client";
import React, { useEffect, useState } from "react";
import { useAdminApi } from "../use-admin-api";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ConfigForm() {
  const adminApiFetch = useAdminApi();
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApiFetch("/api/admin/config").then(async (res) => {
      if (!res) return;
      const data = await res.json();
      setConfigs(data);
      setLoading(false);
    });
  }, []);

  const handleChange = (idx: number, value: any) => {
    setConfigs((prev) => prev.map((c, i) => (i === idx ? { ...c, value } : c)));
  };

  const handleToggle = (idx: number) => {
    setConfigs((prev) => prev.map((c, i) => (i === idx ? { ...c, isActive: !c.isActive } : c)));
  };

  const handleSave = async (config: any) => {
    setSaving(true);
    setError(null);
    const res = await adminApiFetch("/api/admin/config", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" },
    });
    if (!res || !res.ok) setError("Failed to save");
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {configs.map((config, idx) => (
        <Card key={config.id} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="font-semibold text-base">{config.title}</Label>
            <Button
              variant={config.isActive ? "default" : "outline"}
              className={`text-xs px-3 py-1 ${config.isActive ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"}`}
              onClick={() => handleToggle(idx)}
              disabled={saving}
              type="button"
            >
              {config.isActive ? "Active" : "Inactive"}
            </Button>
          </div>
          <Textarea
            className="w-full font-mono text-sm"
            rows={4}
            value={JSON.stringify(config.value, null, 2)}
            onChange={e => {
              try {
                handleChange(idx, JSON.parse(e.target.value));
                setError(null);
              } catch {
                setError("Invalid JSON");
              }
            }}
            disabled={saving}
          />
          <Button
            className="mt-2"
            onClick={() => handleSave(config)}
            disabled={saving || !!error}
            type="button"
          >
            Save
          </Button>
        </Card>
      ))}
    </div>
  );
}
