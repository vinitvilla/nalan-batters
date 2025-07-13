"use client";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { showAddToCartToast } from "@/components/CartToast";
import { useProductStore } from "@/store/productStore";
import { userStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfigStore } from "@/store/configStore";
import FreeDeliverySchedule from "@/components/FreeDeliverySchedule";
import { GoldButton } from "@/components/GoldButton";
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
			className="max-w-9xl mx-auto py-8 px-2 sm:px-8 text-center bg-gold-card  border-gold-light rounded-3xl shadow-gold-lg"
		>
			<h2
				className="text-4xl sm:text-5xl font-extrabold mb-3 sm:mb-6 font-cursive"
				style={{
					background: "var(--gradient-gold)",
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
					letterSpacing: "0.04em",
				}}
			>
				Quick Order
			</h2>
			<p className="text-gray-700 mb-8 text-lg sm:text-xl font-light max-w-2xl mx-auto">
				Get your favorite batters delivered to your doorstep!
			</p>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-12">
				{products.map((item) => (
					<Card
						className="shadow-gold-lg flex pt-0 flex-col border-0 bg-white/95 rounded-2xl transition-transform hover:scale-[1.04] hover:shadow-gold-lg duration-200 group relative overflow-hidden"
						key={item.id}
					>
						<div className="relative w-full h-44 sm:h-56 rounded-t-2xl overflow-hidden">
							{item.imageUrl && (
								<Image
									src={item.imageUrl}
									alt={item.name}
									fill
									className="object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
									style={{ objectPosition: "center" }}
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
									priority
								/>
							)}
							<div className="absolute top-2 right-2 bg-gold-light/80 text-gold-dark text-xs font-semibold px-3 py-1 rounded-full shadow-gold-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none">
								Bestseller
							</div>
						</div>
						<CardHeader>
							<CardTitle
								className="text-xl sm:text-2xl font-bold mb-1 font-cursive"
								style={{
									background: "var(--gradient-gold)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									letterSpacing: "0.04em",
								}}
							>
								{item.name}
							</CardTitle>
						</CardHeader>
						<CardContent className="text-center flex-1 flex flex-col">
							<p className="mb-3 sm:mb-4 text-gray-700 text-base sm:text-lg font-light min-h-[48px] line-clamp-2">
								{item.description}
							</p>
							<div className="font-bold text-gold-dark mb-2 text-lg tracking-wide">
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
									className="w-14 sm:w-20 border border-gold-light rounded px-2 py-1 text-center text-base bg-white/80 focus:border-gold focus:ring-gold-light shadow-sm transition-all duration-200 hover:border-gold"
									aria-label={`Quantity for ${item.name}`}
								/>
								<GoldButton
									className="text-sm sm:text-base shadow-gold-sm group-hover:scale-105 transition-transform duration-200"
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
						</CardContent>
					</Card>
				))}
			</div>

			{/* Unified luxury info section */}
			<div className="w-full flex flex-col sm:flex-row items-stretch justify-between gap-6 sm:gap-8 mx-auto bg-white/70 rounded-2xl shadow-gold-lg px-2 sm:px-6 py-6 sm:py-8">
				<div className="flex-1 flex items-stretch">
					<OpeningHours />
				</div>
				<div className="hidden sm:block w-px bg-gold-light mx-2 my-2 rounded-full" />
				<div className="flex-[2] flex items-stretch">
					<FreeDeliverySchedule deliverySchedule={deliverySchedule} />
				</div>
			</div>
		</section>
	);
}
