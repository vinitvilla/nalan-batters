import logger, { logInfo, logWarn } from "@/lib/logger"

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const PLACE_ID = "ChIJc38Hv9PP1IkROe9Up8p6BtM";

interface GoogleReview {
  text: string;
  author_name: string;
  rating: number;
  relative_time_description: string;
}

interface Review {
  quote: string;
  name: string;
  rating: number;
  time: string;
}

export async function GET() {
  if (!GOOGLE_PLACES_API_KEY) {
    logWarn(logger, { endpoint: 'GET /api/google-reviews', action: 'missing_api_key' });
    return new Response(JSON.stringify({ reviews: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&key=${GOOGLE_PLACES_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      logWarn(logger, { endpoint: 'GET /api/google-reviews', action: 'google_api_error', status: response.status });
      return new Response(JSON.stringify({ reviews: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const data = await response.json();
    if (!data.result || !data.result.reviews) {
      return new Response(JSON.stringify({ reviews: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const allReviews = data.result.reviews.map((r: GoogleReview): Review => ({
      quote: r.text,
      name: r.author_name,
      rating: r.rating,
      time: r.relative_time_description,
    }));

    // Filter for top-rated reviews (4-5 stars) and sort by rating descending
    const topRatedReviews = allReviews
      .filter((review: Review) => review.rating >= 4)
      .sort((a: Review, b: Review) => b.rating - a.rating);

    logInfo(logger, { endpoint: 'GET /api/google-reviews', action: 'reviews_fetched', totalCount: allReviews.length, topRatedCount: topRatedReviews.length });
    return new Response(JSON.stringify({ reviews: topRatedReviews }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error({ endpoint: 'GET /api/google-reviews', action: 'reviews_fetch_failed', error: error instanceof Error ? error.message : 'Unknown error' });
    return new Response(JSON.stringify({ reviews: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
