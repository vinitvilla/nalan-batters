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
import { Separator } from "@/components/ui/separator";
import { camelToTitle } from "@/lib/utils/commonFunctions";
import { 
  Trash2, 
  Plus, 
  AlertCircle, 
  Settings2, 
  DollarSign, 
  Clock, 
  Truck, 
  Zap,
  Shield,
  Bell,
  Link,
  MessageSquare,
  Save,
  RotateCcw,
  CheckCircle2,
  Palette
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdditionalChargesForm } from "@/components/AdditionalChargesForm";
import { OperatingHoursForm } from "@/components/OperatingHoursForm";
import { FreeDeliveryForm } from "@/components/FreeDeliveryForm";

interface Config {
  id?: string;
  key: string;
  title?: string;
  value: unknown;
  isActive: boolean;
}

// Helper function to get icon for config
const getConfigIcon = (key: string) => {
  switch (key) {
    case 'additionalCharges':
      return <DollarSign className="w-4 h-4" />;
    case 'operatingHours':
      return <Clock className="w-4 h-4" />;
    case 'freeDelivery':
      return <Truck className="w-4 h-4" />;
    case 'paymentSettings':
      return <Shield className="w-4 h-4" />;
    case 'appSettings':
      return <Zap className="w-4 h-4" />;
    case 'socialMediaLinks':
      return <Link className="w-4 h-4" />;
    case 'contactInfo':
      return <MessageSquare className="w-4 h-4" />;
    case 'orderSettings':
      return <Bell className="w-4 h-4" />;
    default:
      return <Settings2 className="w-4 h-4" />;
  }
};

export default function ConfigForm() {
  const adminApiFetch = useAdminApi();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [originalConfigs, setOriginalConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

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
      // Set first config as active by default
      if (data.length > 0) {
        setActiveSection(data[0].id || '');
      }
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
    if (!success) {
      setError("Failed to save one or more configs");
    } else {
      // Update original configs on successful save
      setOriginalConfigs(configs);
    }
    setSaving(false);
  };

  const handleDiscard = () => {
    setConfigs(originalConfigs);
    setError(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent mx-auto"></div>
        <p className="text-sm text-muted-foreground">Loading configuration...</p>
      </div>
    </div>
  );

  const hasChanges = JSON.stringify(configs) !== JSON.stringify(originalConfigs);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
      {/* Header with Action Buttons */}
      <CardHeader className="border-b flex-shrink-0 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Configuration Management</CardTitle>
              <CardDescription>Manage application configuration and system settings</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700 text-xs">
                Unsaved changes
              </Badge>
            )}
            <Button
              onClick={handleDiscard}
              disabled={saving || !hasChanges}
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Discard
            </Button>
            <Button
              onClick={handleSaveAll}
              disabled={saving || !hasChanges}
              size="sm"
              className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Main Content Area with Fixed Layout */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full px-4 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* Sidebar Navigation - Fixed with independent scroll */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="h-full flex flex-col">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm flex flex-col max-h-full">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <CardTitle className="text-sm font-semibold text-gray-700">Settings</CardTitle>
                    <CardDescription className="text-xs">Select a section</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      <nav className="space-y-1 p-3">
                        {configs.map((config) => (
                          <button
                            key={config.id}
                            onClick={() => {
                              setActiveSection(config.id || '');
                              const element = document.getElementById(`config-${config.id}`);
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }}
                            className={`cursor-pointer w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              activeSection === config.id
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                                : 'text-gray-700 hover:bg-gray-100 hover:scale-102'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {getConfigIcon(config.key || config.title || '')}
                              <span className="truncate">{camelToTitle(config.title || config.key)}</span>
                            </div>
                            <Badge 
                              variant={config.isActive ? "default" : "secondary"}
                              className={activeSection === config.id 
                                ? "bg-white/20 text-white border-white/30" 
                                : ""
                              }
                            >
                              {config.isActive ? "On" : "Off"}
                            </Badge>
                          </button>
                        ))}
                      </nav>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Settings Content - Scrollable independently */}
            <div className="lg:col-span-3 overflow-y-auto h-full">
              <div className="space-y-6 pb-6">
            {error && (
              <Alert variant="destructive" className="shadow-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}
            {configs.map((config, idx) => (
              <Card 
                key={config.id} 
                id={`config-${config.id}`} 
                className="shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden transition-all hover:shadow-xl py-0"
              >
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md text-white">
                          {getConfigIcon(config.key || config.title || '')}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold flex items-center gap-2">
                            {camelToTitle(config.title || config.key)}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            Configure {camelToTitle(config.title || config.key).toLowerCase()} settings
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant={config.isActive ? "default" : "secondary"}
                          className={config.isActive 
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md" 
                            : "bg-gray-200 text-gray-600"
                          }
                        >
                          {config.isActive ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            "Inactive"
                          )}
                        </Badge>
                        <Switch
                          checked={config.isActive}
                          onCheckedChange={() => handleToggle(idx)}
                          disabled={saving}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-orange-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {config.key === 'additionalCharges' || config.title === 'additionalCharges' ? (
                    <AdditionalChargesForm
                      value={config.value as any}
                      onChange={(newValue) => {
                        handleChange(idx, newValue);
                        setError(null);
                      }}
                      disabled={saving}
                    />
                  ) : config.key === 'operatingHours' || config.title === 'operatingHours' ? (
                    <OperatingHoursForm
                      value={config.value as any}
                      onChange={(newValue) => {
                        handleChange(idx, newValue);
                        setError(null);
                      }}
                      disabled={saving}
                    />
                  ) : config.key === 'freeDelivery' || config.title === 'freeDelivery' ? (
                    <FreeDeliveryForm
                      value={config.value as any}
                      onChange={(newValue) => {
                        handleChange(idx, newValue);
                        setError(null);
                      }}
                      disabled={saving}
                    />
                  ) : typeof config.value === "object" && config.value !== null ? (
                    <div className="space-y-4">
                      {getSortedEntries(config.key || config.title || '', config.value).map(([key, val]) => (
                        <div key={key} className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border">
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <div className="w-1 h-4 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          {typeof val === "boolean" ? (
                            <div className="flex items-center gap-3 pl-5">
                              <Switch
                                checked={val}
                                onCheckedChange={(checked: boolean) => {
                                  const currentValue = config.value as Record<string, unknown> | undefined;
                                  handleChange(idx, { ...currentValue, [key]: checked });
                                  setError(null);
                                }}
                                disabled={saving}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-orange-600 cursor-pointer"
                              />
                              <Badge variant={val ? "default" : "secondary"} className={val ? "bg-green-500" : ""}>
                                {val ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                          ) : Array.isArray(val) ? (
                            <div className="space-y-2 pl-5">
                              {val.map((item: string | number | Record<string, unknown>, arrIdx: number) => (
                                <div key={arrIdx} className="flex gap-2">
                                  <Input
                                    className="flex-1 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500"
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
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 cursor-pointer"
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
                                className="w-full border-dashed border-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 cursor-pointer"
                              >
                                <Plus className="w-4 h-4 mr-2" /> Add {key} Item
                              </Button>
                            </div>
                          ) : (
                            <Input
                              className="w-full text-sm pl-5 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
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
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Raw Configuration (JSON)</label>
                      <Textarea
                        className="w-full font-mono text-sm min-h-[120px] bg-gradient-to-br from-gray-50 to-white border-gray-300 focus:border-orange-500 focus:ring-orange-500"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
