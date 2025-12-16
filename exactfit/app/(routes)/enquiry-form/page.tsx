"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/src/components/Navbar/Navbar";
import HomeIcon from "@/public/home_icon.svg";
import WorkIcon from "@/public/work_icon.svg";
import OfficeIcon from "@/public/office_icon.svg";
import { Headphones, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/apiClient";

import {
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input";
import type { CountryCode } from "libphonenumber-js";

export default function EnquiryFormPage() {
  /* -----------------------------------
   COUNTRY CODE LIST (DYNAMIC)
  ------------------------------------*/
  const [countryList, setCountryList] = useState<
    { code: CountryCode; dial: string }[]
  >([]);

  useEffect(() => {
    const list = getCountries().map((c) => ({
      code: c,
      dial: `+${getCountryCallingCode(c as CountryCode)}`,
    }));
    setCountryList(list);
  }, []);

  /* -----------------------------------
    ICON MAP
  ------------------------------------*/
  const tagIcons: Record<string, any> = {
    Home: HomeIcon,
    Work: WorkIcon,
    Office: OfficeIcon,
  };

  /* -----------------------------------
    STATIC DROPDOWN DATA
  ------------------------------------*/
  const specificWorksList = [
    "Flooring",
    "Ceiling",
    "Partitions",
    "Joinery",
    "Others",
  ];

  const scopeList = [
    "Full fit out (Design + Execution)",
    "Renovation / Refabrication",
    "Specific works",
  ];

  const budgetList = [
    "< AED 100K",
    "AED 100k - 250k",
    "AED 250 -500K",
    "AED 500K +",
  ];

  /* -----------------------------------
    FORM STATE
  ------------------------------------*/
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    countryCode: "+971",
    mobile: "",
    addressId: null as number | null,
    addressLabel: "",
    addressFull: "",

    scope: "",
    specificWork: "",

    hasDrawings: "Yes",
    drawingsFilename: "",

    budgetRange: "",
    description: "",
  });

  function handleInput(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  /* -----------------------------------
    ADDRESS FETCH
  ------------------------------------*/
  const [addresses, setAddresses] = useState<
    Array<{ id: number; label: string; fullAddress: string; raw: any }>
  >([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressesPanel, setShowAddressesPanel] = useState(false);

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const res = await apiClient.get("/user/user-auth/V1/user-details");
      const user = res.data?.data;

      const mapped =
        user?.addresses?.map((a: any) => ({
          id: a.id,
          label: a.save_as_address_type || "Home",
          fullAddress:
            a.location ||
            [
              a.emirate,
              a.area,
              a.building,
              a.appartment || a.villa,
              a.addtional_address,
            ]
              .filter(Boolean)
              .join(", "),
          raw: a,
        })) || [];

      setAddresses(mapped);
    } catch (err) {
      console.error("Address fetch failed", err);
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const onSelectAddress = (addr: any) => {
    handleInput("addressId", addr.id);
    handleInput("addressLabel", addr.label);
    handleInput("addressFull", addr.fullAddress);
    setShowAddressesPanel(false);
  };

  /* -----------------------------------
    FILE UPLOAD
  ------------------------------------*/
  const onChooseFileClick = () => fileInputRef.current?.click();

  const onFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) handleInput("drawingsFilename", file.name);
  };

  const removeFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    handleInput("drawingsFilename", "");
  };

  /* -----------------------------------
    SUCCESS POPUP
  ------------------------------------*/
  const [showSuccess, setShowSuccess] = useState(false);
  const showSimpleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  /* -----------------------------------
    SCOPE + SUBMENU DROPDOWN
  ------------------------------------*/
  const [showScopeDropdown, setShowScopeDropdown] = useState(false);
  const [showSpecialList, setShowSpecialList] = useState(false);

  /* -----------------------------------
    BUDGET DROPDOWN
  ------------------------------------*/
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);

  /* -----------------------------------
    SUBMIT FORM
  ------------------------------------*/
  const [submitting, setSubmitting] = useState(false);

  const submitForm = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        fullname: formData.fullName,
        email: formData.email,

        mobile: `${formData.countryCode}${formData.mobile}`.trim(),

        address_id: formData.addressId,

        scope_of_work: formData.scope,
        specific_work:
          formData.scope === "Specific works"
            ? formData.specificWork
            : null,

        existing_drawing: formData.hasDrawings === "Yes",
        plan_images: formData.drawingsFilename
          ? [formData.drawingsFilename]
          : [],

        estimated_budget_range: formData.budgetRange,
        description: formData.description,
      };
      
      const res = await apiClient.post(
        "/user/booking/V1/upsert-enquiry",
        payload
      );

      showSimpleSuccess();

      setFormData({
        fullName: "",
        email: "",
        countryCode: "+971",
        mobile: "",
        addressId: null,
        addressLabel: "",
        addressFull: "",
        scope: "",
        specificWork: "",
        hasDrawings: "Yes",
        drawingsFilename: "",
        budgetRange: "",
        description: "",
      });
    } catch (err) {
      console.error("Submit Error", err);
      showSimpleSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  /* -----------------------------------
    UI RENDER
  ------------------------------------*/

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-10 py-10">
        <h2 className="text-lg font-semibold text-red-600 mb-6 flex items-center gap-2">
          <span className="text-black text-xl cursor-pointer">←</span>
          Enquiry Form
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
          {/* ---------------- FORM LEFT ---------------- */}
          <form
            onSubmit={submitForm}
            className="bg-white border rounded-xl p-6 shadow-sm space-y-6"
          >
            {/* NAME + EMAIL */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 font-medium">
                  Full Name / Company Name *
                </label>
                <input
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInput("fullName", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInput("email", e.target.value)
                  }
                  type="email"
                  className="w-full border p-3 rounded-lg text-sm"
                  placeholder="abcd@gmail.com"
                />
              </div>
            </div>

            {/* MOBILE */}
            <div>
              <label className="block text-sm mb-1 font-medium">
                Mobile Number *
              </label>

              <div className="flex">
                <select
                  value={formData.countryCode}
                  onChange={(e) =>
                    handleInput("countryCode", e.target.value)
                  }
                  className="border rounded-l-lg p-3 text-sm"
                >
                  {countryList.map((c) => (
                    <option key={c.code} value={c.dial}>
                      {c.code} ({c.dial})
                    </option>
                  ))}
                </select>

                <input
                  required
                  value={formData.mobile}
                  onChange={(e) =>
                    handleInput("mobile", e.target.value)
                  }
                  className="flex-1 border rounded-r-lg p-3 text-sm"
                  placeholder="98989 98989"
                  maxLength={10}
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div>
              <label className="block text-sm mb-1 font-medium">
                Select Address *
              </label>

              <div
                onClick={() =>
                  setShowAddressesPanel((s) => !s)
                }
                className="border p-3 rounded-lg cursor-pointer flex justify-between items-center text-sm"
              >
                <span>
                  {formData.addressId
                    ? `${formData.addressLabel} — ${formData.addressFull}`
                    : "Select Address"}
                </span>
                <ChevronDown size={18} className="text-gray-500" />
              </div>

              {showAddressesPanel && (
                <div className="mt-3 space-y-3">
                  {addressesLoading ? (
                    <p className="text-sm text-gray-500">Loading…</p>
                  ) : (
                    addresses.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => onSelectAddress(a)}
                        className="border rounded-xl p-4 flex items-start hover:bg-gray-50 cursor-pointer"
                      >
                        <Image
                          src={tagIcons[a.label] || HomeIcon}
                          alt="tag"
                          width={28}
                          height={28}
                          className="mr-4"
                        />

                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {a.label}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {a.fullAddress}
                          </p>
                        </div>

                        <div
                          className={`w-5 h-5 border-2 rounded-full ml-3 flex items-center justify-center ${
                            formData.addressId === a.id
                              ? "border-red-600"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.addressId === a.id && (
                            <div className="w-3 h-3 rounded-full bg-red-600" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* ---------------- SCOPE DROPDOWN ---------------- */}
            <div className="relative">
              <label className="block text-sm mb-1 font-medium">
                Scope of work *
              </label>

              <div
                onClick={() =>
                  setShowScopeDropdown((s) => !s)
                }
                className="border p-3 rounded-lg cursor-pointer flex justify-between items-center text-sm"
              >
                <span>
                  {formData.scope === "Specific works" &&
                  formData.specificWork
                    ? `Specific works (${formData.specificWork})`
                    : formData.scope || "Select"}
                </span>
                {showScopeDropdown ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>

              {showScopeDropdown && (
                <div className="absolute w-full bg-white border rounded-lg shadow-md mt-2 z-20 p-2">
                  {/* MAIN OPTIONS */}
                  {scopeList.map((item, index) => (
                    <div key={item}>
                      <div
                        onClick={() => {
                          handleInput("scope", item);
                          if (item !== "Specific works") {
                            handleInput("specificWork", "");
                            setShowSpecialList(false);
                            setShowScopeDropdown(false);
                          } else {
                            setShowSpecialList((s) => !s);
                          }
                        }}
                        className="flex justify-between items-center px-3 py-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <span>{item}</span>

                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            formData.scope === item
                              ? "border-red-600"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.scope === item && (
                            <div className="w-2 h-2 bg-red-600 rounded-full" />
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-b"></div>

                      {/* SPECIAL WORKS ROW */}
                      {item === "Specific works" &&
                        showSpecialList && (
                          <div className="flex items-center justify-between px-3 py-3 gap-2">
                            {specificWorksList.map((sw) => (
                              <div
                                key={sw}
                                onClick={() => {
                                  handleInput("specificWork", sw);
                                  handleInput(
                                    "scope",
                                    "Specific works"
                                  );
                                  setShowScopeDropdown(false);
                                  setShowSpecialList(false);
                                }}
                                className="flex items-center gap-1 cursor-pointer"
                              >
                                <span className="text-sm">
                                  {sw}
                                </span>

                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    formData.specificWork === sw
                                      ? "border-red-600"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {formData.specificWork ===
                                    sw && (
                                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ---------------- DRAWINGS ---------------- */}
            <div>
              <label className="block text-sm mb-2 font-medium">
                Do you have Existing drawings / Plans ?
              </label>

              <div className="flex items-center gap-6 mb-4">
                {/* YES */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <button
                    type="button"
                    onClick={() =>
                      handleInput("hasDrawings", "Yes")
                    }
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.hasDrawings === "Yes"
                        ? "border-red-600"
                        : "border-gray-300"
                    }`}
                  >
                    {formData.hasDrawings === "Yes" && (
                      <div className="w-3 h-3 rounded-full bg-red-600" />
                    )}
                  </button>
                  Yes
                </label>

                {/* NO */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <button
                    type="button"
                    onClick={() =>
                      handleInput("hasDrawings", "No")
                    }
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.hasDrawings === "No"
                        ? "border-red-600"
                        : "border-gray-300"
                    }`}
                  >
                    {formData.hasDrawings === "No" && (
                      <div className="w-3 h-3 rounded-full bg-red-600" />
                    )}
                  </button>
                  No
                </label>
              </div>

              {/* FILE INPUT */}
              <div className="border p-3 rounded-lg flex justify-between items-center">
                <span className="text-gray-600 text-sm">
                  {formData.drawingsFilename
                    ? `${formData.drawingsFilename} Attached`
                    : "Choose File"}
                </span>

                {!formData.drawingsFilename ? (
                  <button
                    type="button"
                    disabled={formData.hasDrawings === "No"}
                    onClick={onChooseFileClick}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:bg-gray-400"
                  >
                    Choose
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-600 font-bold"
                  >
                    ✕
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>
            </div>

            {/* ---------------- BUDGET DROPDOWN ---------------- */}
            <div className="relative mt-4">
              <label className="block text-sm mb-1 font-medium">
                Estimated Budget Range
              </label>

              <div
                onClick={() =>
                  setShowBudgetDropdown((s) => !s)
                }
                className="border p-3 rounded-lg cursor-pointer flex justify-between items-center text-sm"
              >
                <span>{formData.budgetRange || "Select"}</span>
                {showBudgetDropdown ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>

              {showBudgetDropdown && (
                <div className="absolute w-full bg-white border rounded-lg shadow-md mt-2 z-20 p-2">
                  {budgetList.map((b) => (
                    <div key={b}>
                      <div
                        onClick={() => {
                          handleInput("budgetRange", b);
                          setShowBudgetDropdown(false);
                        }}
                        className="flex justify-between items-center px-3 py-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <span>{b}</span>

                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            formData.budgetRange === b
                              ? "border-red-600"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.budgetRange === b && (
                            <div className="w-2 h-2 bg-red-600 rounded-full" />
                          )}
                        </div>
                      </div>

                      <div className="border-b"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm mb-1 font-medium">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  handleInput("description", e.target.value)
                }
                className="w-full border p-3 rounded-lg text-sm resize-none"
                placeholder="Enter a brief description"
              />
            </div>

            {/* SUBMIT */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-red-600 text-white px-6 py-3 rounded-lg"
              >
                {submitting ? "Submitting…" : "Submit"}
              </Button>
            </div>
          </form>

          {/* ---------------- RIGHT INFORMATION CARD ---------------- */}
          <div className="bg-white border rounded-xl p-6 flex flex-col justify-center items-center text-center shadow-sm">
            <Headphones className="text-red-600 w-12 h-12 mb-3" />
            <p className="text-gray-700 text-sm leading-relaxed">
              A member of our team will contact you regarding your enquiry
              within 1–2 business days.
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- SUCCESS POPUP ---------------- */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-10 w-[420px] max-w-[90%] text-center flex flex-col items-center">
            <div className="w-12 h-12 border-2 border-red-600 rounded-2xl flex items-center justify-center mb-6">
              <Check className="text-red-600 w-6 h-6" strokeWidth={2.5} />
            </div>

            <h3 className="text-[16px] font-semibold text-gray-900">
              Enquiry Submitted Successfully
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
