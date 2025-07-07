"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { showAddToCartToast } from "@/components/CartToast";
import { useProductStore } from "@/store/productStore";

export default function QuickOrderSection() {
	const products = useProductStore((state) => state.products);
	const fetchProducts = useProductStore((state) => state.fetchProducts);
	const [quantities, setQuantities] = useState<{ [id: string]: number }>({});
	const addToCart = useCartStore((state) => state.addToCart);

	// Fetch products if not loaded and initialize quantities
	useEffect(() => {
		if (products.length === 0) fetchProducts();
		const initialQuantities: { [id: string]: number } = {};
		products.forEach((item) => {
			initialQuantities[item.id] = 1;
		});
		setQuantities(initialQuantities);
	}, [products.length]);

	const handleAddToCart = (item: {
		id: string;
		name: string;
		price: number;
		quantity: number;
	}) => {
		addToCart(item);
		showAddToCartToast({
			onViewCart: () => useCartStore.getState().openCart(),
		});
		useCartStore.getState().openCart();
	};

	const handleQuantityChange = (id: string, value: number) => {
		setQuantities((prev) => ({ ...prev, [id]: value }));
	};

	return (
		<section
			id="quickOrder"
			className="container mx-auto py-2 px-2 sm:py-8 sm:px-0 text-center"
		>
			<h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
				Quick Order
			</h2>
			<p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
				Get your favorite batters delivered to your doorstep!
			</p>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
				{products.map((item) => (
					<Card className="shadow-md flex flex-col" key={item.id}>
						<div className="relative w-full h-40 sm:h-48">
							{item.imageUrl && (
								<Image
									src={item.imageUrl}
									alt={item.name}
									fill
									className="object-cover rounded-t-lg"
									style={{ objectPosition: "center" }}
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
									priority
								/>
							)}
						</div>
						<CardHeader>
							<CardTitle className="text-base sm:text-lg">
								{item.name}
							</CardTitle>
						</CardHeader>
						<CardContent className="text-center flex-1 flex flex-col">
							<p className="mb-3 sm:mb-4 text-gray-700 text-sm sm:text-base">
								{item.description}
							</p>
							<div className="font-bold text-primary mb-1">
								₹{item.price}
							</div>
							<div className="flex items-center justify-center gap-2 mt-auto">
								<input
									type="number"
									min={1}
									value={quantities[item.id] || 1}
									onChange={(e) =>
										handleQuantityChange(
											item.id,
											Number(e.target.value) || 1
										)
									}
									className="w-12 sm:w-16 border rounded px-2 py-1 text-center text-sm"
									aria-label={`Quantity for ${item.name}`}
								/>
								<Button
									className="bg-green-400 text-white font-bold hover:bg-green-500 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-base cursor-pointer"
									onClick={() =>
										handleAddToCart({
											id: item.id,
											name: item.name,
											price: item.price,
											quantity: quantities[item.id] || 1,
										})
									}
								>
									Add to Cart
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="w-full flex justify-center">
				<div className="relative w-full max-w-3xl">
					<Card className="border-green-200 shadow-lg rounded-2xl px-4 sm:px-8 py-5 mb-10 flex flex-col items-center">
						<CardContent className="w-full flex flex-col items-center p-0">
							<div className="flex items-center gap-3 mb-2">
								<div className="bg-green-100 rounded-full p-3 flex items-center justify-center">
									<span className="text-green-600 text-3xl">🚚</span>
								</div>
								<span className="font-extrabold text-green-700 text-xl sm:text-2xl tracking-tight">
									Free Delivery
								</span>
							</div>
							<div className="w-full flex flex-col sm:flex-row sm:justify-between gap-4 mt-2">
								{[
									{
										day: "Thursday",
										areas: "Brampton, Mississauga, Downtown Toronto",
									},
									{
										day: "Friday",
										areas: "Ajax, Whitby, Oshawa, Pickering",
									},
									{ day: "Saturday", areas: "Etobicoke, North York" },
									{
										day: "Sunday",
										areas: (
											<span>
												Scarborough, Markham{" "}
												<span className="text-red-400">
													(Until 407)
												</span>
											</span>
										),
									},
								].map(({ day, areas }, idx, arr) => (
									<div
										key={day}
										className="flex-1 flex flex-col items-center"
									>
										<span className="font-semibold text-green-700">
											{day}
										</span>
										<div className="flex flex-col text-gray-700 text-sm mt-1">
											{typeof areas === "string"
												? areas.split(", ").map((area, i, arr) => (
														<span key={area} className="">
															{area}
														</span>
												  ))
												: areas}
										</div>
										{idx < arr.length - 1 && (
											<div className="hidden sm:block w-px bg-green-200 mx-2" />
										)}
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
