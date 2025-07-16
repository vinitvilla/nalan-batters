import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { storage } from "@/lib/firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { z } from "zod";

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    categoryId: z.string().min(1, "Category is required"),
    price: z.coerce.number().min(0, "Price is required"),
    stock: z.coerce.number().min(0, "Stock is required"),
    imageUrl: z.string().min(1, "Image URL is required"),
});

type ProductFormValues = z.infer<typeof productSchema> & { id?: string; category?: string };

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

type Props = {
    initial?: Partial<Product>;
    onSave: (data: Partial<Product>) => void;
    onCancel: () => void;
    categories: { id: string; name: string }[];
};

export default function ProductForm({ initial, onSave, onCancel, categories }: Props) {
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            id: initial?.id || undefined,
            name: initial?.name || "",
            description: initial?.description || "",
            categoryId: initial?.categoryId || "",
            price: initial?.price ?? 0,
            stock: initial?.stock ?? 0,
            imageUrl: initial?.imageUrl || "",
        },
        mode: "onTouched",
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleImageClick = () => fileInputRef.current?.click();
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!form.getValues("id")) {
            toast.error("Please save the product first before uploading an image.");
            return;
        }
        setUploading(true);
        try {
            const productId = form.getValues("id");
            const ext = file.name.split('.').pop() || 'jpg';
            const storageRef = ref(storage, `nalan-batters/products/${productId}.${ext}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            form.setValue("imageUrl", url, { shouldValidate: true });
            toast.success("Image uploaded successfully!");
        } catch {
            toast.error("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Form {...form}>
            <form
                className="space-y-4"
                onSubmit={form.handleSubmit((values) => {
                    onSave({
                        id: values.id,
                        name: values.name,
                        description: values.description,
                        categoryId: values.categoryId,
                        price: values.price,
                        stock: values.stock,
                        imageUrl: values.imageUrl,
                    });
                })}
            >
                {/* Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Name" required />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Description" required />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {/* Category */}
                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <select {...field} required className="w-full border rounded px-2 py-1">
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </FormControl>
                        </FormItem>
                    )}
                />
                {/* Price */}
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Price" type="number" required />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {/* Stock */}
                <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Stock <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Stock" type="number" required />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {/* Image */}
                <div>
                    <FormLabel>Product Image <span className="text-red-500">*</span></FormLabel>
                    <div className="flex flex-col gap-2">
                        <div
                            className="w-32 h-32 border rounded flex items-center justify-center cursor-pointer bg-gray-50 hover:opacity-80"
                            onClick={handleImageClick}
                        >
                            {!!form.watch("imageUrl") && form.watch("imageUrl").trim() !== "" ? (
                                <Image
                                    src={form.watch("imageUrl")}
                                    alt="Product Preview"
                                    width={128}
                                    height={128}
                                    className="rounded object-cover w-32 h-32"
                                />
                            ) : (
                                <span className="text-gray-400 text-xs">Click to upload</span>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        {uploading && <span className="text-xs text-gray-500">Uploading...</span>}
                    </div>
                </div>
                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
                        Cancel
                    </Button>
                    <Button type="submit" className="cursor-pointer">{initial?.id ? "Save Changes" : "Add Product"}</Button>
                </div>
            </form>
        </Form>
    );
}
