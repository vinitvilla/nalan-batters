"use client";
import React, { useEffect, useState } from "react";
import { useAdminApi } from "../use-admin-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { camelToTitle } from "@/lib/utils/commonFunctions";
import { Trash2, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdditionalChargesForm } from "@/components/AdditionalChargesForm";

interface Config {
  id?: string;
  key: string;
  title?: string;
  value: unknown;
  isActive: boolean;
}

export default function ConfigForm() {
  const adminApiFetch = useAdminApi();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [originalConfigs, setOriginalConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Helper function to sort object entries by day of week if applicable
  const getSortedEntries = (configKey: string, value: unknown): [string, unknown][] => {
    if (typeof value !== "object" || value === null) {
      return [];
    }
    
    const entries = Object.entries(value);
    
    // Check if this is the freeDelivery config (contains day names)
    if (configKey === 'freeDelivery' || configKey === 'operatingHours') {
      const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const isDayConfig = entries.some(([key]) => daysOrder.includes(key));
      
      if (isDayConfig) {
        return entries.sort(([keyA], [keyB]) => {
          const indexA = daysOrder.indexOf(keyA);
          const indexB = daysOrder.indexOf(keyB);
          // Put days in order, keep non-day keys at the end
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      }
    }
    
    return entries;
  };

  useEffect(() => {
    adminApiFetch("/api/admin/config").then(async (res) => {
      if (!res) return;
      const data = await res.json();
      setConfigs(data);
      setOriginalConfigs(data);
      setLoading(false);
    });
  }, [adminApiFetch]);

  const handleChange = (idx: number, value: unknown) => {
    setConfigs((prev) => prev.map((c, i) => (i === idx ? { ...c, value } : c)));
  };

  const handleToggle = (idx: number) => {
    setConfigs((prev) => prev.map((c, i) => (i === idx ? { ...c, isActive: !c.isActive } : c)));
  };

  function convertConfigNumbers(config: Config): Config {
    const newConfig = { ...config };
    if (typeof newConfig.value === "object" && newConfig.value !== null && !Array.isArray(newConfig.value)) {
      const objValue = newConfig.value as Record<string, unknown>;
      Object.entries(objValue).forEach(([key, val]) => {
        if (typeof val === "string" && val !== "" && !isNaN(Number(val))) {
          objValue[key] = Number(val);
        }
        if (Array.isArray(val)) {
          objValue[key] = val.map(v => (typeof v === "string" && v !== "" && !isNaN(Number(v)) ? Number(v) : v));
        }
      });
      newConfig.value = objValue;
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

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center py-12">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="font-semibold">Error Loading Settings</div>
          <div className="text-sm">{error}</div>
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Mobile/Tablet Navigation */}
      <div className="lg:hidden border-b bg-muted/30">
        <div className="p-4">
          <Select onValueChange={(value) => {
            const element = document.getElementById(value);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }}>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select a setting..." />
            </SelectTrigger>
            <SelectContent>
              {configs.map((config) => (
                <SelectItem key={config.id} value={`config-${config.id}`}>
                  {camelToTitle(config.title || config.key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop Sidebar - Made Sticky */}
      <aside className="hidden lg:block w-72 bg-muted/30 border-r flex-shrink-0 sticky top-0 h-screen overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-bold text-lg">Configuration</h3>
            <p className="text-sm text-muted-foreground">Select settings to configure</p>
          </div>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <nav className="space-y-1">
              {configs.map((config) => (
                <a
                  key={config.id}
                  href={`#config-${config.id}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-background hover:shadow-sm transition-all border border-transparent hover:border-border group cursor-pointer"
                >
                  <span className="group-hover:text-orange-600 transition-colors">
                    {camelToTitle(config.title || config.key)}
                  </span>
                  <Badge variant={config.isActive ? "default" : "secondary"} className="ml-2">
                    {config.isActive ? "Active" : "Inactive"}
                  </Badge>
                </a>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Sticky Action Bar */}
        <div className="sticky top-0 z-10 bg-background border-b px-4 lg:px-8 py-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-bold">System Configuration</h2>
              <p className="text-sm text-muted-foreground">Modify application settings and preferences</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDiscard}
                disabled={saving || !!error}
                variant="outline"
                size="sm"
                className="text-xs lg:text-sm cursor-pointer"
              >
                Discard Changes
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={saving || !!error || JSON.stringify(configs) === JSON.stringify(originalConfigs)}
                size="sm"
                className="text-xs lg:text-sm text-white border-0 cursor-pointer"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 lg:p-8 space-y-6">
            {configs.map((config, idx) => (
              <Card key={config.id} id={`config-${config.id}`} className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        {camelToTitle(config.title || config.key)}
                        <Badge variant={config.isActive ? "default" : "secondary"}>
                          {config.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Configure {camelToTitle(config.title || config.key).toLowerCase()} settings
                      </CardDescription>
                    </div>
                    <Switch
                      checked={config.isActive}
                      onCheckedChange={() => handleToggle(idx)}
                      disabled={saving}
                      className="data-[state=checked]:bg-orange-500 cursor-pointer"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.key === 'additionalCharges' || config.title === 'additionalCharges' ? (
                    // Special beautiful form for Additional Charges
                    <AdditionalChargesForm
                      value={config.value as any}
                      onChange={(newValue) => {
                        handleChange(idx, newValue);
                        setError(null);
                      }}
                      disabled={saving}
                    />
                  ) : typeof config.value === "object" && config.value !== null ? (
                    getSortedEntries(config.key || config.title || '', config.value).map(([key, val]) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-semibold capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        {typeof val === "boolean" ? (
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={val}
                              onCheckedChange={(checked: boolean) => {
                                const currentValue = config.value as Record<string, unknown> | undefined;
                                handleChange(idx, { ...currentValue, [key]: checked });
                                setError(null);
                              }}
                              disabled={saving}
                              className="data-[state=checked]:bg-orange-500 cursor-pointer"
                            />
                            <Badge variant={val ? "default" : "secondary"}>
                              {val ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        ) : Array.isArray(val) ? (
                          <div className="space-y-2">
                            {val.map((item: string | number | Record<string, unknown>, arrIdx: number) => (
                              <div key={arrIdx} className="flex gap-2">
                                <Input
                                  className="flex-1 text-sm"
                                  value={typeof item === "string" || typeof item === "number" ? item : JSON.stringify(item)}
                                  onChange={e => {
                                    const newArr = [...val];
                                    newArr[arrIdx] = e.target.value;
                                    const valueObj = config.value && typeof config.value === 'object' ? config.value as Record<string, unknown> : {};
                                    handleChange(idx, { ...valueObj, [key]: newArr });
                                    setError(null);
                                  }}
                                  disabled={saving}
                                  placeholder={`${key} item ${arrIdx + 1}`}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newArr = val.filter((_: string | number | Record<string, unknown>, i: number) => i !== arrIdx);
                                    const valueObj = config.value && typeof config.value === 'object' ? config.value as Record<string, unknown> : {};
                                    handleChange(idx, { ...valueObj, [key]: newArr });
                                    setError(null);
                                  }}
                                  disabled={saving}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newArr = [...val, ""];
                                const valueObj = config.value && typeof config.value === 'object' ? config.value as Record<string, unknown> : {};
                                handleChange(idx, { ...valueObj, [key]: newArr });
                                setError(null);
                              }}
                              disabled={saving}
                              className="w-full sm:w-auto hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 cursor-pointer"
                            >
                              <Plus className="w-4 h-4 mr-2" /> Add {key} Item
                            </Button>
                          </div>
                        ) : (
                          <Input
                            className="w-full text-sm focus:ring-orange-500 focus:border-orange-500"
                            value={typeof val === "number" ? String(val) : (typeof val === "string" ? val : JSON.stringify(val))}
                            onChange={e => {
                              const valueObj = config.value && typeof config.value === 'object' ? config.value as Record<string, unknown> : {};
                              handleChange(idx, { ...valueObj, [key]: e.target.value });
                              setError(null);
                            }}
                            disabled={saving}
                            placeholder={`Enter ${key}`}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Raw Configuration (JSON)</label>
                      <Textarea
                        className="w-full font-mono text-sm min-h-[120px] bg-muted/30 focus:ring-orange-500 focus:border-orange-500"
                        value={JSON.stringify(config.value, null, 2)}
                        onChange={e => {
                          try {
                            handleChange(idx, JSON.parse(e.target.value));
                            setError(null);
                          } catch {
                            setError("Invalid JSON format");
                          }
                        }}
                        disabled={saving}
                        placeholder="Enter valid JSON configuration"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
