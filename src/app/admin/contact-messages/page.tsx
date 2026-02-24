"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Mail,
  Eye,
  Edit,
  Trash2,
  Search,
  MessageSquare,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Inbox,
  ArrowLeft,
  Phone,
} from "lucide-react";
import moment from "moment";
import { userStore } from "@/store/userStore";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { useNewMessagesCount } from "@/hooks/useNewMessagesCount";
import { useContactMessagesStore } from "@/store/contactMessagesStore";

interface ContactMessage {
  id: string;
  name: string;
  mobile: string;
  message: string;
  status: "NEW" | "READ" | "INPROGRESS" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const STATUS_CONFIG = {
  NEW: {
    label: "New",
    icon: Inbox,
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
    borderClass: "border-l-blue-500",
  },
  READ: {
    label: "Read",
    icon: Eye,
    badgeClass: "bg-green-50 text-green-700 border-green-200",
    dotClass: "bg-green-400",
    borderClass: "border-l-green-400",
  },
  INPROGRESS: {
    label: "In Progress",
    icon: Clock,
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
    borderClass: "border-l-amber-500",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle,
    badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
    dotClass: "bg-gray-400",
    borderClass: "border-l-gray-300",
  },
};

const FILTERS = [
  { value: "ALL", label: "All" },
  { value: "NEW", label: "New" },
  { value: "READ", label: "Read" },
  { value: "INPROGRESS", label: "Active" },
  { value: "RESOLVED", label: "Done" },
];

export default function ContactMessagesPage() {
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const token = userStore((state) => state.token);
  const adminApiFetch = useAdminApi();
  const { refetch: refetchNewMessagesCount } = useNewMessagesCount();

  const messages = useContactMessagesStore((state) => state.messages);
  const loading = useContactMessagesStore((state) => state.loading);
  const setMessages = useContactMessagesStore((state) => state.setMessages);
  const setLoading = useContactMessagesStore((state) => state.setLoading);
  const updateMessage = useContactMessagesStore((state) => state.updateMessage);
  const deleteMessageFromStore = useContactMessagesStore((state) => state.deleteMessage);

  const fetchMessages = async (page = 1, status = statusFilter) => {
    if (!token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(status !== "ALL" && { status }),
      });
      const response = await adminApiFetch(`/api/admin/contact-messages?${params}`);
      if (!response) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data.messages);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to fetch contact messages");
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (id: string, status: string) => {
    if (!token) { toast.error("Please sign in to access admin features."); return; }
    try {
      const response = await adminApiFetch("/api/admin/contact-messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response) throw new Error("Failed to update message");
      toast.success("Message status updated");
      updateMessage(id, { status: status.toLowerCase() as ContactMessage["status"] });
      // Update selected message in state
      setSelectedMessage(prev => prev && prev.id === id ? { ...prev, status: status as ContactMessage["status"] } : prev);
      setIsUpdateDialogOpen(false);
      fetchMessages(pagination.page);
      refetchNewMessagesCount();
    } catch {
      toast.error("Failed to update message status");
    }
  };

  const deleteMessage = async (id: string) => {
    if (!token) { toast.error("Please sign in to access admin features."); return; }
    try {
      const response = await adminApiFetch("/api/admin/contact-messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response) throw new Error("Failed to delete message");
      toast.success("Message deleted");
      deleteMessageFromStore(id);
      setSelectedMessage(null);
      setMobileView("list");
      fetchMessages(pagination.page);
      refetchNewMessagesCount();
    } catch {
      toast.error("Failed to delete message");
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    fetchMessages(1, value);
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const newCount = messages.filter((m) => m.status === "NEW").length;

  // ── List Panel ─────────────────────────────────────────────────────────────
  const ListPanel = (
    <div className={`${mobileView === "list" ? "flex" : "hidden"} md:flex flex-col w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-shrink-0`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold text-gray-900">Contact Messages</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {pagination.total} total{newCount > 0 && ` · ${newCount} new`}
            </p>
          </div>
          {newCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {newCount}
            </span>
          )}
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search name, phone, message…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-4 py-2 border-b border-gray-100 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {FILTERS.map(({ value, label }) => {
            const count =
              value === "ALL"
                ? pagination.total
                : messages.filter((m) => m.status === value).length;
            return (
              <button
                key={value}
                onClick={() => handleFilterChange(value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === value
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`ml-1 ${statusFilter === value ? "opacity-70" : "text-gray-500"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageSquare className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No messages found</p>
          </div>
        ) : (
          filteredMessages.map((message) => {
            const cfg = STATUS_CONFIG[message.status as keyof typeof STATUS_CONFIG];
            const isSelected = selectedMessage?.id === message.id;

            return (
              <button
                key={message.id}
                onClick={() => { setSelectedMessage(message); setMobileView("detail"); }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-l-4 ${cfg.borderClass} ${isSelected ? "bg-gray-50" : "bg-white"}`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-gray-900 truncate">{message.name}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{moment(message.createdAt).fromNow()}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{message.message}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {message.mobile}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.badgeClass}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  // ── Detail Panel ───────────────────────────────────────────────────────────
  const DetailPanel = (
    <div className={`${mobileView === "detail" ? "flex" : "hidden"} md:flex flex-1 flex-col min-w-0 bg-gray-50`}>
      {selectedMessage ? (
        <>
          {/* Compact Header */}
          <div className="bg-white border-b border-gray-200 px-3 py-3">
            <div className="flex items-center gap-2">
              {/* Back (mobile only) */}
              <button
                onClick={() => setMobileView("list")}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Avatar */}
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-500" />
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-gray-900 truncate leading-tight">{selectedMessage.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500 truncate">{selectedMessage.mobile}</span>
                  {(() => {
                    const cfg = STATUS_CONFIG[selectedMessage.status as keyof typeof STATUS_CONFIG];
                    return (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.badgeClass}`}>
                        {cfg.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Delete */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Delete Message
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Delete message from <strong>{selectedMessage.name}</strong>? This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Message Body */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Timestamp */}
              <div className="text-center">
                <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">
                  {moment(selectedMessage.createdAt).format("MMM D, YYYY [at] h:mm A")}
                </span>
              </div>

              {/* Message bubble */}
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-200 px-4 py-3">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                    <Mail className="w-3 h-3" />
                    <span>{selectedMessage.mobile}</span>
                    <span>·</span>
                    <span>{moment(selectedMessage.createdAt).fromNow()}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Timeline
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    <span className="text-gray-600">Received</span>
                    <span className="text-gray-400 text-xs ml-auto">
                      {moment(selectedMessage.createdAt).format("MMM D, h:mm A")}
                    </span>
                  </div>
                  {selectedMessage.updatedAt !== selectedMessage.createdAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span className="text-gray-600">Status updated</span>
                      <span className="text-gray-400 text-xs ml-auto">
                        {moment(selectedMessage.updatedAt).format("MMM D, h:mm A")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar — no horizontal scroll */}
          <div className="bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
            {selectedMessage.status === "NEW" && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => updateMessageStatus(selectedMessage.id, "READ")}
                  className="h-11 text-sm font-semibold bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                >
                  <Eye className="w-4 h-4 mr-2 flex-shrink-0" />
                  Mark as Read
                </Button>
                <Button
                  onClick={() => { setUpdateStatus("INPROGRESS"); setIsUpdateDialogOpen(true); }}
                  className="h-11 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
                >
                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                  Start Working
                </Button>
              </div>
            )}

            {selectedMessage.status === "INPROGRESS" && (
              <Button
                onClick={() => updateMessageStatus(selectedMessage.id, "RESOLVED")}
                className="w-full h-11 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Resolved
              </Button>
            )}

            {selectedMessage.status === "READ" && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => { setUpdateStatus("INPROGRESS"); setIsUpdateDialogOpen(true); }}
                  className="h-11 text-sm font-semibold"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Start Working
                </Button>
                <Button
                  onClick={() => updateMessageStatus(selectedMessage.id, "RESOLVED")}
                  className="h-11 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Resolve
                </Button>
              </div>
            )}

            {selectedMessage.status === "RESOLVED" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Resolved {moment(selectedMessage.updatedAt).fromNow()}</span>
                </div>
                <button
                  onClick={() => { setUpdateStatus(""); setIsUpdateDialogOpen(true); }}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Change
                </button>
              </div>
            )}

            {/* Always show "Change status" link for non-resolved */}
            {selectedMessage.status !== "RESOLVED" && (
              <button
                onClick={() => { setUpdateStatus(selectedMessage.status); setIsUpdateDialogOpen(true); }}
                className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 py-1"
              >
                <Edit className="w-3 h-3" />
                Change status
              </button>
            )}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center px-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">No message selected</h2>
            <p className="text-sm text-gray-400">Pick a conversation from the list to view it here.</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100 overflow-hidden relative">
      {ListPanel}
      {DetailPanel}

      {/* Status Bottom Sheet — rendered inline to avoid fixed-positioning issues */}
      {isUpdateDialogOpen && selectedMessage && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 z-40"
            onClick={() => setIsUpdateDialogOpen(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-4 pb-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Change Status</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Update how this message is being handled</p>
                </div>
                <button
                  onClick={() => setIsUpdateDialogOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-start gap-2.5">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{selectedMessage.name}</p>
                  <p className="text-xs text-gray-500 truncate">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Status options */}
              <div className="space-y-2">
                {[
                  { value: "NEW",        label: "New",         desc: "Needs attention" },
                  { value: "READ",       label: "Read",        desc: "Message has been read" },
                  { value: "INPROGRESS", label: "In Progress", desc: "Currently being handled" },
                  { value: "RESOLVED",   label: "Resolved",    desc: "Fully resolved" },
                ].map(({ value, label, desc }) => {
                  const cfg = STATUS_CONFIG[value as keyof typeof STATUS_CONFIG];
                  return (
                    <button
                      key={value}
                      onClick={() => setUpdateStatus(value)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all text-left ${
                        updateStatus === value
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dotClass}`} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                      {updateStatus === value && (
                        <CheckCircle className="w-4 h-4 text-gray-900 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsUpdateDialogOpen(false)}
                  className="flex-1 h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateMessageStatus(selectedMessage.id, updateStatus)}
                  disabled={!updateStatus || updateStatus === selectedMessage.status}
                  className="flex-1 h-11 bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
