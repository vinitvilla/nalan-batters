"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { 
  Mail, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  User, 
  Calendar,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Archive,
  Reply,
  Star,
  Inbox,
  Send,
  ChevronDown,
  Users,
  TrendingUp
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
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

const statusColors = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  READ: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100", 
  INPROGRESS: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
  RESOLVED: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
};

const statusIcons = {
  NEW: Inbox,
  READ: Eye,
  INPROGRESS: Clock,
  RESOLVED: CheckCircle,
};

const priorityColors = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200", 
  low: "bg-green-50 text-green-700 border-green-200",
};

export default function ContactMessagesPage() {
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const token = userStore((state) => state.token);
  const adminApiFetch = useAdminApi();
  const { refetch: refetchNewMessagesCount } = useNewMessagesCount();
  
  // Use the store
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
      
      if (!response) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data.messages);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to fetch contact messages");
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (id: string, status: string) => {
    if (!token) {
      toast.error("Please sign in to access admin features.");
      return;
    }

    try {
      const response = await adminApiFetch("/api/admin/contact-messages", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response) {
        throw new Error("Failed to update message");
      }

      toast.success("Message status updated successfully");
      
      // Update the message in the store
      updateMessage(id, { status: status.toLowerCase() as any });
      
      setIsUpdateDialogOpen(false);
      fetchMessages(pagination.page);
      refetchNewMessagesCount(); // Update the sidebar badge count
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Failed to update message status");
    }
  };

  const deleteMessage = async (id: string) => {
    if (!token) {
      toast.error("Please sign in to access admin features.");
      return;
    }

    try {
      const response = await adminApiFetch("/api/admin/contact-messages", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response) {
        throw new Error("Failed to delete message");
      }

      toast.success("Message deleted successfully");
      
      // Remove the message from the store
      deleteMessageFromStore(id);
      
      fetchMessages(pagination.page);
      refetchNewMessagesCount(); // Update the sidebar badge count
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchMessages();
  }, [token]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    fetchMessages(1, value);
  };

  const filteredMessages = messages.filter(message =>
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
  };

  const handleUpdateMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setUpdateStatus(message.status);
    setIsUpdateDialogOpen(true);
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Left Sidebar - Message List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Contact Messages</h1>
                <p className="text-xs text-gray-500">{pagination.total} conversations</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-200"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-0 rounded-lg h-9 text-sm"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-3 py-2 bg-white border-b border-gray-200">
          <div className="flex gap-1">
            {[
              { value: "ALL", label: "All", icon: MessageSquare },
              { value: "NEW", label: "New", icon: Inbox },
              { value: "READ", label: "Read", icon: Eye },
              { value: "INPROGRESS", label: "Active", icon: Clock },
              { value: "RESOLVED", label: "Done", icon: CheckCircle }
            ].map(({ value, label, icon: Icon }) => {
              const count = value === "ALL" ? pagination.total : 
                           messages.filter(m => m.status === value).length;
              
              return (
                <Button
                  key={value}
                  variant={statusFilter === value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleStatusFilterChange(value)}
                  className={`h-8 text-xs px-3 ${
                    statusFilter === value 
                      ? "bg-green-500 text-white hover:bg-green-600" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {label}
                  {count > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                      statusFilter === value 
                        ? "bg-white/20 text-white" 
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {count}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full"></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">No messages found</p>
            </div>
          ) : (
            filteredMessages.map((message) => {
              const StatusIcon = statusIcons[message.status as keyof typeof statusIcons];
              const isSelected = selectedMessage?.id === message.id;
              const messageAge = Date.now() - new Date(message.createdAt).getTime();
              const hoursOld = messageAge / (1000 * 60 * 60);
              const isUrgent = message.status === "NEW" && hoursOld > 24;
              const isHighPriority = message.status === "NEW" && hoursOld > 4;
              
              return (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-gray-100" : ""
                  } ${isUrgent ? "border-l-4 border-l-red-500" : ""} ${isHighPriority && !isUrgent ? "border-l-4 border-l-orange-400" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    
                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {message.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <StatusIcon className={`w-3 h-3 ${
                            message.status === "NEW" ? "text-blue-500" :
                            message.status === "READ" ? "text-green-500" :
                            message.status === "INPROGRESS" ? "text-yellow-500" :
                            message.status === "RESOLVED" ? "text-gray-500" :
                            "text-gray-400"
                          }`} />
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </span>
                          {isUrgent && (
                            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                              URGENT
                            </span>
                          )}
                          {isHighPriority && !isUrgent && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                              HIGH
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {message.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 truncate">
                          {message.mobile}
                        </span>
                        {message.status === "NEW" && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      
                      {/* Quick Action Buttons for NEW messages */}
                      {message.status === "NEW" && (
                        <div className="mt-2 flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMessage(message);
                              setUpdateStatus("READ");
                              updateMessageStatus(message.id, "READ");
                            }}
                            className="h-6 text-xs px-2 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                          >
                            Mark as Read
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMessage(message);
                              setUpdateStatus("INPROGRESS");
                              setIsUpdateDialogOpen(true);
                            }}                          className="h-6 text-xs px-2 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                        >
                          Start Working
                        </Button>
                        </div>
                      )}
                      
                      {/* Quick Action for INPROGRESS messages */}
                      {message.status === "INPROGRESS" && (
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMessage(message);
                              setUpdateStatus("RESOLVED");
                              updateMessageStatus(message.id, "RESOLVED");
                            }}
                            className="h-6 text-xs px-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          >
                            Mark Resolved
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel - Message Detail */}
      <div className="flex-1 flex flex-col">
        {selectedMessage ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedMessage.name}
                    </h2>
                    <p className="text-sm text-gray-600">{selectedMessage.mobile}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Status Badge */}
                  {(() => {
                    const StatusIcon = statusIcons[selectedMessage.status as keyof typeof statusIcons];
                    return (
                      <Badge className={`${statusColors[selectedMessage.status]} px-3 py-1`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {selectedMessage.status.replace("_", " ")}
                      </Badge>
                    );
                  })()}
                  
                  {/* Action Buttons */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsUpdateDialogOpen(true)}
                    className="text-gray-600 hover:bg-gray-200"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          Delete Message
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this message from <strong>{selectedMessage.name}</strong>?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMessage(selectedMessage.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Message
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Message Bubble */}
                <div className="flex justify-start">
                  <div className="max-w-3xl">
                    {/* Message Header */}
                    <div className="mb-2">
                      <span className="text-xs text-gray-500">
                        {format(new Date(selectedMessage.createdAt), "EEEE, MMMM do, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    
                    {/* Message Bubble */}
                    <div className="bg-white rounded-lg rounded-tl-none shadow-sm border border-gray-200 p-4">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                    
                    {/* Message Footer */}
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <Mail className="w-3 h-3" />
                      <span>{selectedMessage.mobile}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(selectedMessage.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>

                {/* Status Updates Timeline */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Message Timeline
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">Message received</span>
                      <span className="text-gray-500">
                        {format(new Date(selectedMessage.createdAt), "MMM dd, h:mm a")}
                      </span>
                    </div>
                    
                    {selectedMessage.updatedAt !== selectedMessage.createdAt && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Status updated</span>
                        <span className="text-gray-500">
                          {format(new Date(selectedMessage.updatedAt), "MMM dd, h:mm a")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Response Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsUpdateDialogOpen(true)}
                    className="bg-gray-50 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Update Status
                  </Button>
                  
                  {/* Quick Status Actions */}
                  {selectedMessage.status === "NEW" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateMessageStatus(selectedMessage.id, "READ")}
                        className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Mark as Read
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUpdateStatus("INPROGRESS");
                          setIsUpdateDialogOpen(true);
                        }}
                        className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Start Working
                      </Button>
                    </>
                  )}
                  
                  {selectedMessage.status === "INPROGRESS" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMessageStatus(selectedMessage.id, "RESOLVED")}
                      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Resolved
                    </Button>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  Last updated {formatDistanceToNow(new Date(selectedMessage.updatedAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Contact Messages
              </h2>
              <p className="text-gray-500 max-w-md">
                Select a message from the sidebar to view and manage customer inquiries.
              </p>
              <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>New</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Resolved</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update Status Dialog - WhatsApp Style */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Update Message Status
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm">
              Change how you want to handle this message
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              {/* Current Message Preview */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-sm text-gray-900">
                    {selectedMessage.name}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Status Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Status</label>
                <div className="space-y-2">
                  {[
                    { value: "NEW", label: "New Message", icon: Inbox, color: "text-blue-600", desc: "Just received, needs attention" },
                    { value: "READ", label: "Read", icon: Eye, color: "text-green-600", desc: "Message has been read" },
                    { value: "INPROGRESS", label: "In Progress", icon: Clock, color: "text-yellow-600", desc: "Currently being handled" },
                    { value: "RESOLVED", label: "Resolved", icon: CheckCircle, color: "text-gray-600", desc: "Issue fully resolved" }
                  ].map(({ value, label, icon: Icon, color, desc }) => (
                    <div
                      key={value}
                      onClick={() => setUpdateStatus(value)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        updateStatus === value
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${color}`} />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{label}</div>
                          <div className="text-xs text-gray-500">{desc}</div>
                        </div>
                        {updateStatus === value && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsUpdateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateMessageStatus(selectedMessage.id, updateStatus)}
                  disabled={updateStatus === selectedMessage.status}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
