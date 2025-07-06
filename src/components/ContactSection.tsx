import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_ADDRESS,
  CONTACT_LAT,
  CONTACT_LNG,
} from "@/constants/contact";

export default function ContactSection() {
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${CONTACT_LNG-0.01}%2C${CONTACT_LAT-0.01}%2C${CONTACT_LNG+0.01}%2C${CONTACT_LAT+0.01}&layer=mapnik&marker=${CONTACT_LAT},${CONTACT_LNG}`;

  return (
    <section id="contact" className="container mx-auto py-12 px-4 sm:px-0">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center">Contact Us</h2>
      <p className="text-gray-600 mb-8 text-center">
        Have questions or feedback? Reach out to us!
      </p>
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Form (Left) */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="message">Message</label>
                <Textarea
                  id="message"
                  rows={4}
                  required
                  placeholder="Type your message here..."
                />
              </div>
              <Button type="submit" className="w-full bg-green-400 text-white font-bold hover:bg-green-500">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
        {/* Contact Info (Right) */}
        <Card className="flex-1 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pl-0 pt-4 md:pt-0">
          <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2 text-green-700">Location</h3>
                <div className="w-full h-40 rounded-lg overflow-hidden mb-3">
                <iframe
                  title="Nalan Batters Location"
                  src={mapSrc}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
                </div>
              <div className="text-gray-700 text-sm">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_ADDRESS)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  {CONTACT_ADDRESS}
                </a>
              </div>
            </div>
            <div className="mb-2">
              <h3 className="font-semibold text-lg mb-1 text-green-700">Email</h3>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-green-600 hover:underline text-sm">
                {CONTACT_EMAIL}
              </a>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1 text-green-700">Phone</h3>
              <a
                href={`tel:${CONTACT_PHONE.replace(/[^+\d]/g, "")}`}
                className="text-green-600 hover:underline text-sm"
              >
                {CONTACT_PHONE}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
