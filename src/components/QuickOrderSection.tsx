"use client";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoldButton } from "@/components/GoldButton";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { showAddToCartToast } from "@/components/CartToast";
import { useProductStore } from "@/store/productStore";
import { userStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfigStore } from "@/store/configStore";
import FreeDeliverySchedule from "@/components/FreeDeliverySchedule";
import OpeningHours from "./OpeningHours";
import "../styles/theme.css";

export default function QuickOrderSection() {
	const products = useProductStore((state) => state.products);
	const fetchProducts = useProductStore((state) => state.fetchProducts);
	const [quantities, setQuantities] = useState<{ [id: string]: number }>({});
	const addToCart = useCartStore((state) => state.addToCart);
	const user = userStore((state) => state.user);
	const router = useRouter();
	const { configs, loadConfig } = useConfigStore();

	// Fetch products and initialize quantities
	useEffect(() => {
		if (products.length === 0) fetchProducts();
		setQuantities(
			products.reduce(
				(acc, item) => ((acc[item.id] = 1), acc),
				{} as { [id: string]: number }
			)
		);
	}, [products.length]);

	// Load free delivery config
	useEffect(() => {
		loadConfig("freeDelivery");
	}, [loadConfig]);

	// Memoize delivery schedule for performance
	const deliverySchedule = useMemo(() => {
		if (!configs.freeDelivery || typeof configs.freeDelivery !== "object")
			return [];
		const dayOrder = [
			"Thursday",
			"Friday",
			"Saturday",
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
		];
		return dayOrder
			.map((day) => {
				const areasArr = configs.freeDelivery[day] || [];
				if (!areasArr.length) return undefined;
				return {
					day,
					areas: areasArr.length === 1 ? areasArr[0] : areasArr.join(", "),
				};
			})
			.filter((item): item is { day: string; areas: string } => Boolean(item));
	}, [configs.freeDelivery]);

	// Cart logic
	const handleAddToCart = (item: {
		id: string;
		name: string;
		price: number;
		quantity: number;
	}) => {
		if (!user) {
			toast("Let me pull out your cart, can I know who you are?");
			router.push("/signin");
			return;
		}
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
			className="py-16 sm:py-20 rounded-lg shadow-lg"
		>
			<div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="text-center mb-16">
					<div className="inline-flex items-center justify-center p-2 bg-orange-100 rounded-full mb-6">
						<span className="text-2xl">🛒</span>
					</div>
					<h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent"
						style={{ fontFamily: "'Dancing Script', cursive" }}>
						Quick Order
					</h2>
					<p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
						Fresh batters made with love, delivered to your doorstep. Order now for same-day delivery!
					</p>
				</div>

				{/* Products Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
					{products.map((item) => (
						<div
							className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100"
							key={item.id}
						>
							{/* Product Image */}
							<div className="relative w-full h-64 overflow-hidden">
								{item.imageUrl && (
									<Image
										src={item.imageUrl}
										alt={item.name}
										fill
										className="object-cover group-hover:scale-105 transition-transform duration-300"
										style={{ objectPosition: "center" }}
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
										priority
									/>
								)}

								{/* Overlay gradient */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

								{/* Popular badge */}
								<div className="absolute top-4 left-4 bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-lg">
									Popular
								</div>

								{/* Price tag */}
								<div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-900 text-lg font-bold px-3 py-2 rounded-xl shadow-lg">
									${item.price}
								</div>
							</div>

							{/* Product Content */}
							<div className="p-6">
								<h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
									{item.name}
								</h3>

								<p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2">
									{item.description}
								</p>

								{/* Quantity and Add to Cart */}
								<div className="flex items-center gap-3">
									<div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
										<button
											type="button"
											onClick={() => handleQuantityChange(item.id, Math.max(1, (quantities[item.id] || 1) - 1))}
											className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold transition-colors cursor-pointer"
										>
											-
										</button>
										<input
											id={`quantity-${item.id}`}
											type="number"
											min={1}
											value={quantities[item.id] || 1}
											onChange={(e) =>
												handleQuantityChange(
													item.id,
													Number(e.target.value) || 1
												)
											}
											className="w-16 text-center py-2 border-0 focus:ring-0 focus:outline-none font-semibold text-gray-900 cursor-pointer"
										/>
										<button
											type="button"
											onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 1) + 1)}
											className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold transition-colors cursor-pointer"
										>
											+
										</button>
									</div>
									<GoldButton
										className="flex-1 py-3 text-sm font-semibold shadow-lg transition-all duration-300 hover:shadow-xl"
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
									</GoldButton>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Enhanced info section */}
				<div className="flex flex-col lg:flex-row items-stretch justify-between gap-8">
					<div className="flex-1">
						<OpeningHours />
					</div>
					<div className="flex-[2]">
						<FreeDeliverySchedule deliverySchedule={deliverySchedule} />
					</div>
				</div>
			</div>
		</section>
	);
}
