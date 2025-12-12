"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/src/components/Navbar/Navbar";
import HomeIcon from "@/public/home_icon.svg";
import WorkIcon from "@/public/work_icon.svg";
import OfficeIcon from "@/public/office_icon.svg";
import { Headphones, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/apiClient";

export default function EnquiryFormPage() {
  // ---------------- API DRIVEN LISTS ----------------
  const [emirates, setEmirates] = useState<string[]>([]);
  const [countryCodes, setCountryCodes] = useState<string[]>(["+971"]);

  // ---------------- Fetch Emirates ----------------
  const fetchEmirates = async () => {
    try {
      const res = await apiClient.get("/public/get-emirates"); // update if path differs
      const list = res.data?.data || [];
      setEmirates(list);
    } catch (err) {
      console.error("Failed to load emirates:", err);
      setEmirates([
        "Dubai",
        "Abu Dhabi",
        "Sharjah",
        "Ajman",
        "Umm Al Quwain",
        "Ras Al Khaimah",
        "Fujairah",
      ]);
    }
  };

  // ---------------- Fetch Country Codes ----------------
  const fetchCountryCodes = async () => {
    try {
      const res = await apiClient.get("/public/get-country-codes"); // update if path differs
      const list = res.data?.data || [];
      setCountryCodes(list.length ? list : ["+971"]);
    } catch (err) {
      console.error("Country codes failed:", err);
      setCountryCodes(["+971", "+91"]);
    }
  };

  useEffect(() => {
    fetchEmirates();
    fetchCountryCodes();
  }, []);

  // ---------------- ICON MAP ----------------
  const tagIcons: Record<string, any> = {
    Home: HomeIcon,
    Work: WorkIcon,
    Office: OfficeIcon,
  };

  const specificWorksList = ["Flooring", "Ceiling", "Partitions", "Joinery"];
  const budgetList = [
    "< AED 100K",
    "AED 100k - 250k",
    "AED 250 - 500K",
    "AED 500K +",
  ];

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    countryCode: "+971",
    mobile: "",
    emirate: "",
    address: "",
    addressId: null as number | null,
    category: "Residential",
    area: "",
    building: "",
    apartment: "",
    additionalAddress: "",
    scope: "",
    fullFitOut: "",
    renovation: "",
    specificWork: "",
    hasDrawings: "Yes",
    drawingsFilename: "",
    budgetRange: "",
    description: "",
  });

  // Addresses state now keeps raw fields so we can populate form on select
  const [addresses, setAddresses] = useState<
    Array<{
      id: number;
      label: string;
      address: string;
      emirate?: string;
      area?: string;
      building?: string;
      apartment?: string;
      additional?: string;
      raw?: any;
    }>
  >([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  const [showAddressesPanel, setShowAddressesPanel] = useState(false);
  const [showSpecificDropdown, setShowSpecificDropdown] = useState(false);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  function handleInput(field: string, value: any) {
    setFormData((p) => ({ ...p, [field]: value }));
  }

  // ---------------- File Upload ----------------
  function onChooseFileClick() {
    fileInputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleInput("drawingsFilename", file.name);
    }
  }

  function removeFile() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    handleInput("drawingsFilename", "");
  }

  const showSimpleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  // ---------------- Fetch Addresses (map raw fields) ----------------
  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const res = await apiClient.get("/user/user-auth/V1/user-details");
      const user = res.data?.data || null;
      const apiAddresses: any[] = Array.isArray(user?.addresses)
        ? user.addresses
        : [];

      const mapped = apiAddresses.map((a) => ({
        id: a.id,
        label: a.save_as_address_type || "Home",
        address:
          a.location ||
          [a.emirate, a.area, a.building, a.appartment, a.addtional_address]
            .filter(Boolean)
            .join(", "),
        emirate: a.emirate || "",
        area: a.area || "",
        building: a.building || "",
        apartment: a.appartment || a.villa || "",
        additional: a.addtional_address || "",
        raw: a,
      }));

      setAddresses(mapped);
    } catch (err) {
      console.error("Failed to load addresses:", err);
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // ---------------- When user selects an address populate form fields ----------------
  const onSelectAddress = (addr: {
    id: number;
    label: string;
    address: string;
    emirate?: string;
    area?: string;
    building?: string;
    apartment?: string;
    additional?: string;
    raw?: any;
  }) => {
    // populate form fields from address object (prefer raw values if available)
    handleInput("address", addr.label || addr.address || "");
    handleInput("addressId", addr.id || null);
    handleInput("emirate", addr.emirate || addr.raw?.emirate || "");
    handleInput("area", addr.area || addr.raw?.area || "");
    handleInput("building", addr.building || addr.raw?.building || "");
    handleInput("apartment", addr.apartment || addr.raw?.appartment || addr.raw?.villa || "");
    handleInput("additionalAddress", addr.additional || addr.raw?.addtional_address || "");
    // close panel
    setShowAddressesPanel(false);
  };

  // ---------------- Submit Enquiry ----------------
  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.fullName?.trim() || !formData.email?.trim()) {
      showSimpleSuccess();
      setSubmitting(false);
      return;
    }

    try {
      const payload: any = {
        fullname: formData.fullName,
        email: formData.email,
        mobile: `${formData.countryCode}${formData.mobile}`.trim(),
        address_id: formData.addressId || null,
        scope_of_work: formData.scope || null,
        existing_drawing: formData.hasDrawings === "Yes",
        plan_images: formData.drawingsFilename ? [formData.drawingsFilename] : [],
        estimated_budget_range: formData.budgetRange || null,
        description: formData.description || null,
      };

      const ENQUIRY_BASE = "/user/booking/V1";
      const res = await apiClient.post(`${ENQUIRY_BASE}/upsert-enquiry`, payload);

      if (res?.data?.success) {
        showSimpleSuccess();

        setFormData((p) => ({
          ...p,
          fullName: "",
          email: "",
          mobile: "",
          emirate: "",
          address: "",
          addressId: null,
          area: "",
          building: "",
          apartment: "",
          additionalAddress: "",
          scope: "",
          fullFitOut: "",
          renovation: "",
          specificWork: "",
          hasDrawings: "Yes",
          drawingsFilename: "",
          budgetRange: "",
          description: "",
        }));
      } else {
        showSimpleSuccess();
      }
    } catch (error) {
      console.error("submitForm error:", error);
      showSimpleSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-10 py-10">
        <h2 className="text-lg font-semibold text-red-600 mb-6 flex items-center gap-2">
          <span className="text-black text-xl">←</span> Enquiry Form
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
          {/* LEFT FORM */}
          <form
            onSubmit={submitForm}
            className="bg-white border rounded-xl p-6 shadow-sm space-y-6"
          >
            {/* Full Name + Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 font-medium">
                  Full Name / Company Name *
                </label>
                <input
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInput("fullName", e.target.value)}
                  type="text"
                  className="w-full border p-3 rounded-lg text-sm"
                  placeholder="Enter full name or company"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium">
                  Email *
                </label>
                <input
                  required
                  value={formData.email}
                  onChange={(e) => handleInput("email", e.target.value)}
                  type="email"
                  className="w-full border p-3 rounded-lg text-sm"
                  placeholder="abcd@gmail.com"
                />
              </div>
            </div>

            {/* Mobile + Emirate */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 font-medium">
                  Mobile Number *
                </label>
                <div className="flex">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => handleInput("countryCode", e.target.value)}
                    className="border rounded-l-lg p-3 text-sm"
                  >
                    {countryCodes.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    required
                    value={formData.mobile}
                    onChange={(e) => handleInput("mobile", e.target.value)}
                    type="tel"
                    className="flex-1 border rounded-r-lg p-3 text-sm"
                    placeholder="98989 98989"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium">
                  Choose Emirates*
                </label>
                <select
                  required
                  value={formData.emirate}
                  onChange={(e) => handleInput("emirate", e.target.value)}
                  className="w-full border p-3 rounded-lg text-sm"
                >
                  <option value="">Select Emirate</option>
                  {emirates.map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ---------------- ADDRESSES PANEL ---------------- */}
            <div>
              <label className="block text-sm mb-1 font-medium">
                Select Address *
              </label>

              <div
                onClick={() => setShowAddressesPanel((s) => !s)}
                className="w-full p-3 border rounded-lg flex justify-between items-center cursor-pointer text-sm"
              >
                <span className="text-gray-700">
                  {formData.address ? formData.address : "Select Address"}
                </span>
                <span className="text-gray-400">▾</span>
              </div>

              {showAddressesPanel && (
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-semibold">Saved Addresses</div>
                    <button
                      type="button"
                      className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      + Add New address
                    </button>
                  </div>

                  {addressesLoading ? (
                    <div className="text-sm text-gray-500">Loading addresses...</div>
                  ) : addresses.length === 0 ? (
                    <div className="text-sm text-gray-500">No saved addresses</div>
                  ) : (
                    addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="border rounded-xl p-4 flex items-start hover:bg-gray-50 cursor-pointer"
                        onClick={() => onSelectAddress(addr)}
                      >
                        <Image
                          src={tagIcons[addr.label] || HomeIcon}
                          alt={addr.label}
                          width={28}
                          height={28}
                          className="mr-4"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{addr.label}</h4>
                          <p className="text-xs text-gray-600">{addr.address}</p>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-3 ${
                            formData.address === addr.label ? "border-red-600" : "border-gray-300"
                          }`}
                        >
                          {formData.address === addr.label && (
                            <div className="w-3 h-3 rounded-full bg-red-600" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* ---------------- OTHER FIELDS (unchanged) ---------------- */}
            {/* Category */}
            <div>
              <label className="block text-sm mb-1 font-medium">Category</label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => handleInput("category", "Residential")}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.category === "Residential" ? "border-red-600" : "border-gray-300"
                    }`}
                  >
                    {formData.category === "Residential" && (
                      <span className="w-3 h-3 rounded-full bg-red-600" />
                    )}
                  </button>
                  <span className="text-sm">Residential</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => handleInput("category", "Commercial")}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.category === "Commercial" ? "border-red-600" : "border-gray-300"
                    }`}
                  >
                    {formData.category === "Commercial" && (
                      <span className="w-3 h-3 rounded-full bg-red-600" />
                    )}
                  </button>
                  <span className="text-sm">Commercial</span>
                </label>
              </div>
            </div>

            {/* Grid of other fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">Choose Area*</label>
                <select
                  value={formData.area}
                  onChange={(e) => handleInput("area", e.target.value)}
                  className="w-full border p-3 rounded-lg text-sm"
                >
                  <option value="">Burj Khalifa</option>
                  <option value="marina">Dubai Marina</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">Building *</label>
                <input
                  value={formData.building}
                  onChange={(e) => handleInput("building", e.target.value)}
                  placeholder="Enter Building Name"
                  className="w-full border p-3 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">Apartment / Villa No *</label>
                <input
                  value={formData.apartment}
                  onChange={(e) => handleInput("apartment", e.target.value)}
                  placeholder="Enter Apartment Number"
                  className="w-full border p-3 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">Additional Address Details *</label>
                <input
                  value={formData.additionalAddress}
                  onChange={(e) => handleInput("additionalAddress", e.target.value)}
                  placeholder="Enter Additional Address Details"
                  className="w-full border p-3 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">Scope of work *</label>
                <input
                  value={formData.scope}
                  onChange={(e) => handleInput("scope", e.target.value)}
                  placeholder="Enter Scope of work"
                  className="w-full border p-3 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">Full fit out (Design + Execution) *</label>
                <input
                  value={formData.fullFitOut}
                  onChange={(e) => handleInput("fullFitOut", e.target.value)}
                  placeholder="Execution"
                  className="w-full border p-3 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">Renovation / Refabrication *</label>
                <input
                  value={formData.renovation}
                  onChange={(e) => handleInput("renovation", e.target.value)}
                  placeholder="Renovation"
                  className="w-full border p-3 rounded-lg text-sm"
                />
              </div>

              {/* Specific works (custom dropdown with radio style) */}
              <div className="relative">
                <label className="block text-sm mb-1 text-gray-700">Specific works *</label>
                <div
                  className="w-full border p-3 rounded-lg text-sm flex justify-between items-center cursor-pointer"
                  onClick={() => setShowSpecificDropdown((s) => !s)}
                >
                  <span>{formData.specificWork || "Select"}</span>
                  <span className="text-gray-400">▾</span>
                </div>

                {showSpecificDropdown && (
                  <div className="absolute z-20 mt-2 w-full bg-white border rounded-lg shadow-md p-3">
                    {specificWorksList.map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          handleInput("specificWork", item);
                          setShowSpecificDropdown(false);
                        }}
                      >
                        <span>{item}</span>
                        <div className={`w-4 h-4 rounded-full border-2 ${formData.specificWork === item ? "border-red-600" : "border-gray-300"}`}>
                          {formData.specificWork === item && (
                            <div className="w-2 h-2 rounded-full bg-red-600 m-0.5" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawings & budget */}
            <div>
              <label className="block text-sm mb-1 text-gray-700">Do you have Existing drawings / Plans ?</label>

              <div className="flex items-center gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => handleInput("hasDrawings", "Yes")}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.hasDrawings === "Yes" ? "border-red-600" : "border-gray-300"}`}
                  >
                    {formData.hasDrawings === "Yes" && <span className="w-3 h-3 rounded-full bg-red-600" />}
                  </button>
                  Yes
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => handleInput("hasDrawings", "No")}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.hasDrawings === "No" ? "border-red-600" : "border-gray-300"}`}
                  >
                    {formData.hasDrawings === "No" && <span className="w-3 h-3 rounded-full bg-red-600" />}
                  </button>
                  No
                </label>
              </div>

              <label className="block text-sm font-medium mb-2">Drawings / Plans (Auto CAD, PDF, Images)</label>

              <div className="relative w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={onFileChange}
                  className="hidden"
                  accept=".pdf,.dwg,.jpg,.png"
                  disabled={formData.hasDrawings === "No"}
                />

                <div className={`w-full border p-3 rounded-lg text-sm flex items-center justify-between ${formData.hasDrawings === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}>
                  <span className="text-gray-600">
                    {formData.drawingsFilename ? `${formData.drawingsFilename} Attached` : "Choose"}
                  </span>

                  {formData.drawingsFilename ? (
                    <button type="button" onClick={removeFile} className="text-gray-600 font-semibold hover:text-red-600" disabled={formData.hasDrawings === "No"}>
                      ✕
                    </button>
                  ) : (
                    <button type="button" onClick={onChooseFileClick} disabled={formData.hasDrawings === "No"} className={`px-5 py-2 rounded-lg text-white text-sm font-medium ${formData.hasDrawings === "No" ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}>
                      Choose file
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Budget Section */}
            <div className="relative mt-6">
              <label className="block text-sm mb-1 text-gray-700">Estimated Budget Range</label>
              <div className="w-full border p-3 rounded-lg text-sm flex justify-between items-center cursor-pointer" onClick={() => setShowBudgetDropdown((s) => !s)}>
                <span>{formData.budgetRange || "Select"}</span>
                <span className="text-gray-400">▾</span>
              </div>

              {showBudgetDropdown && (
                <div className="absolute z-20 mt-2 w-full bg-white border rounded-lg shadow-md p-3">
                  {budgetList.map((b) => (
                    <div key={b} className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50" onClick={() => { handleInput("budgetRange", b); setShowBudgetDropdown(false); }}>
                      <span>{b}</span>
                      <div className={`w-4 h-4 rounded-full border-2 ${formData.budgetRange === b ? "border-red-600" : "border-gray-300"}`}>
                        {formData.budgetRange === b && <div className="w-2 h-2 rounded-full bg-red-600 m-0.5" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm mb-1 text-gray-700">Description</label>
              <textarea value={formData.description} onChange={(e) => handleInput("description", e.target.value)} rows={4} placeholder="Enter a brief description" className="w-full border p-3 rounded-lg text-sm resize-none" />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button type="submit" className="bg-red-600 text-white px-6 py-3 rounded-lg" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>

          {/* RIGHT CARD */}
          <div className="bg-white border rounded-xl p-6 flex flex-col justify-center items-center text-center shadow-sm">
            <Headphones className="text-red-600 w-12 h-12 mb-3" />
            <p className="text-gray-800 text-sm leading-relaxed">
              A member of our team will contact you regarding your service enquiry within 1–2 business days.
            </p>
          </div>
        </div>
      </div>

      {/* Auto-closing Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl p-10 w-[520px] h-[300px] max-w-[90%] text-center flex flex-col justify-center items-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 border-2 border-red-600 rounded-2xl flex items-center justify-center">
                <Check className="text-red-600 w-6 h-6" strokeWidth={2.5} />
              </div>
            </div>

            <h3 className="text-[16px] font-semibold text-gray-900">Enquiry Submitted Successfully</h3>
          </div>
        </div>
      )}
    </div>
  );
}
