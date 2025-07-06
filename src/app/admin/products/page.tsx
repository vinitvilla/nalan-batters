"use client";

// --- Imports ---
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Modal from "@/app/admin/components/modal";
import { userStore } from "@/store/userStore";
import { useProductStore } from "@/store/productStore";
import { toast } from "sonner";
import ProductForm from "./ProductForm";
import CategoryModal from "./CategoryModal";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdminApi } from "@/app/admin/use-admin-api";

// --- Types ---
type Product = {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock?: number;
    category: string;
    categoryId?: string;
    imageUrl?: string;
    isActive: boolean;
};

// --- Main Page Component ---
export default function ProductsPage() {
    // --- State ---
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("all");
    const token = userStore((state) => state.token);
    const products = useProductStore((state) => state.products);
    const setProducts = useProductStore((state) => state.setProducts);
    const fetchProducts = useProductStore((state) => state.fetchProducts);
    const categories = useProductStore((state) => state.categories);
    const fetchCategories = useProductStore((state) => state.fetchCategories);
    const upsertProduct = useProductStore((state) => state.upsertProduct);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const router = useRouter();
    const adminApiFetch = useAdminApi();

    // --- Effects ---
    useEffect(() => {
        if (!token) return;
        fetchCategories(token);
        adminApiFetch("/api/admin/products", {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
        })
            .then(res => res && res.json())
            .then(data => {
                if (!data) return;
                const arr = Array.isArray(data) ? data : data.products || [];
                setProducts(arr);
            })
            .catch(() => {});
    }, [token]);

    // --- Derived Data ---
    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesTab = tab === "all" || product.category === tab;
        return matchesSearch && matchesTab;
    });

    // --- Handlers ---
    const handleAdd = () => {
        setEditingProduct(null);
        setModalOpen(true);
    };
    const handleEdit = (product: Product) => {
        setEditingProduct({ ...product, id: product.id });
        setModalOpen(true);
    };
    const handleSave = async (data: Partial<Product>) => {
        try {
            if (editingProduct) {
                data.id = editingProduct.id || data.id;
            }
            await upsertProduct(data, token || undefined);
            setModalOpen(false);
            if (token) fetchProducts();
        } catch (err) {
            toast.error("There was a problem saving the product. Please try again.");
            console.error(err);
        }
    };
    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;
            const res = await adminApiFetch("/api/admin/products", {
                method: "DELETE",
                headers,
                credentials: "include",
                body: JSON.stringify({ id }),
            });
            if (!res || !res.ok) throw new Error("Failed to delete product");
            toast.success("Product deleted");
            adminApiFetch("/api/admin/products", {
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            })
                .then(res => res && res.json())
                .then(data => {
                    if (!data) return;
                    const arr = Array.isArray(data) ? data : data.products || [];
                    setProducts(arr);
                })
                .catch(() => {});
        } catch (err) {
            toast.error("There was a problem deleting the product. Please try again.");
            console.error(err);
        }
    };
    const refreshCategories = () => {
        if (!token) return;
        fetchCategories(token);
    };

    // --- Render ---
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Products</h1>
                <div className="flex gap-2">
                    <Button variant="default" size="sm" className="cursor-pointer" onClick={handleAdd}>
                        <Plus className="w-4 h-4 mr-2 cursor-pointer" /> Add Product
                    </Button>
                    <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setCategoryModalOpen(true)}>
                        Manage Categories
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Product Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <Input
                            placeholder="Search products by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-xs"
                        />
                        <Tabs value={tab} onValueChange={setTab} className="w-full md:w-auto">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                {categories.map((cat) => (
                                    <TabsTrigger key={cat.id} value={cat.name}>{cat.name}</TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <Image
                                                src={product.imageUrl || "/vercel.svg"}
                                                alt={product.name}
                                                width={40}
                                                height={40}
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                        </TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.description}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                                        <TableCell>{product.stock}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => handleEdit(product)}>
                                                Edit
                                            </Button>
                                            <Button size="sm" variant="destructive" className="cursor-pointer" onClick={() => handleDelete(product.id)}>
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                heading={editingProduct ? "Edit Product" : "Add Product"}
            >
                <ProductForm
                    initial={editingProduct || undefined}
                    onSave={handleSave}
                    onCancel={() => setModalOpen(false)}
                    categories={categories}
                />
            </Modal>
            <CategoryModal
                open={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                categories={categories}
                onCategoryChange={refreshCategories}
                token={token}
            />
        </div>
    );
}
