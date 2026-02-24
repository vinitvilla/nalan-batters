"use client";
import { useEffect, useState, useMemo } from "react";
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
import AvailableStores from "./AvailableStores";
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
	}, [products.length, fetchProducts]);

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
			className="py-12 sm:py-16 lg:py-20 rounded-lg shadow-lg"
		>
			<div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
				{
					products.length > 0 && (
						<div className="text-center mb-12 sm:mb-16">
							<div className="inline-flex items-center justify-center p-2 bg-orange-100 rounded-full mb-4 sm:mb-6">
								<span className="text-xl sm:text-2xl">🛒</span>
							</div>
							<h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent"
								style={{ fontFamily: "'Dancing Script', cursive" }}>
								Quick Order
							</h2>
							<p className="text-gray-600 text-sm sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed px-2">
								Fresh batters made with love. Order now for same-day delivery!
							</p>
						</div>
					)}

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
								{item.isPopular && (
									<div className="absolute top-4 left-4 bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-lg">
										Popular
									</div>
								)}

								{/* Price tag */}
								<div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-900 text-lg font-bold px-3 py-2 rounded-xl shadow-lg">
									${item.price}
								</div>
							</div>

							{/* Product Content */}
							<div className="p-4 sm:p-6">
								<h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
									{item.name}
								</h3>

								<p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 line-clamp-2">
									{item.description}
								</p>

								{/* Quantity and Add to Cart */}
								<div className="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:items-stretch sm:gap-3">
									{/* Quantity Selector */}
									<div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit">
										<button
											type="button"
											onClick={() => handleQuantityChange(item.id, Math.max(1, (quantities[item.id] || 1) - 1))}
											className="px-2 sm:px-3 py-2 sm:py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold transition-colors cursor-pointer text-sm h-10 sm:h-11"
										>
											−
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
											className="w-10 sm:w-12 sm:w-16 text-center py-2 border-0 focus:ring-0 focus:outline-none font-semibold text-gray-900 cursor-pointer text-sm"
										/>
										<button
											type="button"
											onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 1) + 1)}
											className="px-2 sm:px-3 py-2 sm:py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold transition-colors cursor-pointer text-sm h-10 sm:h-11"
										>
											+
										</button>
									</div>
									{/* Add to Cart Button */}
									<GoldButton
										className="w-full sm:flex-1 py-2.5 sm:py-3 text-sm sm:text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl h-11 sm:h-auto"
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
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-12 sm:mt-16">
					<div className="order-2 md:order-1">
						<OpeningHours />
					</div>
					<div className="order-2 md:order-1">
						<AvailableStores />
					</div>
					<div className="order-1 md:order-3 md:col-span-2 lg:col-span-1">
						<FreeDeliverySchedule deliverySchedule={deliverySchedule} />
					</div>
				</div>
			</div>
		</section>
	);
}
