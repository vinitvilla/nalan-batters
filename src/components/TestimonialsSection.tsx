
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
    quote: "Absolutely delicious! The best food experience I&apos;ve had in years.",
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
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full mb-4 sm:mb-6">
            <span className="text-2xl sm:text-3xl">💬</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-sm sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed px-2">
            Real stories from our happy customers who love our authentic batters
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-6">
              {testimonialsToShow.map((t, idx) => {
                const isExpanded = expandedCards.has(idx);
                const shouldTruncate = t.quote.length > 150;
                const displayText = isExpanded || !shouldTruncate ? t.quote : truncateText(t.quote);

                return (
                  <CarouselItem key={t.name + idx} className="pl-4 sm:pl-6 py-4 sm:py-8 md:basis-1/2 lg:basis-1/3 basis-full">
                    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100 h-full">
                      {/* Card Content */}
                      <div className="p-4 sm:p-8 h-full flex flex-col">
                        {/* Quote Icon */}
                        <div className="flex justify-center mb-6">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                            </svg>
                          </div>
                        </div>

                        {/* Quote text */}
                        <div className="flex-1 mb-6 text-center">
                          <p className="text-gray-700 text-lg leading-relaxed font-medium">
                            &quot;{displayText}&quot;
                          </p>
                          {shouldTruncate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(idx)}
                              className="text-orange-600 hover:text-orange-800 mt-3 text-sm font-medium"
                            >
                              {isExpanded ? "Show less" : "Read more"}
                            </Button>
                          )}
                        </div>

                        {/* Rating */}
                        {typeof t.rating !== "undefined" && (
                          <div className="flex justify-center mb-4">
                            <div className="flex text-amber-400 text-xl">
                              {[...Array(Math.floor(t.rating))].map((_, i) => (
                                <span key={i}>★</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Author info */}
                        <div className="text-center border-t border-gray-100 pt-6">
                          <div className="font-bold text-gray-900 text-lg mb-1">
                            {capitalize(t.name)}
                          </div>
                          {typeof t.time !== "undefined" && (
                            <div className="text-gray-500 text-sm">{t.time}</div>
                          )}
                          {typeof t.rating !== "undefined" && (
                            <div className="text-gray-600 text-sm mt-1">
                              {t.rating}/5 stars
                            </div>
                          )}
                        </div>

                        {/* Decorative bottom border */}
                        <div className="mt-6">
                          <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500 mx-auto"></div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {/* Navigation buttons */}
            <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 border-orange-200 hover:bg-orange-50 text-orange-700 shadow-lg" />
            <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 border-orange-200 hover:bg-orange-50 text-orange-700 shadow-lg" />
          </Carousel>
        </div>

        {/* Call to action */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-orange-200/50 shadow-lg">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Join Our Happy Customers!
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-600">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="text-amber-400 text-lg sm:text-2xl">★★★★★</span>
                <span className="font-semibold">4.9/5 Rating</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="text-lg sm:text-2xl">👥</span>
                <span className="font-semibold">1000+ Happy</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="text-lg sm:text-2xl">🚚</span>
                <span className="font-semibold">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
