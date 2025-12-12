"use client";

import { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Image from "next/image";
import CheckIcon from "@/public/checked_circle.svg";
import HeadphoneIcon from "@/public/Red_headphone.svg";
import HomeIcon from "@/public/home_icon.svg";
import Footer from "../Homepage/Footer";
import apiClient from "@/lib/apiClient";

/**
 * EmergencyServices.tsx
 * - Full file (updated): fully API-driven (addresses + services)
 * - No static fallback data except OPTIONAL_USER_ID (used when no auth token present)
 * - Keeps UI & styling unchanged
 * - Adds strict validation for starred fields:
 *   Full Name, Email, Mobile Number, Choose Emirates, Address, Add Service
 * - Shows field-level red error messages under inputs (and red border)
 */

const OPTIONAL_USER_ID = "492d20af-6f1b-44c6-9454-2cc827e3a4af";

type AddressType = {
  id: number;
  save_as_address_type?: string;
  location?: string;
  emirate?: string;
  area?: string;
  building?: string;
  appartment?: string;
  addtional_address?: string;
  raw?: any;
};

type ServiceItem = {
  id?: number | string;
  name: string;
};

type ServiceCategory = {
  id?: number | string;
  title: string;
  items: ServiceItem[];
};

type ErrorsType = {
  fullName?: string;
  email?: string;
  mobile?: string;
  emirate?: string;
  address?: string;
  service?: string;
};

export default function EmergencyServices() {
  const [selectedCategory, setSelectedCategory] = useState("Residential");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressList, setShowAddressList] = useState(false);

  // popup control now supports message + error flag (keeps same visuals)
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("Emergency Request Raised Successfully");
  const [popupIsError, setPopupIsError] = useState(false);

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
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  // services from API
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // field-level errors
  const [errors, setErrors] = useState<ErrorsType>({});

  useEffect(() => {
    fetchAddresses();
    fetchServices();
  }, []);

  /**
   * Fetch user details (to obtain addresses).
   * Uses OPTIONAL_USER_ID as query param if token/auth not present.
   */
  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const res = await apiClient.get(`/user/user-auth/V1/user-details?id=${OPTIONAL_USER_ID}`);
      const user = res?.data?.data ?? res?.data ?? null;

      // normalize possible shapes: user.addresses (array) OR user (array)
      let apiAddresses: any[] = [];
      if (Array.isArray(user?.addresses)) {
        apiAddresses = user.addresses;
      } else if (Array.isArray(user)) {
        // API returned array directly
        apiAddresses = user;
      } else if (user?.addresses && Array.isArray(user.addresses)) {
        apiAddresses = user.addresses;
      } else {
        apiAddresses = [];
      }

      const normalized = apiAddresses.map((a: any) => ({
        id: a.id,
        save_as_address_type: a.save_as_address_type,
        location: a.location,
        emirate: a.emirate,
        area: a.area,
        building: a.building,
        appartment: a.appartment,
        addtional_address: a.addtional_address,
        raw: a,
      }));

      setAddresses(normalized);
    } catch (err) {
      console.error("Failed to load addresses:", err);
      setAddresses([]); // no static fallback per request
    } finally {
      setAddressesLoading(false);
    }
  };

  /**
   * Fetch services/categories from backend.
   * Endpoint: user/dashboard/V1/get-all-services-sub-services
   * Normalizes common response shapes into ServiceCategory[].
   */
  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const res = await apiClient.get("user/dashboard/V1/get-all-services-sub-services"); // adjust endpoint if needed
      const data = res?.data?.data ?? res?.data ?? null;

      if (!Array.isArray(data)) {
        setServiceCategories([]);
        setServicesLoading(false);
        return;
      }

      const normalized: ServiceCategory[] = data.map((cat: any, idx: number) => {
        const title = cat.title || cat.name || cat.category || cat.category_name || `Category ${idx + 1}`;

        // determine items array from various keys
        let rawItems: any[] = [];
        if (Array.isArray(cat.items)) rawItems = cat.items;
        else if (Array.isArray(cat.services)) rawItems = cat.services;
        else if (Array.isArray(cat.sub_services)) rawItems = cat.sub_services;
        else if (Array.isArray(cat.children)) rawItems = cat.children;
        else if (Array.isArray(cat)) rawItems = cat; // improbable but safe

        const items: ServiceItem[] = rawItems.map((it: any) => {
          const name = it.name || it.title || it.service_name || it.sub_service_name || String(it);
          const id = it.id ?? it.sub_service_id ?? it._id ?? it.uuid ?? undefined;
          return { id, name };
        });

        return { id: cat.id ?? idx + 1, title, items };
      });

      setServiceCategories(normalized);
    } catch (err) {
      console.error("Failed to load services:", err);
      setServiceCategories([]); // no static fallback
    } finally {
      setServicesLoading(false);
    }
  };

  // when selecting an address, populate address fields and save id
  const handleAddressSelect = (addr: AddressType) => {
    const label = addr.save_as_address_type || addr.location || "Saved Address";
    setSelectedAddress(label);
    setSelectedAddressId(addr.id || null);

    if (addr.emirate) setEmirate(addr.emirate);
    setShowAddressList(false);

    // clear address error on selection
    setErrors((prev) => ({ ...prev, address: undefined }));
  };

  // set selected service (and auto-close)
  const handleServiceSelect = (serviceName: string) => {
    setSelectedService(serviceName);
    setExpandedService(null);

    // clear service error on selection
    setErrors((prev) => ({ ...prev, service: undefined }));
  };

  // builds service_id & sub_service_id for backend using dynamic categories
  const mapServiceToIds = (serviceName: string) => {
    for (let ci = 0; ci < serviceCategories.length; ci++) {
      const cat = serviceCategories[ci];
      const si = cat.items.findIndex((it) => it.name === serviceName || String(it.name) === String(serviceName));
      if (si !== -1) {
        // prefer item id if available
        const service_id = cat.id ?? ci + 1;
        const sub_service_id = cat.items[si].id ?? si + 1;
        return { service_id, sub_service_id };
      }
    }
    return { service_id: null, sub_service_id: null };
  };

  // field validation helper
  const validateFields = (): ErrorsType => {
    const e: ErrorsType = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName.trim()) e.fullName = "Full Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(email.trim())) e.email = "Enter a valid email";
    if (!mobile.trim()) e.mobile = "Mobile Number is required";
    else if (mobile.trim().length < 5) e.mobile = "Enter a valid mobile number";
    if (!emirate || !emirate.trim()) e.emirate = "Select an emirate";
    if (!selectedAddress && !selectedAddressId) e.address = "Select an address";
    if (!selectedService) e.service = "Select a service";

    return e;
  };

  // clear error on change helpers
  const onFullNameChange = (v: string) => {
    setFullName(v);
    if (errors.fullName) setErrors((p) => ({ ...p, fullName: undefined }));
  };
  const onEmailChange = (v: string) => {
    setEmail(v);
    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
  };
  const onMobileChange = (v: string) => {
    setMobile(v);
    if (errors.mobile) setErrors((p) => ({ ...p, mobile: undefined }));
  };
  const onEmirateChange = (v: string) => {
    setEmirate(v);
    if (errors.emirate) setErrors((p) => ({ ...p, emirate: undefined }));
  };

  // === UPDATED handleSubmit with strict validation and field-level errors ===
  const handleSubmit = async () => {
    const validationErrors = validateFields();
    setErrors(validationErrors);

    // if any error, focus on showing inline messages and prevent API call
    if (Object.keys(validationErrors).length > 0) {
      setPopupIsError(true);
      setPopupMessage("Please fix the highlighted fields");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 1800);
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
      const res = await apiClient.post(`/user/booking/V1/upsert-emergency/`, payload);
      if (res?.data?.success) {
        setPopupIsError(false);
        setPopupMessage("Emergency Request Raised Successfully");
        setShowPopup(true);
        // reset minimal fields (keep country code)
        setFullName("");
        setEmail("");
        setMobile("");
        setSelectedAddress("");
        setSelectedAddressId(null);
        setSelectedService("");
        setDescription("");
        setErrors({});
        setTimeout(() => setShowPopup(false), 1500);
      } else {
        console.error("Emergency API non-success:", res?.data);
        setPopupIsError(true);
        setPopupMessage("Failed to raise emergency request. Try again.");
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2000);
      }
    } catch (err) {
      console.error("upsertEmergency error:", err);
      setPopupIsError(true);
      setPopupMessage("Network error. Please try again later.");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    }
  };

  return (
    <div>
      <div className="p-4">
        <Navbar />
      </div>

      {/* Popup for both success & validation errors (visuals unchanged) */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-10 shadow-lg text-center">
            <Image src={CheckIcon} alt="check" className="w-10 h-10 mx-auto mb-4" />
            <p className="text-lg font-medium">{popupMessage}</p>
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
                className={`w-full border rounded-md px-3 py-2 mt-2 outline-none ${errors.fullName ? "border-red-500" : ""}`}
                value={fullName}
                onChange={(e) => onFullNameChange(e.target.value)}
                onBlur={() => {
                  if (!fullName.trim()) setErrors((p) => ({ ...p, fullName: "Full Name is required" }));
                }}
              />
              {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <input
                type="email"
                placeholder="abcd@gmail.com"
                className={`w-full border rounded-md px-3 py-2 mt-2 outline-none ${errors.email ? "border-red-500" : ""}`}
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                onBlur={() => {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!email.trim()) setErrors((p) => ({ ...p, email: "Email is required" }));
                  else if (!emailRegex.test(email.trim())) setErrors((p) => ({ ...p, email: "Enter a valid email" }));
                }}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Mobile + Emirates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Mobile Number *</label>
              <div className="flex gap-2 mt-2">
                <select
                  className={`border rounded-md px-2 py-2 text-sm ${errors.mobile ? "border-red-500" : ""}`}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  <option>+971</option>
                  <option>+91</option>
                </select>
                <input
                  type="text"
                  placeholder="9898998989"
                  className={`flex-1 border rounded-md px-3 py-2 outline-none ${errors.mobile ? "border-red-500" : ""}`}
                  maxLength={15}
                  value={mobile}
                  onChange={(e) => onMobileChange(e.target.value.replace(/\D/g, ""))}
                  onBlur={() => {
                    if (!mobile.trim()) setErrors((p) => ({ ...p, mobile: "Mobile Number is required" }));
                    else if (mobile.trim().length < 5) setErrors((p) => ({ ...p, mobile: "Enter a valid mobile number" }));
                  }}
                />
              </div>
              {errors.mobile && <p className="text-sm text-red-500 mt-1">{errors.mobile}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Choose Emirates *</label>
              <select
                className={`w-full border rounded-md px-3 py-2 mt-2 ${errors.emirate ? "border-red-500" : ""}`}
                value={emirate}
                onChange={(e) => onEmirateChange(e.target.value)}
                onBlur={() => {
                  if (!emirate || !emirate.trim()) setErrors((p) => ({ ...p, emirate: "Select an emirate" }));
                }}
              >
                <option>Dubai</option>
                <option>Abu Dhabi</option>
                <option>Sharjah</option>
              </select>
              {errors.emirate && <p className="text-sm text-red-500 mt-1">{errors.emirate}</p>}
            </div>
          </div>

          {/* Address Dropdown (API-driven) */}
          <div className="mb-4">
            <label className="text-sm font-medium">Address *</label>
            <div
              onClick={() => {
                setShowAddressList(!showAddressList);
                // clear address error when user opens list to select
                if (errors.address) setErrors((p) => ({ ...p, address: undefined }));
              }}
              className={`border rounded-md p-3 mt-2 flex justify-between items-center cursor-pointer ${errors.address ? "border-red-500" : ""}`}
            >
              <span className="text-sm text-gray-700">{selectedAddress ? selectedAddress : "Select Address"}</span>
              <span className="text-primary text-sm">▼</span>
            </div>

            {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}

            {showAddressList && (
              <div className="mt-3 space-y-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold">Saved Addresses</div>
                </div>

                {addressesLoading ? (
                  <div className="text-sm text-gray-500">Loading addresses...</div>
                ) : addresses.length === 0 ? (
                  <div className="text-sm text-gray-500">No saved addresses found.</div>
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

                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-3 ${
                          selectedAddress === (addr.save_as_address_type || addr.location) ? "border-primary" : "border-gray-400"
                        }`}
                      >
                        {selectedAddress === (addr.save_as_address_type || addr.location) && <div className="w-3 h-3 rounded-full bg-primary" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Service Dropdown (API-driven) */}
          <div className="mb-4">
            <label className="text-sm font-medium">Add Service *</label>
            <div className={`border rounded-md p-3 mt-2 ${errors.service ? "border-red-500" : ""}`}>
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedService(expandedService ? null : "main")}>
                <p className="text-sm text-gray-700">{selectedService ? selectedService : servicesLoading ? "Loading services..." : "Select Service"}</p>
                <span className="text-primary">{expandedService ? "▲" : "▼"}</span>
              </div>

              {expandedService && (
                <div className="mt-3 border-t pt-3 space-y-3">
                  {servicesLoading ? (
                    <div className="text-sm text-gray-500">Loading services...</div>
                  ) : serviceCategories.length === 0 ? (
                    <div className="text-sm text-gray-500">No services available.</div>
                  ) : (
                    serviceCategories.map((category, idx) => (
                      <div key={category.id ?? idx}>
                        <div
                          className="flex justify-between items-center text-sm font-medium cursor-pointer py-1"
                          onClick={() => setExpandedService(expandedService === category.title ? "main" : category.title)}
                        >
                          <span className="text-primary">{category.title}</span>
                          {category.items.length > 0 && <span className="text-primary">{expandedService === category.title ? "▲" : "▼"}</span>}
                        </div>

                        {expandedService === category.title &&
                          category.items.map((item, i) => (
                            <div key={item.id ?? i} className="flex items-center gap-2 pl-4 py-1 text-sm">
                              <input
                                type="radio"
                                name="service"
                                checked={selectedService === item.name}
                                onChange={() => handleServiceSelect(item.name)}
                                className="accent-primary"
                              />
                              <label>{item.name}</label>
                            </div>
                          ))}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {errors.service && <p className="text-sm text-red-500 mt-1">{errors.service}</p>}
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
