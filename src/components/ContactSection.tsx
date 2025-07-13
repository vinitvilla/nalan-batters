import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoldButton } from "@/components/GoldButton";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_ADDRESS,
  CONTACT_LAT,
  CONTACT_LNG,
} from "@/constants/contact";
import "../styles/theme.css";

export default function ContactSection() {
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${CONTACT_LNG-0.01}%2C${CONTACT_LAT-0.01}%2C${CONTACT_LNG+0.01}%2C${CONTACT_LAT+0.01}&layer=mapnik&marker=${CONTACT_LAT},${CONTACT_LNG}`;

  return (
    <section id="contact" className="relative py-20 bg-gradient-to-br from-gold-light/60 via-white/90 to-gold-light/60 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none select-none opacity-20"
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
      <div className="container mx-auto px-4 sm:px-0 relative z-10">
        <div className="text-center mb-12">
          <h2
            className="text-4xl sm:text-5xl font-extrabold mb-4 font-cursive drop-shadow"
            style={{
              background: "var(--gradient-gold)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.04em",
            }}
          >
            Contact Us
          </h2>
          <p className="text-gold-dark text-lg font-medium">
            Have questions or feedback? Reach out to us!
          </p>
        </div>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
          {/* Form (Left) */}
          <Card className="flex-1 bg-white/95 border-2 border-gold-light shadow-gold-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-gold font-cursive text-2xl">Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gold-dark" htmlFor="name">Name</label>
                  <Input
                    id="name"
                    type="text"
                    required
                    placeholder="Your Name"
                    className="border-gold-light focus:border-gold focus:ring-gold/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gold-dark" htmlFor="email">Email</label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@email.com"
                    className="border-gold-light focus:border-gold focus:ring-gold/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gold-dark" htmlFor="message">Message</label>
                  <Textarea
                    id="message"
                    rows={4}
                    required
                    placeholder="Type your message here..."
                    className="border-gold-light focus:border-gold focus:ring-gold/50"
                  />
                </div>
                <GoldButton 
                  type="submit" 
                  className="w-full"
                >
                  Send Message
                </GoldButton>
              </form>
            </CardContent>
          </Card>
          {/* Contact Info (Right) */}
          <Card className="flex-1 flex flex-col justify-center bg-white/95 border-2 border-gold-light shadow-gold-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-gold font-cursive text-2xl">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2 text-gold">Location</h3>
                  <div className="w-full h-40 rounded-lg overflow-hidden mb-3 border-2 border-gold-light">
                  <iframe
                    title="Nalan Batters Location"
                    src={mapSrc}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                  </div>
                <div className="text-gold-dark text-sm">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_ADDRESS)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:text-gold-dark hover:underline transition-colors"
                  >
                    {CONTACT_ADDRESS}
                  </a>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-1 text-gold">Email</h3>
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold hover:text-gold-dark hover:underline text-sm transition-colors">
                  {CONTACT_EMAIL}
                </a>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gold">Phone</h3>
                <a
                  href={`tel:${CONTACT_PHONE.replace(/[^+\d]/g, "")}`}
                  className="text-gold hover:text-gold-dark hover:underline text-sm transition-colors"
                >
                  {CONTACT_PHONE}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
