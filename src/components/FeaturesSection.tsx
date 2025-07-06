import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: "🍽️",
    title: "Our Menu",
    desc: "Fresh, diverse, and delicious dishes for every palate.",
    btn: "View Menu",
  },
  {
    icon: "👩‍🍳",
    title: "About Us",
    desc: "Passionate chefs, authentic recipes, and a love for food.",
    btn: "Read More",
  },
  {
    icon: "📞",
    title: "Contact Us",
    desc: "Questions? We're here to help you anytime.",
    btn: "Get in Touch",
  },
];

export default function FeaturesSection() {
  return (
    <section className="container mx-auto py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
      {features.map((f) => (
        <Card className="text-center shadow-lg" key={f.title}>
          <CardHeader>
            <div className="mx-auto mb-2 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span role="img" aria-label={f.title.toLowerCase()}>{f.icon}</span>
            </div>
            <CardTitle>{f.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{f.desc}</p>
            <Button className="mt-4 bg-green-400 text-white font-bold hover:bg-green-500 cursor-pointer">{f.btn}</Button>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
