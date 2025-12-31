"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "../Navbar/Navbar";
import Footer from "../Homepage/Footer";
import HomeIcon from "@/public/home_icon.svg";
import WorkIcon from "@/public/work_icon.svg";
import OfficeIcon from "@/public/office_icon.svg";
import CheckIcon from "@/public/checked_circle.svg"; // Add this import; replace with actual path if needed
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

type SelectedService = {
  id: string; // unique string id (category_subservice)
  name: string;
  price: number;
  qty: number;
  image?: string;
};

type AddressApi = {
  id: number | string;
  save_as_address_type?: string;
  location?: string;
  emirate?: string;
  area?: string;
  building?: string;
  appartment?: string;
  addtional_address?: string;
  raw?: any;
};

type ApiSubService = {
  id?: string | number;
  name?: string;
  price?: number;
  image?: string;
};

type ApiCategory = {
  id?: string | number;
  title?: string;
  // various API shapes: items/services/sub_services/children
  items?: any[];
  services?: any[];
  sub_services?: any[];
  children?: any[];
};

export default function CustomPackages() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    countryCode: "+971",
    emirate: "",
    address: "",
    addressId: null as string | number | null,
  });

  const [categoryType, setCategoryType] = useState<
    "Residential" | "Commercial"
  >("Residential");

  // selected services list
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    []
  );

  // address dropdown
  const [showAddressList, setShowAddressList] = useState(false);

  // accordion state - only one open at a time (Option 1)
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openMain, setOpenMain] = useState(false);

  // API-driven categories (replaces static categories)
  const [categories, setCategories] = useState<
    { id: string; title: string; subServices: ApiSubService[] }[]
  >([]);

  // API-driven saved addresses (replaces static savedAddresses)
  const [savedAddresses, setSavedAddresses] = useState<
    { id: string | number; label: string; address: string; icon: any; emirate?: string }[]
  >([]);

  const [addressesLoading, setAddressesLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const emirates = [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Umm Al Quwain",
    "Ras Al Khaimah",
    "Fujairah",
  ];

  // -------------------------
  // Helper: read user id from JWT stored in localStorage
  // no fallback - return null if token missing or invalid
  // -------------------------
  const getUserIdFromLocalToken = () => {
    try {
      if (typeof window === "undefined") return null;
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!token) return null;
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const payload = parts[1];
      const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = decodeURIComponent(
        atob(b64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const obj = JSON.parse(decoded);
      return obj?.id || obj?.user_id || obj?.sub || null;
    } catch (e) {
      return null;
    }
  };

  // -------------------------
  // Fetch addresses & services on mount
  // -------------------------
  useEffect(() => {
    fetchAddresses();
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const userId = getUserIdFromLocalToken();
      if (!userId) {
        setSavedAddresses([]);
        return;
      }
      const res = await apiClient.get(
        `/user/user-auth/V1/user-details?id=${userId}`
      );
      const user = res?.data?.data ?? res?.data ?? null;

      // Prefill form from user data
      if (user) {
        setFormData((prev) => ({
          ...prev,
          fullName: user.fullname || prev.fullName,
          email: user.email || prev.email,
          mobile: user.mobile || prev.mobile,
        }));
      }

      let apiAddresses: any[] = [];
      if (Array.isArray(user?.addresses)) apiAddresses = user.addresses;
      else if (Array.isArray(user)) apiAddresses = user;
      else if (user?.addresses && Array.isArray(user.addresses))
        apiAddresses = user.addresses;
      else apiAddresses = [];

      // Map to savedAddresses structure expected by UI.
      // Use icons: Home, Work, Office for first 3 entries if label matches, else HomeIcon
      const mapped = apiAddresses.map((a: any, idx: number) => {
        const label =
          a.save_as_address_type || a.location || `Address ${idx + 1}`;
        const address = a.location || a.addtional_address || "";
        // pick icon heuristically
        let icon = HomeIcon;
        const lowLabel = String(label).toLowerCase();
        if (lowLabel.includes("work")) icon = WorkIcon;
        else if (lowLabel.includes("office")) icon = OfficeIcon;
        return {
          id: a.id ?? idx,
          label,
          address,
          icon,
          emirate: a.emirate,
        };
      });

      setSavedAddresses(mapped);
    } catch (err) {
      console.error("Failed to load addresses:", err);
      setSavedAddresses([]); // no static fallback per your request
    } finally {
      setAddressesLoading(false);
    }
  };

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const userId = getUserIdFromLocalToken();
      if (!userId) {
        setCategories([]);
        return;
      }
      const res = await apiClient.get(
        `user/dashboard/V1/get-all-services-sub-services?id=${userId}`
      );
      console.log(res, "responseeeeeeeeeeeeeeee");
      const data: any = res?.data?.data ?? res?.data ?? null;

      if (!Array.isArray(data)) {
        setCategories([]); // keep empty if unexpected shape
        setServicesLoading(false);
        return;
      }

      // Helper for price parsing
      const parseNumberOrNull = (v: any): number | null => {
        if (v === null || v === undefined || v === "") return null;
        // remove commas, trim, then parse
        const n = parseFloat(String(v).replace(/,/g, "").trim());
        return Number.isFinite(n) ? n : null;
      };

      // Normalize various possible shapes into { id, title, subServices[] }
      const normalized = data.map((cat: ApiCategory, idx: number) => {
        const title =
          (cat as any).title ||
          (cat as any).name ||
          (cat as any).category ||
          (cat as any).category_name ||
          `Category ${idx + 1}`;

        // find subservice array in known keys
        let rawItems: any[] = [];
        if (Array.isArray((cat as any).items)) rawItems = (cat as any).items;
        else if (Array.isArray((cat as any).services))
          rawItems = (cat as any).services;
        else if (Array.isArray((cat as any).sub_services))
          rawItems = (cat as any).sub_services;
        else if (Array.isArray((cat as any).children))
          rawItems = (cat as any).children;
        else rawItems = [];

        const subServices: ApiSubService[] = rawItems.map(
          (it: any, sidx: number) => {
            const name =
              it.name ||
              it.title ||
              it.sub_service_name ||
              it.service_name ||
              String(it);
            const id =
              it.id ??
              it.sub_service_id ??
              it._id ??
              it.uuid ??
              `s-${idx}-${sidx}`;
            // price may be present under various keys; fallback to 0
            const price =
              parseNumberOrNull(it.price) ??
              parseNumberOrNull(it.amount) ??
              parseNumberOrNull(it.cost) ??
              0;

            const image = it.image || it.icon || it.picture || undefined;
            return { id, name, price, image };
          }
        );

        return { id: (cat as any).id ?? `c-${idx}`, title, subServices };
      });

      setCategories(normalized);
    } catch (err) {
      console.error("Failed to load services:", err);
      setCategories([]); // no static fallback
    } finally {
      setServicesLoading(false);
    }
  };

  // -------------------------
  // Form handlers (unchanged UI)
  // -------------------------
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // toggle accordion category (only one open allowed)
  const toggleCategory = (categoryId: string) => {
    setOpenCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  // toggle subservice checkbox
  const handleToggleSubService = (
    categoryId: string,
    subId: string | number,
    name: string,
    price: number,
    image?: string
  ) => {
    const uniqueId = `${categoryId}__${subId}`;
    setSelectedServices((prev) => {
      const found = prev.find((p) => p.id === uniqueId);
      if (found) {
        // remove
        return prev.filter((p) => p.id !== uniqueId);
      }
      // add with qty 1
      return [...prev, { id: uniqueId, name, price, qty: 1, image }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setSelectedServices((prev) => {
      const item = prev.find((s) => s.id === id);
      if (!item) return prev;

      // if qty becomes 1 and user presses minus → remove it
      if (item.qty === 1 && delta === -1) {
        return prev.filter((s) => s.id !== id);
      }

      // normal qty update
      return prev.map((s) => (s.id === id ? { ...s, qty: s.qty + delta } : s));
    });
  };

  const removeService = (id: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== id));
  };

  const subtotal = selectedServices.reduce(
    (sum, s) => sum + s.price * s.qty,
    0
  );
  const discount = subtotal >= 500 ? 50 : 0;
  const taxes = 50;
  const total = subtotal - discount + taxes;

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupMessage("");
    setIsError(false);
    // Redirect on success after close
    if (!isError) {
      router.push("/subscription-success"); // Adjust route as needed
    }
  };

  const handlePayNow = async () => {
    // Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.mobile ||
      !formData.emirate ||
      !formData.addressId ||
      selectedServices.length === 0
    ) {
      setPopupMessage("Please fill all required fields and select at least one service.");
      setIsError(true);
      setShowPopup(true);
      return;
    }

    // Prepare body
    const today = new Date().toISOString().split("T")[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const body = {
      address_id: formData.addressId,
      start_date: today,
      payment_option: "yearly",
      end_date: endDate,
      total_price: total,
      service_id: null,
      services: selectedServices.map((s) => {
        const [service_id, subservice_id] = s.id.split("__");
        return {
          service_id,
          subservice_id,
          quantity: s.qty,
          unit_price: s.price,
        };
      }),
    };

    try {
      const res = await apiClient.post(
        `/user/user-subscription/V1/create-custom-subscription-plan`,
        body
      );
      if (res.data.success) {
        setPopupMessage("Subscription created successfully!");
        setIsError(false);
        setShowPopup(true);
      } else {
        setPopupMessage(res.data.message || "Failed to create subscription.");
        setIsError(true);
        setShowPopup(true);
      }
    } catch (err: any) {
      console.error(err);
      setPopupMessage(err.response?.data?.message || "Failed to create subscription.");
      setIsError(true);
      setShowPopup(true);
    }
  };

  return (
    <div className="bg-white">
      <div className="p-2">
        <Navbar />
      </div>

      <div className="px-4 md:px-10 lg:px-20 py-8">
        <button
          onClick={() => router.back()}
          className="text-primary font-semibold mb-6"
        >
          ← Custom Service
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* LEFT FORM */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            {/* Full Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Mobile + Emirate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mobile Number *
                </label>
                <div className="flex">
                  <select
                    value={formData.countryCode}
                    onChange={(e) =>
                      handleInputChange("countryCode", e.target.value)
                    }
                    className="border rounded-l-lg p-2 w-20"
                  >
                    <option>+971</option>
                    <option>+1</option>
                  </select>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) =>
                      handleInputChange("mobile", e.target.value)
                    }
                    className="flex-1 p-2 border rounded-r-lg"
                    maxLength={9}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Choose Emirates *
                </label>
                <select
                  value={formData.emirate}
                  onChange={(e) => handleInputChange("emirate", e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select</option>
                  {emirates.map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Select Address *
              </label>
              <div
                onClick={() => setShowAddressList(!showAddressList)}
                className="w-full p-3 border rounded-lg flex justify-between items-center cursor-pointer"
              >
                <span>{formData.address || "Select Address"}</span>
                <span>▼</span>
              </div>
              {showAddressList && (
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-bold">Saved Addresses</div>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg">
                      + Add New Address
                    </button>
                  </div>

                  {addressesLoading ? (
                    <div className="text-sm text-gray-500">
                      Loading addresses...
                    </div>
                  ) : savedAddresses.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No saved addresses found.
                    </div>
                  ) : (
                    savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="border rounded-xl p-4 flex items-start hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            address: addr.address,
                            addressId: addr.id,
                            emirate: addr.emirate || prev.emirate,
                          }));
                          setShowAddressList(false);
                        }}
                      >
                        <Image
                          src={addr.icon}
                          alt={addr.label}
                          width={26}
                          height={26}
                          className="mr-4 mt-1"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{addr.label}</h4>
                          <p className="text-gray-600 text-sm">
                            {addr.address}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-2 ${
                              formData.address === addr.address
                                ? "border-primary bg-primary"
                                : "border-gray-400"
                            }`}
                          >
                            {formData.address === addr.address && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Add Service *
              </label>

              {/* Main Dropdown */}
              <div
                onClick={() => setOpenMain(!openMain)}
                className="w-full p-3 border rounded-lg flex justify-between items-center cursor-pointer"
              >
                <span>Select Service</span>
                <span>{openMain ? "▲" : "▼"}</span>
              </div>

              {/* Accordion inside main dropdown */}
              {openMain && (
                <div className="mt-3 border rounded-lg">
                  {servicesLoading ? (
                    <div className="p-4 text-sm text-gray-500">
                      Loading services...
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">
                      No services available.
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <div key={cat.id} className="border-b last:border-b-0">
                        {/* Category Header */}
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50"
                        >
                          <div className="text-sm font-medium">{cat.title}</div>
                          <div className="text-sm">
                            {openCategory === cat.id ? "▲" : "▼"}
                          </div>
                        </button>

                        {/* Sub-services */}
                        {openCategory === cat.id && (
                          <div className="p-3 space-y-3">
                            {cat.subServices.map((sub: ApiSubService) => {
                              const uniqueId = `${cat.id}__${sub.id}`;
                              const checked = selectedServices.some(
                                (s) => s.id === uniqueId
                              );

                              return (
                                <div
                                  key={uniqueId}
                                  className="flex items-center justify-between py-2 pl-4 pr-2 border-b last:border-b-0"
                                >
                                  <span className="text-sm">{sub.name}</span>

                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      handleToggleSubService(
                                        String(cat.id),
                                        String(sub.id),
                                        String(sub.name),
                                        typeof sub.price === "number"
                                          ? sub.price
                                          : 0,
                                        sub.image
                                          ? String(sub.image)
                                          : undefined
                                      )
                                    }
                                    className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Category Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Category</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={categoryType === "Residential"}
                    onChange={() => setCategoryType("Residential")}
                    className="mr-2 h-2 w-2 appearance-none rounded-full border border-gray-400 
                    checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-1"
                  />
                  <span>Residential</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={categoryType === "Commercial"}
                    onChange={() => setCategoryType("Commercial")}
                    className="mr-2 h-2 w-2 appearance-none rounded-full border border-gray-400 
                    checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-1"
                  />
                  <span>Commercial</span>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT SUMMARY */}
          <div className="bg-white   p-4  space-y-4">
            {/* When no services selected show the "No service Added" card */}
            {selectedServices.length === 0 ? (
              <div className="flex items-center justify-center p-8 border rounded-xl h-64">
                <div className="text-center">
                  {/* red X circle */}
                  <div className="w-16 h-16    flex items-center justify-center mx-auto mb-3">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M6 6L18 18"
                        stroke="#F04438"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 18L18 6"
                        stroke="#F04438"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-600">No service Added</div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-85 border rounded-2xl shadow-sm p-3 overflow-y-auto">
                <h3 className="text-[16px] font-medium text-left">Services</h3>
                {selectedServices.map((sel) => (
                  <div
                    key={sel.id}
                    className="border-b pb-3 flex items-start space-x-3"
                  >
                    {/* image left same place */}
                    {sel.image ? (
                      <Image
                        src={sel.image}
                        alt={sel.name}
                        width={55}
                        height={55}
                        className="rounded"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-100 rounded" />
                    )}

                    <div className="flex-1">
                      {/* top row: service name + close */}
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium text-[14px]">
                          {sel.name}
                        </div>
                        <button
                          onClick={() => removeService(sel.id)}
                          className="text-gray-400 text-[20px] leading-none"
                        >
                          ×
                        </button>
                      </div>

                      {/* next line: price left, qty right */}
                      <div className="flex justify-between items-center">
                        <span className="text-primary text-[13px]">
                          {sel.price} AED
                        </span>

                        <div className="flex items-center border-2 border-primary rounded-full space-x-4">
                          <button
                            onClick={() => updateQty(sel.id, -1)}
                            className="px-2 text-primary "
                          >
                            -
                          </button>
                          <div className="text-primary">{sel.qty}</div>
                          <button
                            onClick={() => updateQty(sel.id, 1)}
                            className="px-2 text-primary "
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            {selectedServices.length === 0 ? null : (
              <>
                {/* Totals */}
                <div className="border-t pt-4 space-y-2 border rounded-2xl shadow-sm p-3">
                  <p className="font-bold text-[14px] border-b">
                    Payment Summery
                  </p>
                  <div className="flex text-[12px] justify-between border-b">
                    <span className="text-gray-500">Item Total</span>
                    <span>{subtotal} AED</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex text-[12px] justify-between border-b">
                      <span className="text-gray-500">Discount Applied</span>
                      <span>-{discount} AED</span>
                    </div>
                  )}

                  <div className="flex text-[12px] justify-between border-b">
                    <span className="text-gray-500">Taxes & Fees</span>
                    <span>{taxes} AED</span>
                  </div>

                  <div className="flex text-[12px] justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>{total} AED</span>
                  </div>
                </div>

                {/* Pay Now */}
                <button
                  onClick={handlePayNow}
                  className="w-full py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary"
                >
                  Pay Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Popup */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={handleClosePopup}
        >
          <div
            className="bg-white rounded-xl p-10 shadow-lg text-center max-w-md mx-4"
            onClick={(e) => e.stopPropagation()} // Prevent closing on inner click
          >
            {isError ? (
              // Error: Red X SVG (same as existing)
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 6L18 18"
                    stroke="#F04438"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 18L18 6"
                    stroke="#F04438"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : (
              // Success: CheckIcon
              <Image
                src={CheckIcon}
                alt="check"
                className="w-10 h-10 mx-auto mb-4"
              />
            )}
            <p className="text-lg font-medium">{popupMessage}</p>
            <button
              onClick={handleClosePopup}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}