import { Card, CardContent } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import "../styles/theme.css";
import { useEffect, useState, useRef } from "react";
import { capitalize } from "@/lib/utils/commonFunctions";

const testimonials: { quote: string; name: string; rating?: number; time?: string }[] = [
	{
		quote: "Absolutely delicious! The best food experience I've had in years.",
		name: "Priya S.",
	},
	{
		quote: "Amazing service and mouth-watering dishes. Highly recommend!",
		name: "Rahul K.",
	},
	{
		quote: "A true taste of tradition with a modern twist.",
		name: "Meera D.",
	},
];

export default function TestimonialsSection() {
	const [reviews, setReviews] = useState([]);
	const [expandedCards, setExpandedCards] = useState(new Set());
	const plugin = useRef(
		Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: false })
	);

	const toggleExpanded = (index: number) => {
		const newExpandedCards = new Set(expandedCards);
		if (newExpandedCards.has(index)) {
			newExpandedCards.delete(index);
		} else {
			newExpandedCards.add(index);
		}
		setExpandedCards(newExpandedCards);
	};

	const truncateText = (text: string, maxLength: number = 150) => {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength).trim() + "...";
	};
	useEffect(() => {
		fetch("/api/google-reviews")
			.then((res) => {
				if (!res.ok) return { reviews: [] };
				return res.json();
			})
			.then((data) => {
				if (data && data.reviews) setReviews(data.reviews);
			})
			.catch(() => setReviews([]));
	}, []);

	const testimonialsToShow = reviews.length > 0 ? reviews : testimonials;

	return (
		<section className="relative py-20 bg-gradient-to-br from-gold-light/60 via-white/90 to-gold-light/60 overflow-hidden">
			<div
				className="absolute inset-0 pointer-events-none select-none opacity-30"
				aria-hidden
			>
				<svg
					width="100%"
					height="100%"
					viewBox="0 0 800 400"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<ellipse
						cx="400"
						cy="200"
						rx="380"
						ry="120"
						fill="#FFD700"
						fillOpacity="0.08"
					/>
				</svg>
			</div>
			<div className="container mx-auto text-center mb-12 relative z-10">
				<h2
					className="text-4xl sm:text-5xl font-extrabold mb-4 font-cursive drop-shadow"
					style={{
						background: "var(--gradient-gold)",
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
						letterSpacing: "0.04em",
					}}
				>
					What Our Customers Say
				</h2>
				<p className="text-gold-dark text-lg font-medium mb-2">
					Real stories from our happy customers
				</p>
			</div>
			<div className="container mx-auto relative z-10">
				<Carousel 
					plugins={[plugin.current]} 
					className="w-full"
					opts={{
						align: "start",
						loop: true,
					}}
				>
					<CarouselContent className="-ml-4">
						{testimonialsToShow.map((t, idx) => {
							const isExpanded = expandedCards.has(idx);
							const shouldTruncate = t.quote.length > 150;
							const displayText = isExpanded || !shouldTruncate ? t.quote : truncateText(t.quote);

							return (
								<CarouselItem key={t.name + idx} className="pl-4 py-8 md:basis-1/3 basis-full">
									<Card
										className="bg-white/95 border-2 border-gold-light shadow-gold-lg rounded-2xl flex flex-col items-center p-0 transition-transform duration-200 hover:scale-105 hover:shadow-gold-lg/80 group h-[400px] w-full"
									>
										<CardContent className="flex flex-col items-center justify-between px-6 py-8 relative h-full w-full">
											<span className="absolute -top-6 left-1/2 -translate-x-1/2 text-gold text-4xl bg-white rounded-full shadow-gold-sm px-3 py-1">
												"
											</span>
											<div className="flex-1 flex flex-col justify-center items-center mt-4">
												<p className="italic mb-4 text-gold-dark text-base text-center leading-relaxed">
													{displayText}
												</p>
												{shouldTruncate && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => toggleExpanded(idx)}
														className="text-gold hover:text-gold-dark mb-4 text-sm"
													>
														{isExpanded ? "See less" : "See more"}
													</Button>
												)}
											</div>
											<div className="flex flex-col items-center">
												<div className="font-bold text-gold text-base font-cursive mb-2">
													- {capitalize(t.name)}
												</div>
												{typeof t.rating !== "undefined" && (
													<div className="text-gold-dark text-sm mb-1">
														Rating: {t.rating} ⭐
													</div>
												)}
												{typeof t.time !== "undefined" && (
													<div className="text-gray-500 text-xs">{t.time}</div>
												)}
											</div>
										</CardContent>
									</Card>
								</CarouselItem>
							);
						})}
					</CarouselContent>
					<CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-20" />
					<CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-20" />
				</Carousel>
			</div>
		</section>
	);
}
