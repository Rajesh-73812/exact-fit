"use client";

import React, { useState } from "react";
import Image from "next/image";
import Navbar from "../Navbar/Navbar";
import Footer from "../Homepage/Footer";
import HomeIcon from "@/public/home_icon.svg";
import WorkIcon from "@/public/work_icon.svg";
import OfficeIcon from "@/public/office_icon.svg";
import { useRouter } from "next/navigation";

/**
 * Full updated CustomPackages.tsx
 * - Accordion (only one open at a time)
 * - Categories → sub-services with checkboxes
 * - Right summary: "No service Added" card when none selected
 * - Qty controls + remove
 * - Static data (Option 2 structure)
 */

type SelectedService = {
  id: string; // unique string id (category_subservice)
  name: string;
  price: number;
  qty: number;
  image?: string;
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

  // Static category -> sub services (Option 2)
  const categories = [
    {
      id: "ac-services",
      title: "AC Services",
      subServices: [
        {
          id: "mold-inspection",
          name: "Mold Inspection",
          price: 160,
          image: "/placeholder-mold.jpg",
        },
        {
          id: "data-center-cleaning",
          name: "Data Center Cleaning",
          price: 300,
          image: "/placeholder-data.jpg",
        },
        {
          id: "hvac-system-cleaning",
          name: "HVAC System Cleaning",
          price: 220,
          image: "/placeholder-hvac.jpg",
        },
      ],
    },
    {
      id: "special-cleaning",
      title: "Special Cleaning",
      subServices: [
        {
          id: "deep-cleaning",
          name: "Deep Cleaning",
          price: 200,
          image: "/placeholder-clean.jpg",
        },
        {
          id: "carpet-cleaning",
          name: "Carpet Cleaning",
          price: 120,
          image: "/placeholder-carpet.jpg",
        },
      ],
    },
    {
      id: "electrical-services",
      title: "Electrical Services",
      subServices: [
        {
          id: "wiring-repair",
          name: "Wiring Repair",
          price: 180,
          image: "/placeholder-electrical.jpg",
        },
        {
          id: "light-installation",
          name: "Light Installation",
          price: 90,
          image: "/placeholder-light.jpg",
        },
      ],
    },
    {
      id: "plumbing-services",
      title: "Plumbing Services",
      subServices: [
        {
          id: "pipe-repair",
          name: "Pipe Repair",
          price: 150,
          image: "/placeholder-plumbing.jpg",
        },
        {
          id: "drain-cleaning",
          name: "Drain Cleaning",
          price: 110,
          image: "/placeholder-drain.jpg",
        },
      ],
    },
  ];

  const emirates = [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Umm Al Quwain",
    "Ras Al Khaimah",
    "Fujairah",
  ];

  const savedAddresses = [
    {
      id: 1,
      label: "Home",
      address:
        "78 Spice Road, Banjara Hills, Hyderabad 500034, Telangana, India.",
      icon: HomeIcon,
    },
    {
      id: 2,
      label: "Work",
      address: "22 Baker Street, London, UK.",
      icon: WorkIcon,
    },
    {
      id: 3,
      label: "Office",
      address: "45 Corporate Way, New York, NY 10010, USA.",
      icon: OfficeIcon,
    },
  ];

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
    subId: string,
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
    return prev.map((s) =>
      s.id === id ? { ...s, qty: s.qty + delta } : s
    );
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

  const handlePayNow = () => {
    // replace with real payment flow
    console.log("Pay now clicked", {
      formData,
      categoryType,
      selectedServices,
      total,
    });
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
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="border rounded-xl p-4 flex items-start hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        handleInputChange("address", addr.address);
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
                        <p className="text-gray-600 text-sm">{addr.address}</p>
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
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Add Service *
              </label>

              {/* ✅ Main Dropdown */}
              <div
                onClick={() => setOpenMain(!openMain)} // ✅ updated
                className="w-full p-3 border rounded-lg flex justify-between items-center cursor-pointer"
              >
                <span>Select Service</span>
                <span>{openMain ? "▲" : "▼"}</span>
              </div>

              {/* ✅ Accordion inside main dropdown */}
              {openMain && ( // ✅ updated
                <div className="mt-3 border rounded-lg">
                  {categories.map((cat) => (
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

                      {/* ✅ Sub-services */}
                      {openCategory === cat.id && (
                        <div className="p-3 space-y-3">
                          {cat.subServices.map((sub) => {
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
                                      cat.id,
                                      sub.id,
                                      sub.name,
                                      sub.price,
                                      sub.image
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
                  ))}
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
            {/* When no services selected show the "No service Added" card (matching screenshot) */}
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
                      {/* ✅ top row: service name + close */}
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

                      {/* ✅ next line: price left, qty right */}
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
            {/* ✅ Show NO PAYMENT UI when nothing selected */}
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
    </div>
  );
}
