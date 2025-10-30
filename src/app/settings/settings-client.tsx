"use client";

import { useState, useEffect } from "react";
import { userStore } from "@/store/userStore";
import { useAddressStore } from "@/store/addressStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, MapPin, Shield, Settings, Phone, Mail, Trash2, Plus, Edit2, CheckCircle, XCircle, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { AddressForm } from "@/components/AddressForm";
import { formatAddress } from "@/lib/utils/commonFunctions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SettingsPageClient() {
  const router = useRouter();
  const user = userStore((s) => s.user);
  const fullName = userStore((s) => s.fullName);
  const phone = userStore((s) => s.phone);
  const userRole = userStore((s) => s.userRole);
  const isAdmin = userStore((s) => s.isAdmin);
  const isManager = userStore((s) => s.isManager);
  const defaultAddress = userStore((s) => s.defaultAddress);
  const setUser = userStore((s) => s.setUser);
  const setDefaultAddress = userStore((s) => s.setDefaultAddress);
  
  const addresses = useAddressStore((s) => s.addresses);
  const removeAddress = useAddressStore((s) => s.removeAddress);
  
  const [editingProfile, setEditingProfile] = useState(false);
  const [newFullName, setNewFullName] = useState(fullName || "");
  const [newPhone, setNewPhone] = useState(phone || "");
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/signin");
    }
  }, [user, router]);

  useEffect(() => {
    setNewFullName(fullName || "");
    setNewPhone(phone || "");
  }, [fullName, phone]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: newFullName,
          phone: newPhone,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setSaveSuccess(true);
      setEditingProfile(false);
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      setSaveError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user) return;
    
    setLoading(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/user/set-default-address", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to set default address");
      }

      const address = addresses.find((a) => a.id === addressId);
      setDefaultAddress(address || null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      setSaveError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    await removeAddress(addressId);
  };

  const handleAddressAdded = () => {
    setDialogOpen(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-24 lg:pt-28 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-600 text-lg">Manage your profile and preferences</p>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {saveSuccess && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Settings saved successfully!</span>
            </div>
          )}

          {saveError && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">{saveError}</span>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-800 data-[state=active]:to-black data-[state=active]:text-white rounded-lg font-semibold transition-all duration-200 cursor-pointer"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="addresses" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-800 data-[state=active]:to-black data-[state=active]:text-white rounded-lg font-semibold transition-all duration-200 cursor-pointer"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Addresses
              </TabsTrigger>
              <TabsTrigger 
                value="account" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-800 data-[state=active]:to-black data-[state=active]:text-white rounded-lg font-semibold transition-all duration-200 cursor-pointer"
              >
                <Shield className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="border-2 border-gray-200 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Personal Information</CardTitle>
                      <CardDescription className="text-base text-gray-600">
                        Update your personal details and contact information
                      </CardDescription>
                    </div>
                    {!editingProfile && (
                      <Button
                        onClick={() => setEditingProfile(true)}
                        variant="outline"
                        className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl px-6 py-2 font-semibold transition-all duration-200 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {editingProfile ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-base font-semibold text-gray-900">
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          value={newFullName}
                          onChange={(e) => setNewFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="border-2 border-gray-200 rounded-lg px-4 py-3 text-base focus:border-gray-800 focus:ring-2 focus:ring-gray-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-base font-semibold text-gray-900">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="border-2 border-gray-200 rounded-lg px-4 py-3 text-base focus:border-gray-800 focus:ring-2 focus:ring-gray-100"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-4">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          className="bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800 px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl cursor-pointer disabled:cursor-not-allowed"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingProfile(false);
                            setNewFullName(fullName || "");
                            setNewPhone(phone || "");
                            setSaveError(null);
                          }}
                          variant="outline"
                          className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <User className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
                          <p className="text-lg font-semibold text-gray-900">{fullName || "Not set"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                          <p className="text-lg font-semibold text-gray-900">{phone || "Not set"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                          <p className="text-lg font-semibold text-gray-900">{user.email || "Not set"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <Card className="border-2 border-gray-200 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Saved Addresses</CardTitle>
                      <CardDescription className="text-base text-gray-600">
                        Manage your delivery addresses
                      </CardDescription>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={false}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-gray-800 px-6 py-2 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl flex items-center gap-2 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          Add Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent 
                        className="sm:max-w-2xl bg-white border border-gray-200 shadow-xl z-[9999]"
                        onInteractOutside={(e) => {
                          const target = e.target as Element;
                          if (target?.closest('.pac-container')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <DialogHeader className="text-center pb-6">
                          <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-sm border border-gray-300">
                              <MapPin className="w-8 h-8 text-gray-700" />
                            </div>
                          </div>
                          <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                            Add New Address
                          </DialogTitle>
                          <DialogDescription className="text-gray-600 text-base leading-relaxed">
                            Enter your address details below. We&apos;ll save it securely for future orders!
                          </DialogDescription>
                        </DialogHeader>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 relative">
                          <AddressForm 
                            loading={loading} 
                            onAdd={handleAddressAdded} 
                            onCancel={() => setDialogOpen(false)}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {addresses && addresses.length > 0 ? (
                    <div className="space-y-4">
                      {addresses.map((addr) => {
                        const isDefault = addr.id === defaultAddress?.id;
                        return (
                          <div
                            key={addr.id}
                            className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-start gap-4">
                              <MapPin className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-base leading-tight mb-2">
                                  {formatAddress(addr)}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {isDefault && (
                                    <Badge className="bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-100 px-3 py-1 rounded-full font-semibold">
                                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 inline-block"></span>
                                      Default
                                    </Badge>
                                  )}
                                  {!isDefault && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSetDefaultAddress(addr.id!)}
                                      disabled={loading}
                                      className="text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-3 py-1 rounded-lg font-medium text-sm cursor-pointer disabled:cursor-not-allowed"
                                    >
                                      Set as Default
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {isDefault ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-2 h-auto rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                                      >
                                        <Info className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Default address cannot be deleted</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-2 h-auto rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="border border-gray-200 shadow-xl bg-white">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-gray-900 text-lg font-bold">
                                          🗑️ Delete Address?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-600 text-base">
                                          Are you sure you want to delete this address? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter className="gap-3">
                                        <AlertDialogCancel asChild>
                                          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium cursor-pointer">
                                            Cancel
                                          </Button>
                                        </AlertDialogCancel>
                                        <AlertDialogAction asChild>
                                          <Button 
                                            onClick={() => handleDeleteAddress(addr.id!)} 
                                            className="bg-red-600 text-white hover:bg-red-700 px-6 py-2 rounded-lg font-medium shadow-sm cursor-pointer"
                                          >
                                            Delete
                                          </Button>
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-lg border border-gray-300">
                          <MapPin className="w-10 h-10 text-gray-500" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        No addresses saved yet
                      </h3>
                      <p className="text-gray-600 text-base mb-8 max-w-md mx-auto leading-relaxed">
                        Add your first delivery address to make checkout faster next time.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account">
              <Card className="border-2 border-gray-200 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Account Information</CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    View your account details and security information
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* User ID */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">User ID</p>
                        <p className="text-base font-mono text-gray-900 break-all">{user.id}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Email Address</p>
                        <p className="text-base font-semibold text-gray-900">{user.email}</p>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Account Role</p>
                        <div className="flex items-center gap-2 mt-2">
                          {isAdmin && (
                            <Badge className="bg-red-100 text-red-800 border border-red-200 hover:bg-red-100 px-3 py-1 rounded-full font-semibold">
                              <Shield className="w-3 h-3 mr-1.5" />
                              Admin
                            </Badge>
                          )}
                          {isManager && (
                            <Badge className="bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-100 px-3 py-1 rounded-full font-semibold">
                              <Shield className="w-3 h-3 mr-1.5" />
                              Manager
                            </Badge>
                          )}
                          {!isAdmin && !isManager && (
                            <Badge className="bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-100 px-3 py-1 rounded-full font-semibold">
                              <User className="w-3 h-3 mr-1.5" />
                              Customer
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-8" />

                    {/* Account Actions */}
                    {/* <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Account Actions</h3>
                      
                      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <Info className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">Need to change your email or password?</h4>
                            <p className="text-sm text-gray-700 mb-4">
                              For security reasons, email and password changes must be done through your authentication provider.
                            </p>
                            <Button
                              variant="outline"
                              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-lg px-6 py-2 font-medium cursor-pointer"
                              onClick={() => router.push("/signin")}
                            >
                              Go to Sign In
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div> */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}
