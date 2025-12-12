"use client";

import { useState, useEffect, type FormEvent } from "react";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import type { CountryCode } from "libphonenumber-js";

import Image from "next/image";
import Navbar from "../Navbar/Navbar";
import Footer from "../Homepage/Footer";
import Logo from "@/public/White_logo.png"; // your exact fit logo
import BannerImg from "@/public/Contactus_banner.svg"; // background banner image
import PhoneIcon from "@/public/Mobile_icon.svg";
import LocationIcon from "@/public/Location.svg";
import MailIcon from "@/public/Email_icon.svg";
import WebIcon from "@/public/web_icon.svg";

import apiClient from "@/lib/apiClient"; // axios instance

// 🔹 local helper: create contact us request
const createContactus = (data: {
  fullname: string;
  email: string;
  country_code: string;
  mobile: string;
  description: string;
  address: string;
}) => {
  // adjust path/version if your backend is different
  return apiClient.post("user/contactus/V1/create-contactus", data);
};

// 🔹 settings type
type Settings = {
  id?: number;
  support_mobile_number?: string;
  support_email?: string;
  contact_us_email?: string;
  contact_us_number?: string;
  website_address?: string;
  address: string;
};

// 🔹 local helper: get settings
const getSettings = () => {
  // adjust path/version if needed
  return apiClient.get("/admin/settings/V1/get-settings");
};

export default function ContactUs() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("AE");
  const [mobile, setMobile] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<null | { type: "success" | "error"; message: string }>(
    null
  );

  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(true);

  // ⬇️ fetch settings for left side details
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettings();
        const data = res.data?.data;
        const normalized = Array.isArray(data) ? data[0] : data;
        setSettings(normalized || null);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);

    const country_code = "+" + getCountryCallingCode(selectedCountry);

    try {
      setSubmitting(true);
      await createContactus({
        fullname,
        email,
        country_code,
        mobile,
        description,
        address,
      });

      setStatus({ type: "success", message: "Thank you! We will contact you shortly." });

      // reset form
      setFullname("");
      setEmail("");
      setMobile("");
      setAddress("");
      setDescription("");
      setSelectedCountry("AE");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to submit. Please try again.";
      setStatus({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white">
      {/* ✅ Navbar */}
      <div className="p-4">
        <Navbar />
      </div>

      {/* ✅ Banner Section */}
      <section className="relative w-full h-[380px] md:h-[420px]">
        <Image
          src={BannerImg}
          alt="Contact Banner"
          fill
          className="object-cover brightness-75"
        />
        {/* <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-white text-4xl md:text-5xl font-semibold">
            Contact Us
          </h1>
        </div> */}
      </section>

      {/* ✅ Contact Details + Form Section */}
      <section className="py-16 px-6 md:px-16 lg:px-24 bg-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
          {/* LEFT SIDE - Contact Info (from settings API) */}
          <div className="w-full lg:w-1/3 border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="bg-[#2B2B2B] rounded-lg px-4 py-3 w-full mb-8">
              <Image src={Logo} alt="Exact Fit Logo" width={300} height={300} />
            </div>

            <div className="space-y-5 text-[15px] text-gray-700">
              {/* Toll free / contact us number */}
              <div className="flex items-center gap-3">
                <Image src={PhoneIcon} alt="Phone" width={20} height={20} />
                <p>
                  <span className="text-black font-medium">Toll Free:</span>{" "}
                  {settingsLoading
                    ? "Loading..."
                    : settings?.contact_us_number || "+971 999999 99999"}
                </p>
              </div>

              {/* Address - still static (no field in settings model) */}
              <div className="flex items-start gap-3">
                <Image src={LocationIcon} alt="Location" width={20} height={20} />
                <p>
                  {settingsLoading
                    ? "Loading..."
                    : settings?.address || "31A Airport Road, Abu Dhabi"}
                </p>
              </div>

              {/* Contact us email */}
              <div className="flex items-center gap-3">
                <Image src={MailIcon} alt="Mail" width={20} height={20} />
                <p>
                  Mail us:{" "}
                  <span className="text-black">
                    {settingsLoading
                      ? "Loading..."
                      : settings?.contact_us_email || "efx@mail.com"}
                  </span>
                </p>
              </div>

              {/* Website address */}
              <div className="flex items-center gap-3">
                <Image src={WebIcon} alt="Website" width={20} height={20} />
                <p>
                  {settingsLoading
                    ? "Loading..."
                    : settings?.website_address || "www.efx.com"}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Contact Form */}
          <div className="w-full lg:w-2/3 border border-gray-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-[#E30613] text-xl font-semibold mb-6">
              Contact Us
            </h2>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Full Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#E30613]/30"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#E30613]/30"
                  />
                </div>
              </div>

              {/* Country Code + Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Country Code</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#E30613]/30"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value as CountryCode)}
                  >
                    {getCountries().map((country) => (
                      <option key={country} value={country}>
                        +{getCountryCallingCode(country as CountryCode)} ({country})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Mobile Number</label>
                  <input
                    type="text"
                    placeholder="Enter mobile number"
                    value={mobile}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setMobile(digits);
                    }}
                    className="w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#E30613]/30"
                    maxLength={9}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-gray-600">Description</label>
                <textarea
                  placeholder="Enter address details"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 mt-1 outline-none resize-none focus:ring-2 focus:ring-[#E30613]/30"
                />
              </div>

              {/* Status Message */}
              {status && (
                <p
                  className={`text-sm ${
                    status.type === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {status.message}
                </p>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#E30613] hover:bg-[#C70510] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-8 py-2 rounded-md transition-all"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ✅ Footer */}
      <Footer />
    </div>
  );
}
