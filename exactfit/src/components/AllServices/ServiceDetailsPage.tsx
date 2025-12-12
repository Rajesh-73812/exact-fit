"use client";

import { useState, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Navbar from "../Navbar/Navbar";
import Footer from "../Homepage/Footer";
import Image from "next/image";

export default function ServiceDetailsPage() {
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // slug (service identifier in path)
  const slug = pathname?.split("/").pop() || null;
  const serviceType = searchParams.get("type");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setTimeout(() => {
      setFormSubmitted(true);
    }, 600);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <div className="w-full bg-white">
        <div className="relative w-full h-[400px] overflow-hidden">
          <Image
            src="/civilworks_banner.jpg"
            alt="Service"
            layout="fill"
            objectFit="cover"
            className="brightness-75"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl font-semibold">Service Details</h1>
            <h2 className="text-2xl mt-2 capitalize">{slug?.replace(/-/g, " ")}</h2>

            {serviceType?.toLowerCase() === "enquiry" ? (
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 px-6 py-3 bg-[#E50914] rounded-full text-white font-medium hover:bg-[#c10811] transition"
              >
                Enquiry Now
              </button>
            ) : (
              <button
                className="mt-6 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition"
              >
                View Packages
              </button>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto py-16 px-6">
          <h3 className="text-xl font-semibold mb-4 text-[#E50914]">About This Service</h3>
          <p className="text-gray-700 leading-relaxed">
            Our team provides professional-level maintenance and service delivery to ensure
            optimal performance and satisfaction. Whether you need detailed inspection,
            repair, or full maintenance — we ensure the highest quality service at all times.
          </p>

          {serviceType?.toLowerCase() === "subscription" && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Available Packages</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Monthly Maintenance</li>
                <li>Quarterly Service Plan</li>
                <li>Annual Subscription</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* === Enquiry Form Modal === */}
      {showForm && !formSubmitted && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center overflow-y-auto py-8">
          <div className="bg-white rounded-2xl w-full max-w-5xl p-8 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-5 text-gray-600 hover:text-black text-lg"
            >
              ✕
            </button>

            <h2 className="text-2xl font-semibold text-[#E50914] mb-6">Enquiry Form</h2>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <input className="border p-2 rounded w-full" placeholder="Full Name / Company Name *" />
                <input className="border p-2 rounded w-full" placeholder="Email *" type="email" />
                <input className="border p-2 rounded w-full" placeholder="Phone Number *" />
                <input className="border p-2 rounded w-full" placeholder="Address *" />
                <textarea rows={3} className="border p-2 rounded w-full" placeholder="Message" />
                <button type="submit" className="w-full py-2 bg-[#E50914] text-white rounded hover:bg-[#c10811]">
                  Submit Enquiry
                </button>
              </div>

              <div className="space-y-4">
                <input className="border p-2 rounded w-full" placeholder="Service Interested In" defaultValue={slug?.replace(/-/g, " ")} />
                <input className="border p-2 rounded w-full" placeholder="Preferred Date" type="date" />
                <select className="border p-2 rounded w-full">
                  <option>Residential</option>
                  <option>Commercial</option>
                </select>
                <textarea rows={4} className="border p-2 rounded w-full" placeholder="Additional Information"></textarea>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === Success Popup === */}
      {formSubmitted && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-xl text-center">
            <div className="text-[#E50914] text-4xl mb-2">✓</div>
            <p className="font-semibold text-lg">Enquiry Submitted Successfully</p>
          </div>
        </div>
      )}
    </>
  );
}
