"use client";
import Navbar from "../Navbar/Navbar";
import Image from "next/image";
import Years_Packages from "@/public/Years_Packages.svg";
import Filled_star from "@/public/Filled_star.svg";
import HomeIcon from "@/public/home_icon.svg";
import WorkIcon from "@/public/work_icon.svg";
import OfficeIcon from "@/public/office_icon.svg";
import { Star } from "lucide-react";
import Footer from "../Homepage/Footer";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function AllPackages() {
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    searchParams.get("plan") || null
  );
  const [showForm, setShowForm] = useState(false);

  const plansData = {
    basic: {
      name: "Basic Plan",
      price: "AED 20",
      stars: 1,
      included: [
        "Emergency and routine callouts",
        "24/7/365 helpline",
        "Unlimited emergency callouts for AC, electrical and plumbing failures",
        "Fix of faults during callouts",
        "20 mins emergency response",
        "6 hours non-emergency response",
      ],
    },
    standard: {
      name: "Standard Plan",
      price: "AED 150",
      stars: 2,
      included: [
        "1×/year AC service & maintenance",
        "1×/year electrical service",
        "1×/year plumbing service",
        "Emergency & routine callouts",
        "Unlimited emergency callouts",
        "AC, electrical & plumbing failures",
        "Fix of faults during callouts",
        "20 mins emergency response",
        "6 hours non-emergency response",
        "Home maintenance inspection",
        "Additional services/benefits",
      ],
    },
    executive: {
      name: "Executive Plan",
      price: "AED 150",
      stars: 3,
      included: [
        "Unlimited emergency callouts",
        "AC, electrical, plumbing failures",
        "Fix of faults during callouts",
        "Routine AC, electrical, plumbing",
        "20 mins emergency response",
        "6 hours non-emergency response",
        "Home maintenance inspection",
        "Additional services/benefits",
        "Contracts (limited as per signed contract)",
      ],
    },
  };

  const currentPlan = selectedPlan
    ? plansData[selectedPlan as keyof typeof plansData]
    : null;

  const [showAddressList, setShowAddressList] = useState(false);

  // FORM DATA
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    countryCode: "+971",
    emirate: "",
    address: "",
    category: "Residential",
    propertyType: "",
    terms: false,
  });

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const valid = !!(
      formData.fullName &&
      formData.email &&
      formData.mobile &&
      formData.emirate &&
      formData.address &&
      formData.propertyType &&
      formData.terms
    );
    setIsFormValid(valid);
  }, [formData]);

  const getPropertyTypes = (category: string) => {
    if (category === "Residential") {
      return [
        "Apartment 2-3 rooms",
        "Apartment 3-4 rooms",
        "Apartment +4 rooms",
        "Studio -1 room",
        "Penthouse 5 rooms",
        "Loft 2 rooms",
        "Duplex 3 rooms",
        "Bungalow 2 rooms",
        "Villa 6 rooms",
      ];
    }
    return [
      "Office Space",
      "Retail Store",
      "Warehouse",
      "Restaurant",
      "Hotel",
    ];
  };

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({ ...prev, category, propertyType: "" }));
  };

  const handleGetStarted = (planKey: string) => {
    setSelectedPlan(planKey);
    setShowForm(true);
    setFormData({
      fullName: "",
      email: "",
      mobile: "",
      countryCode: "+971",
      emirate: "",
      address: "",
      category: "Residential",
      propertyType: "",
      terms: false,
    });
  };

  const getButtonClass = (planName: string) => {
    const normalizedPlan = planName.toLowerCase().replace(" plan", "");
    return selectedPlan === normalizedPlan
      ? "w-full bg-primary text-white py-2 rounded-lg hover:bg-primary transition mt-6"
      : "w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition mt-6";
  };

  const renderStars = (filled: number) => (
    <div className="relative w-16 h-12 mb-2">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 w-6 h-6 flex items-center justify-center">
        {filled >= 1 ? (
          <Image src={Filled_star} alt="star" className="w-6 h-6" />
        ) : (
          <Star className="w-6 h-6 stroke-primary" />
        )}
      </div>
      <div className="absolute bottom-0 left-1/4 -translate-x-3 w-6 h-6 flex items-center justify-center">
        {filled >= 2 ? (
          <Image src={Filled_star} alt="star" className="w-6 h-6" />
        ) : (
          <Star className="w-6 h-6 stroke-primary" />
        )}
      </div>
      <div className="absolute bottom-0 right-1/4 translate-x-3 w-6 h-6 flex items-center justify-center">
        {filled >= 3 ? (
          <Image src={Filled_star} alt="star" className="w-6 h-6" />
        ) : (
          <Star className="w-6 h-6 stroke-primary" />
        )}
      </div>
    </div>
  );

  // ✅ FORM LAYOUT
  if (showForm && currentPlan) {
    return (
      <div className="bg-white">
        <div className="p-2">
          <Navbar />
        </div>

        <Image
          src={Years_Packages}
          alt="Years Packages"
          width={500}
          height={300}
          className="w-full h-auto"
        />

        <div className="px-4 md:px-10 lg:px-20 py-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* LEFT */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">
              Package Details - {currentPlan.name}
            </h2>

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
                  onChange={(e) =>
                    handleInputChange("email", e.target.value)
                  }
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
                    className="border rounded-l-lg p-2"
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
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Choose Emirate *
                </label>
                <select
                  value={formData.emirate}
                  onChange={(e) =>
                    handleInputChange("emirate", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select Emirate</option>
                  {emirates.map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ ADDRESS SELECTION */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Select Address *
              </label>

              {/* ✅ Dropdown */}
              <div
                onClick={() => setShowAddressList(!showAddressList)}
                className="w-full p-3 border rounded-lg flex justify-between items-center cursor-pointer"
              >
                <span>
                  {formData.address
                    ? formData.address
                    : "Select Address"}
                </span>
                <span>▼</span>
              </div>

              {/* ✅ Address Cards */}
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
                        handleInputChange("address", addr.label);
                        setShowAddressList(false);
                      }}
                    >
                      {/* Icon */}
                      <Image
                        src={addr.icon}
                        alt={addr.label}
                        width={26}
                        height={26}
                        className="mr-4 mt-1"
                      />

                      {/* Details */}
                      <div className="flex-1">
                        <h4 className="font-semibold">{addr.label}</h4>
                        <p className="text-gray-600 text-sm">
                          {addr.address}
                        </p>
                      </div>

                      {/* ✅ Styled Red Radio */}
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.address === addr.label
                              ? "border-primary"
                              : "border-gray-400"
                          }`}
                        >
                          {formData.address === addr.label && (
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Category
              </label>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={formData.category === "Residential"}
                    onChange={() =>
                      handleCategoryChange("Residential")
                    }
                    className="mr-2 h-2 w-2 appearance-none rounded-full border border-gray-400 
                    checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-1"
                  />
                  Residential
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={formData.category === "Commercial"}
                    onChange={() =>
                      handleCategoryChange("Commercial")
                    }
                    className="mr-2 h-2 w-2 appearance-none rounded-full border border-gray-400 
                    checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-1"
                  />
                  Commercial
                </label>
              </div>
            </div>

            {/* Property Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Choose Property Type *
              </label>

              <select
                value={formData.propertyType}
                onChange={(e) =>
                  handleInputChange("propertyType", e.target.value)
                }
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Property Type</option>
                {getPropertyTypes(formData.category).map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Terms */}
            <label className="flex items-center mb-6">
              <input
                type="checkbox"
                checked={formData.terms}
                onChange={(e) =>
                  handleInputChange("terms", e.target.checked)
                }
                className="mr-2"
              />
              <span className="text-sm">
                I accept the <span className="text-primary">Terms & Conditions</span> and <span className="text-primary">Privacy Policy</span>
              </span>
            </label>

            {/* Continue */}
           <div className="flex justify-end">
  <button
    disabled={!isFormValid}
    className={`w-[30%] py-3 rounded-lg font-medium transition ${
      isFormValid
        ? "bg-primary text-white hover:bg-primary"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }`}
  >
    Continue Payment
  </button>
</div>

          </div>

          {/* RIGHT SIDE */}
          <div className="bg-white max-h-max border rounded-xl p-4 shadow-sm">
            <div className="text-center mb-3">
              <h3 className="text-lg font-bold">
                {currentPlan.name} starts from
              </h3>

              <div className="flex items-center justify-center">
                <span className="text-xl font-bold mr-2">
                  {currentPlan.price}
                </span>
                {renderStars(currentPlan.stars)}
              </div>
            </div>

            <h4 className="font-semibold mb-2 text-sm">
              What's included:
            </h4>

            <ul className="text-xs text-gray-700 space-y-1 mb-4">
              {currentPlan.included.map((item, idx) => (
                <li key={idx} className="list-disc list-inside">
                  {item}
                </li>
              ))}
            </ul>

            <div className="text-right">
              <p className="text-base font-bold">Package Cost</p>
              <p className="text-xl font-bold text-primary">
                {currentPlan.price}/year
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // ✅ PACKAGE LIST PAGE (unchanged)
  return (
    <div className="bg-white">
      <div className="p-2">
        <Navbar />
      </div>

      <Image
        src={Years_Packages}
        alt="Years Packages"
        width={500}
        height={300}
        className="w-full h-auto"
      />

      <div className="text-center mt-10">
        <h2 className="text-primary font-semibold tracking-wide text-sm">
          Starting from
        </h2>
      </div>

      <div className="mt-6 px-4 md:px-10 lg:px-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* BASIC */}
        <div
          onClick={() => setSelectedPlan("basic")}
          className="border rounded-xl p-6 shadow-sm hover:shadow-lg transition bg-white cursor-pointer flex flex-col"
        >
          <div className="flex-1">
            <h3 className="text-left font-semibold">Basic Plan</h3>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold">AED 20</span>
              {renderStars(1)}
            </div>

            <h4 className="mt-4 font-semibold">What's included:</h4>
            <ul className="mt-3 text-sm text-gray-700 space-y-2 list-disc list-inside text-left">
              {plansData.basic.included.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGetStarted("basic");
            }}
            className={`${getButtonClass("Basic Plan")} mt-auto`}
          >
            Get Started
          </button>
        </div>

        {/* STANDARD */}
        <div
          onClick={() => setSelectedPlan("standard")}
          className="border rounded-xl p-6 shadow-sm hover:shadow-lg transition bg-white cursor-pointer flex flex-col"
        >
          <div className="flex-1">
            <h3 className="text-left font-semibold">Standard Plan</h3>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold">AED 150</span>
              {renderStars(2)}
            </div>

            <h4 className="mt-4 font-semibold">What's included:</h4>
            <ul className="mt-3 text-sm text-gray-700 space-y-2 list-disc list-inside text-left">
              {plansData.standard.included.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGetStarted("standard");
            }}
            className={getButtonClass("Standard Plan")}
          >
            Get Started
          </button>
        </div>

        {/* EXECUTIVE */}
        <div
          onClick={() => setSelectedPlan("executive")}
          className="border rounded-xl p-6 shadow-sm hover:shadow-lg transition bg-white cursor-pointer flex flex-col"
        >
          <div className="flex-1">
            <h3 className="text-left font-semibold">Executive Plan</h3>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold">AED 150</span>
              {renderStars(3)}
            </div>

            <h4 className="mt-4 font-semibold">What's included:</h4>
            <ul className="mt-3 text-sm text-gray-700 space-y-2 list-disc list-inside text-left">
              {plansData.executive.included.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGetStarted("executive");
            }}
            className={getButtonClass("Executive Plan")}
          >
            Get Started
          </button>
        </div>
      </div>

      <div className="h-16" />
      <Footer />
    </div>
  );
}
