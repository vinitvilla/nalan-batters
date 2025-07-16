import React from "react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function ProductList({ products }: { products: any[] }) {
  if (!products?.length) return <div>No products found.</div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 my-8">
      {products.map((product: any) => (
        <Card key={product.id}>
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>{product.category}</CardDescription>
          </CardHeader>
          <CardContent>
            {product.imageUrl && (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={400}
                height={160}
                className="w-full h-40 object-cover rounded mb-2"
              />
            )}
            <p className="text-gray-600 mb-2">{product.description}</p>
            <div className="font-bold text-primary mb-1">₹{product.price}</div>
            {typeof product.stock === "number" && (
              <div className="text-xs text-gray-500">Stock: {product.stock}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
