"use client"

import { useForm } from "react-hook-form"
import { useState } from "react"
import LazyImage from "@/components/lazy-image"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"

type FormData = {
  name: string
  email: string
  phone: string
  eventType: string
  eventDate: string
  guestCount: string
  cakeType: string
  budget: string
  message: string
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setStatus(null)
    setIsSubmitting(true)
    
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      const responseData = await res.json()
      
      if (!res.ok || !responseData?.success) {
        throw new Error(responseData?.error || "Failed to send message")
      }
      
      setStatus({ ok: true, msg: "Thank you! Your inquiry was sent successfully." })
      reset() // Reset form on success
      
    } catch (err: any) {
      setStatus({ 
        ok: false, 
        msg: err?.message || "Something went wrong. Please try again." 
      })
    } finally {
      setIsSubmitting(false)
    }
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
              
              {status && (
                <div className={`mb-6 p-4 rounded-lg ${status.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {status.msg}
                </div>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-brown-dark mb-2">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-brown-dark mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
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
                      {...register('phone')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="eventType" className="block text-sm font-medium text-brown-dark mb-2">
                      Type of Event
                    </label>
                    <select
                      id="eventType"
                      {...register('eventType')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                    >
                      <option value="">Select an event type</option>
                      <option value="wedding">Wedding</option>
                      <option value="birthday">Birthday</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="corporate">Corporate</option>
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
                      {...register('eventDate', { required: 'Event date is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                    />
                    {errors.eventDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.eventDate.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="guestCount" className="block text-sm font-medium text-brown-dark mb-2">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      id="guestCount"
                      {...register('guestCount')}
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
                      {...register('cakeType')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-brown-dark mb-2">
                      Budget Range
                    </label>
                    <select
                      id="budget"
                      {...register('budget')}
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
                    rows={4}
                    {...register('message', { required: 'Message is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dadda-green focus:border-transparent"
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-dadda-green hover:bg-dadda-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dadda-green ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-brown-dark">Get In Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-dadda-green-light p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-dadda-green" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-brown-dark">Our Location</h3>
                    <p className="mt-1 text-gray-600">
                      <a 
                        href="https://www.google.com/maps/place/2337,+6814+Strawberry+St,+Hartebeesthoek+303-Jr,+Akasia,+0182/@-25.6719441,28.0873411,1103m/data=!3m2!1e3!4b1!4m5!3m4!1s0x1ebfd74a6f3d5897:0x60c92cf996fd6970!8m2!3d-25.6719441!4d28.089916?entry=ttu&g_ep=EgoyMDI1MDgzMC4wIKXMDSoASAFQAw%3D%3D" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-dadda-green transition-colors"
                      >
                        6814 Strawberry Street, Unit 2337 Villa Lanta Estate, Amandasig, 0182
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-dadda-green-light p-3 rounded-full">
                    <Phone className="h-6 w-6 text-dadda-green" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-brown-dark">Phone</h3>
                    <p className="mt-1">
                      <a href="tel:+27762196675" className="text-gray-600 hover:text-dadda-green transition-colors">
                        +27 76 219 6675
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-dadda-green-light p-3 rounded-full">
                    <Mail className="h-6 w-6 text-dadda-green" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-brown-dark">Email</h3>
                    <p className="mt-1">
                      <a 
                        href="mailto:info@daddasconfectionery.com" 
                        className="text-gray-600 hover:text-dadda-green transition-colors"
                      >
                        info@daddasconfectionery.co.za
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-dadda-green-light p-3 rounded-full">
                    <Clock className="h-6 w-6 text-dadda-green" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-brown-dark">Business Hours</h3>
                    <p className="mt-1 text-gray-600">
                      Monday - Friday: 9:00 AM - 5:00 PM<br />
                      Saturday: 9:00 AM - 1:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="text-xl font-bold mb-4 text-brown-dark">Find Us On Social Media</h3>
                <div className="flex space-x-4">
                  <a 
                    href="https://www.facebook.com/daddasconfectionery" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-dadda-green hover:text-dadda-green-dark transition-colors"
                    aria-label="Facebook"
                  >
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a 
                    href="https://www.instagram.com/daddasconfectionery" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-dadda-green hover:text-dadda-green-dark transition-colors"
                    aria-label="Instagram"
                  >
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-96 w-full">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3586.071154272949!2d28.0873411!3d-25.6719441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ebfd74a6f3d5897%3A0x60c92cf996fd6970!2s2337%2C%206814%20Strawberry%20St%2C%20Hartebeesthoek%20303-Jr%2C%20Akasia%2C%200182!5e0!3m2!1sen!2sza!4v1620000000000!5m2!1sen!2sza"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title="Dadda's Confectionery Location"
        ></iframe>
      </section>
    </>
  )
}
