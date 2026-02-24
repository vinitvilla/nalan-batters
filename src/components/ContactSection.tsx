import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoldButton } from "@/components/GoldButton";
import { useState } from "react";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_ADDRESS,
  CONTACT_LAT,
  CONTACT_LNG,
} from "@/constants/contact";
import "../styles/theme.css";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${CONTACT_LNG - 0.01}%2C${CONTACT_LAT - 0.01}%2C${CONTACT_LNG + 0.01}%2C${CONTACT_LAT + 0.01}&layer=mapnik&marker=${CONTACT_LAT},${CONTACT_LNG}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: result.message || "Thank you for your message! We'll get back to you within 24 hours.",
        });
        // Clear form
        setFormData({ name: "", mobile: "", message: "" });
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Failed to send message. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl">📞</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent"
            style={{ fontFamily: "'Dancing Script', cursive" }}>
            Contact Us
          </h2>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-2">
            Have questions or feedback? We&apos;d love to hear from you!
          </p>
        </div>

        {/* Contact Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Form */}
          <Card className="bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                Send us a Message
              </CardTitle>
              <p className="text-gray-600 text-xs sm:text-sm">We&apos;ll get back to you within 24 hours</p>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-4 sm:p-6">
              {/* Status Message */}
              {submitStatus.type && (
                <div className={`mb-3 sm:mb-4 p-3 rounded-lg ${
                  submitStatus.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}>
                  <div className="flex items-center gap-2">
                    {submitStatus.type === "success" ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <p className="text-xs sm:text-sm font-medium">{submitStatus.message}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="space-y-2 sm:space-y-3 flex-1">
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your full name"
                    className="border border-orange-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 rounded-lg text-sm"
                    disabled={isSubmitting}
                  />
                  <Input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                    placeholder="+1 (555) 123-4567"
                    className="border border-orange-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 rounded-lg text-sm"
                    disabled={isSubmitting}
                  />
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    placeholder="Tell us how we can help you..."
                    className="border border-orange-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 rounded-lg text-sm flex-1 max-h-60"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mt-3 sm:mt-4">
                  <GoldButton
                    type="submit"
                    className="w-full text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      "Send Message"
                    )}
                  </GoldButton>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-4 sm:space-y-6">
            {/* Contact Details */}
            <Card className="bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                  Get in Touch
                </CardTitle>
                <p className="text-gray-600 text-xs sm:text-sm">Multiple ways to reach us</p>
              </CardHeader>

              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                {/* Phone */}
                <Card className="border border-orange-100 bg-orange-50">
                  <CardContent className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg shadow-lg flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">Phone</h4>
                      <a
                        href={`tel:${CONTACT_PHONE.replace(/[^+\d]/g, "")}`}
                        className="text-orange-600 hover:text-orange-800 transition-colors text-xs sm:text-sm font-medium cursor-pointer break-all"
                      >
                        {CONTACT_PHONE}
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Email */}
                <Card className="border border-amber-100 bg-amber-50">
                  <CardContent className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg shadow-lg flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">Email</h4>
                      <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-600 hover:text-amber-800 transition-colors text-xs sm:text-sm font-medium cursor-pointer break-all">
                        {CONTACT_EMAIL}
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card className="border border-yellow-100 bg-yellow-50">
                  <CardContent className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-lg flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">Location</h4>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_ADDRESS)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-600 hover:text-yellow-800 transition-colors text-xs sm:text-sm font-medium cursor-pointer break-all"
                      >
                        {CONTACT_ADDRESS}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map - Full Width */}
        <div className="mt-8 sm:mt-10">
          <Card className="py-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <CardContent className="p-0">
              <div className="w-full h-48 sm:h-64 lg:h-80">
                <iframe
                  title="Nalan Batters Location"
                  src={mapSrc}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action - Simplified */}
        <div className="text-center mt-8 sm:mt-10">
          <Card className="bg-white/80 backdrop-blur-sm border border-orange-200/50 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-gray-600">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="p-1 sm:p-1.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold">24/7 Support</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="p-1 sm:p-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold">Quick Response</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="p-1 sm:p-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold">Dedicated Care</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
