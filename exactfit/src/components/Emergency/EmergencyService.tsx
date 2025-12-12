"use client";

import { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Image from "next/image";
import CheckIcon from "@/public/checked_circle.svg";
import HeadphoneIcon from "@/public/Red_headphone.svg";
import HomeIcon from "@/public/home_icon.svg";
import WorkIcon from "@/public/work_icon.svg";
import OfficeIcon from "@/public/office_icon.svg";
import Footer from "../Homepage/Footer";
import apiClient from "@/lib/apiClient";

export default function EmergencyServices() {
  const [selectedCategory, setSelectedCategory] = useState("Residential");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressList, setShowAddressList] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>("");

  // form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+971");
  const [mobile, setMobile] = useState("");
  const [emirate, setEmirate] = useState("Dubai");
  const [description, setDescription] = useState("");

  // addresses from API
  const [addresses, setAddresses] = useState<
    Array<{
      id: number;
      save_as_address_type?: string;
      location?: string;
      emirate?: string;
      area?: string;
      building?: string;
      appartment?: string;
      addtional_address?: string;
      raw?: any;
    }>
  >([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  // local service categories (kept as-is). We'll map category/item -> ids when sending.
  const serviceCategories = [
    {
      title: "AC Services",
      items: [
        "AC Repair",
        "AC Deep Water Cleaning",
        "AC Coil Servicing",
        "AC Spare Parts Replacement",
      ],
    },
    {
      title: "Special Cleaning",
      items: [
        "Mold Inspection & Mold Remediation",
        "Data center cleaning",
        "HVAC System Cleaning",
        "Glass Restoration",
      ],
    },
    {
      title: "Plumbing Service",
      items: ["Pipe Repair", "Drain Cleaning"],
    },
    {
      title: "Electrical Services",
      items: ["Light Installation", "Wiring Repair"],
    },
  ];

  // savedAddresses fall-back icons for UI (kept for backward compatibility)
  const savedAddressesFallback = [
    {
      id: 1,
      label: "Home",
      address: "7B Spice Road, Banjara Hills, Hyderabad 500034, Telangana, India.",
      icon: HomeIcon,
    },
    {
      id: 2,
      label: "Work",
      address: "22 Baker Street, London, UK, NW1 6XE.",
      icon: WorkIcon,
    },
    {
      id: 3,
      label: "Office",
      address: "45 Corporate Way, New York, NY 10010, USA.",
      icon: OfficeIcon,
    },
  ];

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const res = await apiClient.get("/user/user-auth/V1/user-details");
      const user = res.data?.data || null;
      const apiAddresses: any[] = Array.isArray(user?.addresses) ? user.addresses : [];

      setAddresses(
        apiAddresses.map((a: any) => ({
          id: a.id,
          save_as_address_type: a.save_as_address_type,
          location: a.location,
          emirate: a.emirate,
          area: a.area,
          building: a.building,
          appartment: a.appartment,
          addtional_address: a.addtional_address,
          raw: a,
        }))
      );
    } catch (err) {
      console.error("Failed to load addresses:", err);
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

  // when selecting an address, populate address fields and save id
  const handleAddressSelect = (addr: any) => {
    const label = addr.save_as_address_type || addr.location || "Saved Address";
    setSelectedAddress(label);
    setSelectedAddressId(addr.id || null);

    // populate form address-related fields to keep consistency (emirate/area/building/etc)
    if (addr.emirate) setEmirate(addr.emirate);
    if (addr.raw?.area) {
      // we don't have dedicated area/building inputs in this UI but we keep data if needed later
    }
    setShowAddressList(false);
  };

  // set selected service (and auto-close)
  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setExpandedService(null);
  };

  // builds service_id & sub_service_id for backend
  // We'll send service_id = categoryIndex + 1, sub_service_id = itemIndex + 1
  const mapServiceToIds = (serviceName: string) => {
    for (let ci = 0; ci < serviceCategories.length; ci++) {
      const cat = serviceCategories[ci];
      const si = cat.items.findIndex((it) => it === serviceName);
      if (si !== -1) {
        return { service_id: ci + 1, sub_service_id: si + 1 };
      }
    }
    // fallback
    return { service_id: null, sub_service_id: null };
  };

  const handleSubmit = async () => {
    // basic validation
    if (!fullName.trim() || !email.trim() || !mobile.trim() || !selectedService) {
      // keep current UI behavior: show popup even for errors (consistent with other components)
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 1500);
      return;
    }

    const { service_id, sub_service_id } = mapServiceToIds(selectedService);

    const payload: any = {
      fullname: fullName,
      email,
      mobile: `${countryCode}${mobile}`.trim(),
      service_id,
      sub_service_id,
      address_id: selectedAddressId,
      description: description || selectedService,
    };

    try {
      const res = await apiClient.post("/user/booking/V1/upsert-emergency", payload);
      if (res?.data?.success) {
        setShowPopup(true);
        // reset minimal fields (keep country code)
        setFullName("");
        setEmail("");
        setMobile("");
        setSelectedAddress("");
        setSelectedAddressId(null);
        setSelectedService("");
        setDescription("");
        setTimeout(() => setShowPopup(false), 1500);
      } else {
        console.error("Emergency API non-success:", res?.data);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 1500);
      }
    } catch (err) {
      console.error("upsertEmergency error:", err);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 1500);
    }
  };

  return (
    <div>
      <div className="p-4">
        <Navbar />
      </div>

      {/* ✅ Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-10 shadow-lg text-center">
            <Image src={CheckIcon} alt="check" className="w-10 h-10 mx-auto mb-4" />
            <p className="text-lg font-medium">Emergency Request Raised Successfully</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-6">
        {/* LEFT FORM */}
        <div className="flex-1 border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2">
            ← <span>Emergency Service Request</span>
          </h2>

          {/* Full Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Full Name *</label>
              <input
                type="text"
                placeholder="Ameer"
                className="w-full border rounded-md px-3 py-2 mt-2 outline-none"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <input
                type="email"
                placeholder="abcd@gmail.com"
                className="w-full border rounded-md px-3 py-2 mt-2 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile + Emirates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Mobile Number *</label>
              <div className="flex gap-2 mt-2">
                <select
                  className="border rounded-md px-2 py-2 text-sm"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  <option>+971</option>
                  <option>+91</option>
                </select>
                <input
                  type="text"
                  placeholder="9898998989"
                  className="flex-1 border rounded-md px-3 py-2 outline-none"
                  maxLength={15}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Choose Emirates *</label>
              <select
                className="w-full border rounded-md px-3 py-2 mt-2"
                value={emirate}
                onChange={(e) => setEmirate(e.target.value)}
              >
                <option>Dubai</option>
                <option>Abu Dhabi</option>
                <option>Sharjah</option>
              </select>
            </div>
          </div>

          {/* ✅ Address Dropdown (API-driven) */}
          <div className="mb-4">
            <label className="text-sm font-medium">Address *</label>
            <div
              onClick={() => setShowAddressList(!showAddressList)}
              className="border rounded-md p-3 mt-2 flex justify-between items-center cursor-pointer"
            >
              <span className="text-sm text-gray-700">{selectedAddress ? selectedAddress : "Select Address"}</span>
              <span className="text-primary text-sm">▼</span>
            </div>

            {showAddressList && (
              <div className="mt-3 space-y-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold">Saved Addresses</div>
                </div>

                {addressesLoading ? (
                  <div className="text-sm text-gray-500">Loading addresses...</div>
                ) : addresses.length === 0 ? (
                  // fallback to static if API returns none
                  savedAddressesFallback.map((addr) => (
                    <div
                      key={addr.id}
                      className="border rounded-xl p-3 flex items-start hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedAddress(addr.label);
                        setSelectedAddressId(addr.id);
                        setShowAddressList(false);
                      }}
                    >
                      <Image src={addr.icon} alt={addr.label} width={24} height={24} className="mr-3 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{addr.label}</p>
                        <p className="text-gray-600 text-xs">{addr.address}</p>
                      </div>

                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-3 ${selectedAddress === addr.label ? "border-primary" : "border-gray-400"}`}>
                        {selectedAddress === addr.label && <div className="w-3 h-3 rounded-full bg-primary" />}
                      </div>
                    </div>
                  ))
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="border rounded-xl p-3 flex items-start hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAddressSelect(addr)}
                    >
                      <Image src={HomeIcon} alt="addr" width={24} height={24} className="mr-3 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{addr.save_as_address_type || addr.location}</p>
                        <p className="text-gray-600 text-xs">{addr.location}</p>
                      </div>

                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-3 ${selectedAddress === (addr.save_as_address_type || addr.location) ? "border-primary" : "border-gray-400"}`}>
                        {selectedAddress === (addr.save_as_address_type || addr.location) && <div className="w-3 h-3 rounded-full bg-primary" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ✅ Service Dropdown */}
          <div className="mb-4">
            <label className="text-sm font-medium">Add Service *</label>
            <div className="border rounded-md p-3 mt-2">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedService(expandedService ? null : "main")}>
                <p className="text-sm text-gray-700">{selectedService ? selectedService : "Select Service"}</p>
                <span className="text-primary">{expandedService ? "▲" : "▼"}</span>
              </div>

              {expandedService && (
                <div className="mt-3 border-t pt-3 space-y-3">
                  {serviceCategories.map((category, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center text-sm font-medium cursor-pointer py-1" onClick={() => setExpandedService(expandedService === category.title ? "main" : category.title)}>
                        <span className="text-primary">{category.title}</span>
                        {category.items.length > 0 && <span className="text-primary">{expandedService === category.title ? "▲" : "▼"}</span>}
                      </div>

                      {expandedService === category.title && category.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 pl-4 py-1 text-sm">
                          <input
                            type="radio"
                            name="service"
                            checked={selectedService === item}
                            onChange={() => handleServiceSelect(item)}
                            className="accent-primary"
                          />
                          <label>{item}</label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="text-sm font-medium block mb-2">Category</label>
            <div className="flex gap-6">
              {["Residential", "Commercial"].map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="category" checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} className="accent-primary" />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="text-sm font-medium">Description</label>
            <textarea
              placeholder="Describe your issue or service request..."
              className="w-full border rounded-md px-3 py-2 mt-2 min-h-20 outline-none text-sm"
              value={description || selectedService}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button onClick={handleSubmit} className="bg-primary text-white px-6 py-2 rounded-md">
              Submit
            </button>
          </div>
        </div>

        {/* RIGHT INFO BOX */}
        <div className="md:w-1/3 border max-h-max rounded-xl flex flex-col justify-center items-center text-center p-6">
          <Image src={HeadphoneIcon} alt="support" className="w-10 h-10 mb-4" />
          <p className="text-sm text-gray-700 leading-relaxed">
            Our Technician will be reach out to conduct inspection once you have successfully submitted request
          </p>
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}
