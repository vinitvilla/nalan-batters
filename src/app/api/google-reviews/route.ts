import type { NextRequest } from "next/server";

const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const PLACE_ID = "ChIJc38Hv9PP1IkROe9Up8p6BtM";

export async function GET(req: NextRequest) {
  if (!GOOGLE_PLACES_API_KEY) {
    return new Response(JSON.stringify({ reviews: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&key=${GOOGLE_PLACES_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
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
    const allReviews = data.result.reviews.map((r: any) => ({
      quote: r.text,
      name: r.author_name,
      rating: r.rating,
      time: r.relative_time_description,
    }));
    
    // Filter for top-rated reviews (4-5 stars) and sort by rating descendixng
    const topRatedReviews = allReviews
      .filter((review: any) => review.rating >= 4)
      .sort((a: any, b: any) => b.rating - a.rating);
    
    return new Response(JSON.stringify({ reviews: topRatedReviews }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ reviews: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
