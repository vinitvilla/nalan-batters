// External imports
"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

// UI components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

// Icons
import { Trash2, Plus, Pen } from "lucide-react";

// Types
import { DiscountType } from "@/generated/prisma";
import { useAdminApi } from "../use-admin-api";

interface PromoCode {
  id: string;
  code: string;
  discount: number;
  discountType: DiscountType;
  isActive: boolean;
  isDeleted: boolean;
  expiresAt: string | null;
}

export default function PromoCodesPage() {
  // --- State ---
  const adminApiFetch = useAdminApi();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [newPromo, setNewPromo] = useState<{
    code: string;
    discount: number;
    discountType: DiscountType;
    isActive: boolean;
    isDeleted: boolean;
    expiresAt: string | null;
  }>({
    code: "",
    discount: 0,
    discountType: DiscountType.PERCENTAGE,
    isActive: true,
    isDeleted: false,
    expiresAt: null,
  });
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editPromo, setEditPromo] = useState<null | typeof newPromo>(null);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // --- Effects ---
  useEffect(() => {
    adminApiFetch("/api/admin/promoCodes").then(async (res) => {
      if (!res) return;
      if (!res.ok) {
        toast.error("Failed to fetch promo codes");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setPromoCodes(data);
      setLoading(false);
    });
  }, [adminApiFetch]);

  // --- Handlers ---
  const handleToggle = (idx: number) => {
    setPromoCodes((prev) => prev.map((c, i) => (i === idx ? { ...c, isActive: !c.isActive } : c)));
  };

  const handleDialogAdd = async () => {
    setSaving(true);
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
        discountType: DiscountType.PERCENTAGE,
        isActive: true,
        isDeleted: false,
        expiresAt: null,
      });
      setShowDialog(false);
    } catch {
      toast.error("Failed to add promo code");
    }
    setSaving(false);
  };

  const handleEditOpen = (idx: number) => {
    setEditIdx(idx);
    setEditPromo({ ...promoCodes[idx] });
    setShowDialog(true);
  };

  const handleDialogSave = async () => {
    if (editIdx === null || !editPromo) return;
    setSaving(true);
    try {
      const res = await adminApiFetch("/api/admin/promoCodes", {
        method: "PUT",
        body: JSON.stringify(editPromo),
        headers: { "Content-Type": "application/json" },
      });
      if (!res || !res.ok) throw new Error("Failed to save promo code");
      const updated = await res.json();
      setPromoCodes((prev) => prev.map((c, i) => (i === editIdx ? updated : c)));
      setEditIdx(null);
      setEditPromo(null);
      setShowDialog(false);
    } catch {
      toast.error("Failed to save promo code");
    }
    setSaving(false);
  };

  const handleDelete = (idx: number) => {
    setPromoCodes((prev) => prev.filter((_, i) => i !== idx));
    // Optionally, call API to delete promo code
  };

  // --- Derived ---
  const filteredPromoCodes = promoCodes.filter((promo) =>
    promo.code.toLowerCase().includes(search.toLowerCase())
  );

  // --- Render ---
  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-10">
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Promo Code Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <Input
                placeholder="Search promo codes by code..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="max-w-xs"
              />
              {/* Add/Edit Promo Code Dialog */}
              <AlertDialog open={showDialog} onOpenChange={val => {
                setShowDialog(val);
                if (!val) {
                  setEditIdx(null);
                  setEditPromo(null);
                }
              }}>
                <AlertDialogTrigger asChild>
                  <Button className="flex items-center gap-2 px-4 py-2 font-bold bg-black text-white rounded-xl cursor-pointer">
                    <Plus size={18} /> Add Promo Code
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader className="flex flex-row items-center justify-between">
                    <AlertDialogTitle>{editIdx !== null ? "Edit Promo Code" : "Add Promo Code"}</AlertDialogTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Switch
                        checked={editIdx !== null ? editPromo?.isActive ?? false : newPromo.isActive}
                        onCheckedChange={val => {
                          if (editIdx !== null) setEditPromo(editPromo => editPromo ? { ...editPromo, isActive: val } : editPromo);
                          else setNewPromo({ ...newPromo, isActive: val });
                        }}
                        disabled={saving}
                        className={(editIdx !== null ? editPromo?.isActive : newPromo.isActive) ? "bg-green-500" : "bg-gray-300"}
                        id="isActiveDialog"
                      />
                      <Label htmlFor="isActiveDialog" className="text-xs text-gray-600">isActive</Label>
                    </div>
                  </AlertDialogHeader>
                  <div className="flex flex-col gap-3 mt-2">
                    <div>
                      <Label htmlFor="promoCodeInput" className="text-xs text-gray-600 mb-1">Promo Code</Label>
                      <Input
                        id="promoCodeInput"
                        className="w-48"
                        placeholder="Promo Code"
                        value={editIdx !== null ? editPromo?.code ?? "" : newPromo.code}
                        onChange={e => {
                          if (editIdx !== null) setEditPromo(editPromo => editPromo ? { ...editPromo, code: e.target.value } : editPromo);
                          else setNewPromo({ ...newPromo, code: e.target.value });
                        }}
                        disabled={saving}
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex flex-col">
                        <Label htmlFor="discountInput" className="text-xs text-gray-600 mb-1">Discount</Label>
                        <Input
                          id="discountInput"
                          className="w-32"
                          type="number"
                          placeholder={editIdx !== null ? (editPromo?.discountType === DiscountType.PERCENTAGE ? "Discount (%)" : "Discount Value") : (newPromo.discountType === DiscountType.PERCENTAGE ? "Discount (%)" : "Discount Value")}
                          value={editIdx !== null ? editPromo?.discount ?? 0 : newPromo.discount}
                          onChange={e => {
                            if (editIdx !== null) setEditPromo(editPromo => editPromo ? { ...editPromo, discount: Number(e.target.value) } : editPromo);
                            else setNewPromo({ ...newPromo, discount: Number(e.target.value) });
                          }}
                          disabled={saving}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label htmlFor="discountTypeSelect" className="text-xs text-gray-600 mb-1">Discount Type</Label>
                        <Select
                          value={editIdx !== null ? editPromo?.discountType ?? DiscountType.PERCENTAGE : newPromo.discountType}
                          onValueChange={val => {
                            if (editIdx !== null) setEditPromo(editPromo => editPromo ? { ...editPromo, discountType: val as DiscountType } : editPromo);
                            else setNewPromo({ ...newPromo, discountType: val as DiscountType });
                          }}
                          disabled={saving}
                        >
                          <SelectTrigger id="discountTypeSelect" className="w-32 border border-gray-300 rounded-md px-2 py-1 text-xs bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={DiscountType.PERCENTAGE}>Percentage</SelectItem>
                            <SelectItem value={DiscountType.VALUE}>Value</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="expiresAtInput" className="text-xs text-gray-600 mb-1">Expires At</Label>
                      <Input
                        id="expiresAtInput"
                        className="w-fit"
                        type="date"
                        placeholder="Expires At"
                        value={editIdx !== null ? (typeof editPromo?.expiresAt === "string" ? editPromo.expiresAt.split("T")[0] : "") : (typeof newPromo.expiresAt === "string" ? newPromo.expiresAt.split("T")[0] : "")}
                        onChange={e => {
                          if (editIdx !== null) setEditPromo(editPromo => editPromo ? { ...editPromo, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null } : editPromo);
                          else setNewPromo({ ...newPromo, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null });
                        }}
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel asChild>
                      <Button variant="outline" className="cursor-pointer">Cancel</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        onClick={editIdx !== null ? handleDialogSave : handleDialogAdd}
                        disabled={saving}
                        className="bg-black text-white cursor-pointer"
                      >{editIdx !== null ? "Save" : "Add"}</Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            {/* Promo Codes Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Type</TableHead>
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
                        <TableCell>{promo.expiresAt ? new Date(promo.expiresAt).toISOString().split("T")[0] : ""}</TableCell>
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
                            className="cursor-pointer px-2 rounded-md"
                            onClick={() => handleEditOpen(idx)}
                            disabled={saving}
                          >
                            <Pen size={16} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer px-2 rounded-md text-red-500 ml-2"
                                onClick={() => setDeleteIdx(idx)}
                                disabled={saving}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Promo Code?</AlertDialogTitle>
                              </AlertDialogHeader>
                              <div className="text-sm">Are you sure you want to delete this promo code? This action cannot be undone.</div>
                              <AlertDialogFooter>
                                <AlertDialogCancel asChild>
                                  <Button variant="outline" className="cursor-pointer">Cancel</Button>
                                </AlertDialogCancel>
                                <AlertDialogAction asChild>
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      if (deleteIdx !== null) handleDelete(deleteIdx);
                                      setDeleteIdx(null);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    Delete
                                  </Button>
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
