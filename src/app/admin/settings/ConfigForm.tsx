"use client";
import React, { useEffect, useState } from "react";
import { useAdminApi } from "../use-admin-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { camelToTitle } from "@/lib/utils/commonFunctions";
import { Trash2, Plus } from "lucide-react";

export default function ConfigForm() {
  const adminApiFetch = useAdminApi();
  const [configs, setConfigs] = useState<any[]>([]);
  const [originalConfigs, setOriginalConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApiFetch("/api/admin/config").then(async (res) => {
      if (!res) return;
      const data = await res.json();
      setConfigs(data);
      setOriginalConfigs(data);
      setLoading(false);
    });
  }, []);

  const handleChange = (idx: number, value: any) => {
    setConfigs((prev) => prev.map((c, i) => (i === idx ? { ...c, value } : c)));
  };

  const handleToggle = (idx: number) => {
    setConfigs((prev) => prev.map((c, i) => (i === idx ? { ...c, isActive: !c.isActive } : c)));
  };

  function convertConfigNumbers(config: any) {
    const newConfig = { ...config };
    if (typeof newConfig.value === "object" && newConfig.value !== null) {
      Object.entries(newConfig.value).forEach(([key, val]) => {
        if (typeof val === "string" && val !== "" && !isNaN(Number(val))) {
          newConfig.value[key] = Number(val);
        }
        if (Array.isArray(val)) {
          newConfig.value[key] = val.map(v => (typeof v === "string" && v !== "" && !isNaN(Number(v)) ? Number(v) : v));
        }
      });
    } else if (typeof newConfig.value === "string" && newConfig.value !== "" && !isNaN(Number(newConfig.value))) {
      newConfig.value = Number(newConfig.value);
    }
    return newConfig;
  }

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    let success = true;
    for (const config of configs) {
      const configToSave = convertConfigNumbers(config);
      const res = await adminApiFetch("/api/admin/config", {
        method: "PUT",
        body: JSON.stringify(configToSave),
        headers: { "Content-Type": "application/json" },
      });
      if (!res || !res.ok) success = false;
    }
    if (!success) setError("Failed to save one or more configs");
    setSaving(false);
  };

  const handleDiscard = () => {
    setConfigs(originalConfigs);
    setError(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col py-8 px-6 sticky top-0 h-screen z-20">
        <div className="mb-10 flex items-center gap-2">
          <span className="font-extrabold text-lg tracking-tight">Settings</span>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2 text-sm">
            {configs.map((config, idx) => (
              <li key={config.id}>
                <a
                  href={`#config-${config.id}`}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg font-semibold text-black hover:bg-gray-100 transition-all"
                >
                  {camelToTitle(config.title)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto text-xs text-gray-400">v1.0.0</div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto h-screen">
        {/* Sticky Header */}
        <div className="sticky  z-20 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold text-black tracking-tight">Site Settings</h2>
          <div className="flex gap-2">
            <Button
              className="px-8 py-2 rounded-xl font-bold shadow bg-gray-200 text-black hover:bg-gray-300 transition-all text-base cursor-pointer"
              onClick={handleDiscard}
              disabled={saving || !!error}
              type="button"
              variant="outline"
            >
              Discard Changes
            </Button>
            <Button
              className="px-8 py-2 rounded-xl font-bold shadow bg-black text-white hover:bg-gray-900 transition-all text-base cursor-pointer"
              onClick={handleSaveAll}
              disabled={saving || !!error || JSON.stringify(configs) === JSON.stringify(originalConfigs)}
              type="button"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
        {/* Settings Content */}
        <div className="max-w-full mx-auto w-full py-10 px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="divide-y divide-gray-100">
              {configs.map((config, idx) => (
                <Card key={config.id} className="mb-4" id={`config-${config.id}`}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-bold text-black">{camelToTitle(config.title)}</CardTitle>
                    <Switch
                      checked={config.isActive}
                      onCheckedChange={() => handleToggle(idx)}
                      disabled={saving}
                      className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
                    />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-3">
                      {typeof config.value === "object" && config.value !== null ? (
                        Object.entries(config.value).map(([key, val]) => (
                          <div key={key} className="flex flex-col gap-0.5">
                            <label className="text-xs font-semibold text-gray-700 mb-0.5">{key}</label>
                            {typeof val === "boolean" ? (
                              <Switch
                                checked={val}
                                onCheckedChange={(checked: boolean) => {
                                  handleChange(idx, { ...config.value, [key]: checked });
                                  setError(null);
                                }}
                                disabled={saving}
                                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
                              />
                            ) : Array.isArray(val) ? (
                              <div className="flex flex-wrap gap-1 items-center">
                                {val.map((item: any, arrIdx: number) => (
                                  <div key={arrIdx} className="flex items-center bg-gray-50 rounded-lg">
                                    <Input
                                      className="px-1 py-0.5 border border-gray-300 text-xs bg-white focus:border-black focus:ring-2 focus:ring-black/10  rounded-l-md shadow-sm border-r-0"
                                      value={typeof item === "string" || typeof item === "number" ? item : JSON.stringify(item)}
                                      onChange={e => {
                                        let newItem: any = e.target.value;
                                        const newArr = [...val];
                                        newArr[arrIdx] = newItem;
                                        handleChange(idx, { ...config.value, [key]: newArr });
                                        setError(null);
                                      }}
                                      disabled={saving}
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="cursor-pointer px-2 py-0.5 rounded-md"
                                      onClick={() => {
                                        const newArr = val.filter((_: any, i: number) => i !== arrIdx);
                                        handleChange(idx, { ...config.value, [key]: newArr });
                                        setError(null);
                                      }}
                                      disabled={saving}
                                    ><Trash2 size={16} /></Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="cursor-pointer px-2 py-0.5 rounded-md"
                                  onClick={() => {
                                    const newArr = [...val, ""];
                                    handleChange(idx, { ...config.value, [key]: newArr });
                                    setError(null);
                                  }}
                                  disabled={saving}
                                ><Plus size={16} /> Add New</Button>
                              </div>
                            ) : (
                              <Input
                                className="px-2 py-1 border border-gray-300 text-xs bg-white focus:border-black focus:ring-2 focus:ring-black/10 w-96 rounded-md shadow-sm"
                                value={typeof val === "number" ? String(val) : (typeof val === "string" ? val : JSON.stringify(val))}
                                onChange={e => {
                                  let newVal: any = e.target.value;
                                  // Always store as string for input, convert to number only if valid and not intermediate
                                  handleChange(idx, { ...config.value, [key]: newVal });
                                  setError(null);
                                }}
                                disabled={saving}
                              />
                            )}
                          </div>
                        ))
                      ) : (
                        <Textarea
                          className="w-full font-mono text-xs border border-gray-200 rounded-xl bg-gray-50 focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
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
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {error && <div className="text-xs text-red-500 font-semibold mt-4 text-center">{error}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
