"use client"

import type React from "react"
import { useState } from "react"
import LazyImage from "@/components/lazy-image"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    guestCount: "",
    cakeType: "",
    budget: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to send message")
      }
      setStatus({ ok: true, msg: "Thank you! Your inquiry was sent successfully." })
      // Optionally clear form
      setFormData({
        name: "",
        email: "",
        phone: "",
        eventType: "",
        eventDate: "",
        guestCount: "",
        cakeType: "",
        budget: "",
        message: "",
      })
    } catch (err: any) {
      setStatus({ ok: false, msg: err?.message || "Something went wrong. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-dadda-green-light">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Ready to create your dream cake? Get in touch with us to discuss your custom cake requirements.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <h2 className="text-3xl font-bold mb-6 text-brown-dark">Tell Us About Your Event</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-brown-dark mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-brown-dark mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-brown-dark mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="eventType" className="block text-sm font-medium text-brown-dark mb-2">
                      Event Type *
                    </label>
                    <select
                      id="eventType"
                      name="eventType"
                      required
                      value={formData.eventType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                    >
                      <option value="">Select Event Type</option>
                      <option value="wedding">Wedding</option>
                      <option value="birthday">Birthday Party</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="children">Children's Party</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="eventDate" className="block text-sm font-medium text-brown-dark mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      id="eventDate"
                      name="eventDate"
                      required
                      value={formData.eventDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="guestCount" className="block text-sm font-medium text-brown-dark mb-2">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      id="guestCount"
                      name="guestCount"
                      value={formData.guestCount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cakeType" className="block text-sm font-medium text-brown-dark mb-2">
                      Cake Type/Style
                    </label>
                    <input
                      type="text"
                      id="cakeType"
                      name="cakeType"
                      placeholder="e.g., 3-tier wedding cake, character cake"
                      value={formData.cakeType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-brown-dark mb-2">
                      Budget Range
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                    >
                      <option value="">Select Budget Range</option>
                      <option value="under-100">Under R100</option>
                      <option value="100-200">R1000 - R2000</option>
                      <option value="200-400">R300 - R4000</option>
                      <option value="400-600">R4000 - R6000</option>
                      <option value="over-600">Over R6000</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-brown-dark mb-2">
                    Additional Details
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Tell us more about your vision, flavors, colors, themes, or any special requirements..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                  ></textarea>
                </div>

                {status && (
                  <div
                    className={`rounded-lg px-4 py-3 text-sm ${
                      status.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {status.msg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full btn-primary flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <Send className="mr-2 h-5 w-5" />
                  {isSubmitting ? "Sending..." : "Send Inquiry"}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-md">
                <h3 className="text-2xl font-bold mb-6 text-brown-dark">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 text-dadda-red mr-3 mt-1" />
                    <div>
                      <h4 className="font-bold text-brown-dark">Visit Our Bakery</h4>
                      <p className="text-brown-medium">6814 Strawberry Street, Unit 2337 Villa Lanta Estate, Amandasig, 0182</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-6 w-6 text-dadda-red mr-3" />
                    <div>
                      <h4 className="font-bold text-brown-dark">Call Us</h4>
                      <a href="tel:++27 76 219 6675" className="text-brown-medium hover:text-dadda-green">
                      +27 76 219 6675
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-6 w-6 text-dadda-red mr-3" />
                    <div>
                      <h4 className="font-bold text-brown-dark">Email Us</h4>
                      <a
                        href="mailto:info@daddasconfectionery.com"
                        className="text-brown-medium hover:text-dadda-green"
                      >
                        info@daddasconfectionery.co.za
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-6 w-6 text-dadda-red mr-3 mt-1" />
                    <div>
                      <h4 className="font-bold text-brown-dark">Opening Hours</h4>
                      <div className="text-brown-medium">
                        <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                        <p>Saturday: 9:00 AM - 5:00 PM</p>
                        <p>Sunday: 10:00 AM - 4:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-md">
                <h3 className="text-2xl font-bold mb-4 text-brown-dark">Why Choose Dadda's?</h3>
                <ul className="space-y-3 text-brown-medium">
                  <li className="flex items-start">
                    <span className="text-dadda-green mr-2">✓</span>
                    Custom designs tailored to your vision
                  </li>
                  <li className="flex items-start">
                    <span className="text-dadda-green mr-2">✓</span>
                    Premium ingredients and fresh flavors
                  </li>
                  <li className="flex items-start">
                    <span className="text-dadda-green mr-2">✓</span>
                    Professional consultation and design service
                  </li>
                  <li className="flex items-start">
                    <span className="text-dadda-green mr-2">✓</span>
                    Timely delivery and setup available
                  </li>
                  <li className="flex items-start">
                    <span className="text-dadda-green mr-2">✓</span>
                    Competitive pricing with no hidden fees
                  </li>
                </ul>
              </div>

              <div className="relative h-64 rounded-2xl overflow-hidden"> 
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3436.7833614499623!2d28.087341075204066!3d-25.671944077408362!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ebfd74a6f3d5897%3A0x60c92cf996fd6970!2s2337%2C%206814%20Strawberry%20St%2C%20Hartebeesthoek%20303-Jr%2C%20Akasia%2C%200182!5e1!3m2!1sen!2sza!4v1754910175891!5m2!1sen!2sza" width="600" height="450" className="w-full h-full"  loading="lazy" ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
