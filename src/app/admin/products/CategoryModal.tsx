import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import Modal from "@/app/admin/components/modal";
import { toast } from "sonner";
import { useAdminApi } from "../use-admin-api";

type Props = {
    open: boolean;
    onClose: () => void;
    categories: { id: string; name: string }[];
    onCategoryChange: () => void;
    token: string | null;
};

export default function CategoryModal({ open, onClose, categories, onCategoryChange, token }: Props) {
    const [editing, setEditing] = useState<{ id?: string; name: string } | null>(null);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const adminApiFetch = useAdminApi();

    useEffect(() => {
        if (!open) {
            setEditing(null);
            setName("");
        }
    }, [open]);

    const handleSave = async () => {
        if (!name.trim()) return toast.error("Category name required");
        setLoading(true);
        try {
            const method = editing?.id ? "PUT" : "POST";
            const res = await adminApiFetch("/api/admin/categories", {
              method: editing?.id ? "PUT" : "POST",
              body: JSON.stringify({ id: editing?.id, name }),
              headers: { "Content-Type": "application/json" },
            });
            if (!res || !res.ok) throw new Error("Failed to save category");
            toast.success(editing?.id ? "Category updated" : "Category added");
            onCategoryChange();
            setEditing(null);
            setName("");
        } catch (e) {
            toast.error("Error saving category");
        } finally {
            setLoading(false);
        }
    };
    const handleEdit = (cat: { id: string; name: string }) => {
        setEditing(cat);
        setName(cat.name);
    };
    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this category?")) return;
        setLoading(true);
        try {
            const res = await adminApiFetch("/api/admin/categories", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: "include",
                body: JSON.stringify({ id }),
            });
            if (!res || !res.ok) throw new Error("Failed to delete category");
            toast.success("Category deleted");
            onCategoryChange();
        } catch (e) {
            toast.error("Error deleting category");
        } finally {
            setLoading(false);
        }
    };
    return (
        <Modal open={open} onClose={onClose} heading="Manage Categories">
            <div className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Category name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="flex-1"
                        disabled={loading}
                    />
                    <Button onClick={handleSave} disabled={loading}>
                        {editing?.id ? "Save" : "Add"}
                    </Button>
                    {editing && (
                        <Button variant="outline" onClick={() => { setEditing(null); setName(""); }} disabled={loading}>
                            Cancel
                        </Button>
                    )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map(cat => (
                                <TableRow key={cat.id}>
                                    <TableCell>{cat.name}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(cat)}><Edit className="w-4 h-4" /></Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(cat.id)}><Trash2 className="w-4 h-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Modal>
    );
}
