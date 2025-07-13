"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

// Dummy fetch function, replace with your actual admin API hook
const useAdminApi = () => async (url: string, options?: any) => {
  // Replace with actual fetch logic
  return fetch(url, options);
};

export default function PromoCodesPage() {
  const adminApiFetch = useAdminApi();
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [newPromo, setNewPromo] = useState<{
    code: string;
    discount: number;
    discountType: string;
    isActive: boolean;
    isDeleted: boolean;
    description: string;
    expiresAt: string | null;
  }>({
    code: "",
    discount: 0,
    discountType: "PERCENTAGE",
    isActive: true,
    isDeleted: false,
    description: "",
    expiresAt: null,
  });
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminApiFetch("/api/admin/promoCodes").then(async (res) => {
      if (!res) return;
      const data = await res.json();
      setPromoCodes(data);
      setLoading(false);
    });
  }, []);

  const handleChange = (idx: number, field: string, value: any) => {
    setPromoCodes((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  };

  const handleToggle = (idx: number) => {
    setPromoCodes((prev) => prev.map((c, i) => (i === idx ? { ...c, isActive: !c.isActive } : c)));
  };

  const handleSave = async (idx: number) => {
    setSaving(true);
    setError(null);
    const promo = promoCodes[idx];
    const res = await adminApiFetch("/api/admin/promoCodes", {
      method: "PUT",
      body: JSON.stringify(promo),
      headers: { "Content-Type": "application/json" },
    });
    if (!res || !res.ok) setError("Failed to save promo code");
    setSaving(false);
  };

  const handleDialogAdd = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await adminApiFetch("/api/admin/promoCodes", {
        method: "POST",
        body: JSON.stringify(newPromo),
        headers: { "Content-Type": "application/json" },
      });
      if (!res || !res.ok) throw new Error("Failed to add promo code");
      const created = await res.json();
      setPromoCodes((prev) => [...prev, created]);
      setNewPromo({
        code: "",
        discount: 0,
        discountType: "PERCENTAGE",
        isActive: true,
        isDeleted: false,
        description: "",
        expiresAt: null,
      });
      setShowDialog(false);
    } catch (err) {
      setError("Failed to add promo code");
    }
    setSaving(false);
  };

  const handleDelete = (idx: number) => {
    setPromoCodes((prev) => prev.filter((_, i) => i !== idx));
    // Optionally, call API to delete promo code
  };

  const filteredPromoCodes = promoCodes.filter((promo) =>
    promo.code.toLowerCase().includes(search.toLowerCase()) ||
    promo.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="mx-auto py-10 px-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Promo Codes</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Promo Code Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <Input
                placeholder="Search promo codes by code or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="max-w-xs"
              />
              <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                <AlertDialogTrigger asChild>
                  <Button className="flex items-center gap-2 px-4 py-2 font-bold bg-black text-white rounded-xl">
                    <Plus size={18} /> Add Promo Code
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Add Promo Code</AlertDialogTitle>
                  </AlertDialogHeader>
                  <div className="flex flex-col gap-3 mt-2">
                    <Input
                      className="w-48"
                      placeholder="Promo Code"
                      value={newPromo.code}
                      onChange={e => setNewPromo({ ...newPromo, code: e.target.value })}
                      disabled={saving}
                    />
                    <div className="flex gap-2">
                      <Input
                        className="w-32"
                        type="number"
                        placeholder={newPromo.discountType === "PERCENTAGE" ? "Discount (%)" : "Discount Value"}
                        value={newPromo.discount}
                        onChange={e => setNewPromo({ ...newPromo, discount: Number(e.target.value) })}
                        disabled={saving}
                      />
                      <Select
                        value={newPromo.discountType}
                        onValueChange={val => setNewPromo({ ...newPromo, discountType: val })}
                        disabled={saving}
                      >
                        <SelectTrigger className="w-32 border border-gray-300 rounded-md px-2 py-1 text-xs bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                          <SelectItem value="VALUE">Value</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      className="w-full"
                      placeholder="Description"
                      value={newPromo.description}
                      onChange={e => setNewPromo({ ...newPromo, description: e.target.value })}
                      disabled={saving}
                    />
                    <Input
                      className="w-48"
                      type="date"
                      placeholder="Expires At"
                      value={typeof newPromo.expiresAt === "string" ? newPromo.expiresAt.split("T")[0] : ""}
                      onChange={e => setNewPromo({ ...newPromo, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                      disabled={saving}
                    />
                    <Switch
                      checked={newPromo.isActive}
                      onCheckedChange={val => setNewPromo({ ...newPromo, isActive: val })}
                      disabled={saving}
                    />
                  </div>
                  <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel asChild>
                      <Button variant="outline">Cancel</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button onClick={handleDialogAdd} disabled={saving} className="bg-black text-white">Add</Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Expires At</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromoCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500">No promo codes found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredPromoCodes.map((promo, idx) => (
                      <TableRow key={promo.id || idx} className="border-t">
                        <TableCell>{promo.code}</TableCell>
                        <TableCell>{promo.discount}</TableCell>
                        <TableCell>{promo.discountType}</TableCell>
                        <TableCell>{promo.description}</TableCell>
                        <TableCell>{promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : ""}</TableCell>
                        <TableCell>
                          <Switch
                            checked={promo.isActive}
                            onCheckedChange={() => handleToggle(idx)}
                            disabled={saving}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer px-2 py-0.5 rounded-md"
                            onClick={() => handleSave(idx)}
                            disabled={saving}
                          >Save</Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer px-2 py-0.5 rounded-md text-red-500 ml-2"
                                onClick={() => setDeleteIdx(idx)}
                                disabled={saving}
                              ><Trash2 size={16} /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Promo Code?</AlertDialogTitle>
                              </AlertDialogHeader>
                              <div className="text-sm">Are you sure you want to delete this promo code? This action cannot be undone.</div>
                              <AlertDialogFooter>
                                <AlertDialogCancel asChild>
                                  <Button variant="outline">Cancel</Button>
                                </AlertDialogCancel>
                                <AlertDialogAction asChild>
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      if (deleteIdx !== null) handleDelete(deleteIdx);
                                      setDeleteIdx(null);
                                    }}
                                  >Delete</Button>
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
