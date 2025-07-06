const testimonials = [
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
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
        <p className="text-gray-600">Real stories from our happy customers</p>
      </div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t) => (
          <div className="bg-green-100 p-6 rounded-lg shadow" key={t.name}>
            <p className="italic mb-4 text-green-900">"{t.quote}"</p>
            <div className="font-bold text-green-800">- {t.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
