"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/src/components/Navbar/Navbar";
import Image from "next/image";
import Years_Packages from "@/public/Years_Packages.svg";
import Footer from "@/src/components/Homepage/Footer";
import apiClient from "@/lib/apiClient";
import { useRouter, useSearchParams } from "next/navigation";

import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import type { CountryCode } from "libphonenumber-js";
import "react-phone-number-input/style.css";

import Filled_star from "@/public/Filled_star.svg";
import HomeIcon from "@/public/home_icon.svg";
import { Star } from "lucide-react";

type AddressItem = {
  id: string | number;
  label: string;
  address: string;
  icon?: any;
};

type Props = {
  selectedPlan?: string;
};

const FALLBACK_USER_ID = "492d20af-6f1b-44c6-9454-2cc827e3a4af";

function getUserIdFromLocalToken(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token") || localStorage.getItem("access_token") || localStorage.getItem("authToken"); // try common keys
    if (!token) return null;

    // JWT parse (no verification) to read payload
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    // base64url decode
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    const obj = JSON.parse(json);
    // look for common fields
    return obj?.user_id ?? obj?.id ?? obj?.sub ?? null;
  } catch (err) {
    console.warn("Failed to parse token for user id:", err);
    return null;
  }
}

export default function PackageForm({ selectedPlan: propSelectedPlan }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [planSlug, setPlanSlug] = useState<string | undefined>(undefined);
  const [apiPlan, setApiPlan] = useState<any | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);

  const [showAddressList, setShowAddressList] = useState(false);
  const [showPropertyOptions, setShowPropertyOptions] = useState(false);

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
  const [submitting, setSubmitting] = useState(false);

  const emirates = [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Umm Al Quwain",
    "Ras Al Khaimah",
    "Fujairah",
  ];

  // resolve planSlug priority: prop -> ?plan= -> localStorage
  useEffect(() => {
    const urlPlan = typeof window !== "undefined" ? searchParams.get("plan") ?? undefined : undefined;
    const storagePlan = typeof window !== "undefined" ? localStorage.getItem("selectedPlan") ?? undefined : undefined;

    const resolved =
      propSelectedPlan && propSelectedPlan.trim() !== ""
        ? propSelectedPlan
        : urlPlan && urlPlan.trim() !== ""
        ? urlPlan
        : storagePlan && storagePlan.trim() !== ""
        ? storagePlan
        : undefined;

    setPlanSlug(resolved);
  }, [propSelectedPlan, searchParams?.toString()]);

  // fetch plan details by slug
  useEffect(() => {
    if (!planSlug) {
      setApiPlan(null);
      return;
    }
    const fetchPlan = async () => {
      try {
        setPlanLoading(true);
        const res = await apiClient.get(`/user/plan/V1/get-plan-by-slug/${encodeURIComponent(planSlug)}`);
        // api returns res.data.data which contains plan object
        const plan = res?.data?.data ?? null;
        setApiPlan(plan);
        // set form category default from plan
        if (plan?.category) {
          setFormData((p) => ({ ...p, category: String(plan.category).toLowerCase().includes("commercial") ? "Commercial" : "Residential" }));
        }
      } catch (err) {
        console.error("Failed to load plan:", err);
        setApiPlan(null);
      } finally {
        setPlanLoading(false);
      }
    };

    fetchPlan();
  }, [planSlug]);

  // fetch addresses and prepare country codes from react-phone-number-input
  useEffect(() => {
    const fetchLists = async () => {
      // determine user id: token -> fallback
      const detectedUserId = getUserIdFromLocalToken() ?? FALLBACK_USER_ID;

      try {
        // send userId as query param to retrieve user-specific addresses
        const addrEndpoint = `/user/address/V1/get-addresses${detectedUserId ? `?userId=${encodeURIComponent(detectedUserId)}` : ""}`;
        const addrRes = await apiClient.get(addrEndpoint, { skipAuth: true });
        const rows = addrRes.data?.data?.rows ?? addrRes.data?.data ?? [];
        const mapped = (Array.isArray(rows) ? rows : []).map((a: any) => ({
          id: a.id ?? a.address_id ?? Math.random(),
          label: a.label ?? a.name ?? a.address_label ?? "Address",
          address: a.full_address ?? a.address ?? `${a.street ?? ""} ${a.city ?? ""}`.trim(),
          icon: HomeIcon,
        }));
        setAddresses(mapped);
      } catch (err) {
        console.warn("addresses fetch failed:", err);
        setAddresses([]);
      }

      // build country list using react-phone-number-input
      try {
        const countries = getCountries(); // returns country codes like 'AE', 'IN', 'US'
        const mapped = (countries || []).map((c) => {
          const dial = `+${getCountryCallingCode(c as CountryCode)}`;
          // label similar to signin page style: "AE +971"
          return { value: dial, label: `${c} ${dial}` };
        });
        // ensure +971 exists and set default
        const has971 = mapped.find((m) => m.value === "+971");
        const final = mapped.length ? mapped : [{ value: "+971", label: "AE +971" }];
        setCountryOptions(final);
        if (has971) setFormData((p) => ({ ...p, countryCode: "+971" }));
        else if (final[0]) setFormData((p) => ({ ...p, countryCode: final[0].value }));
      } catch (err) {
        console.warn("country list build failed:", err);
        setCountryOptions([{ value: "+971", label: "AE +971" }]);
        setFormData((p) => ({ ...p, countryCode: "+971" }));
      }
    };

    fetchLists();
  }, []);

  // fetch property types for the selected plan (use plan id when available) and include user id
  useEffect(() => {
    const fetchPropertyTypesByPlan = async () => {
      const planId = apiPlan?.id ?? planSlug; // prefer numeric id; fallback to slug if backend accepts it
      if (!planId) {
        setPropertyTypes([]);
        return;
      }

      const detectedUserId = getUserIdFromLocalToken() ?? FALLBACK_USER_ID;

      try {
        // include userId as query param so server can use it
        const endpoint = `/user/property/V1/get-all-property/${encodeURIComponent(String(planId))}?userId=${encodeURIComponent(detectedUserId)}`;
        const propRes = await apiClient.get(endpoint);
        const props = propRes.data?.data ?? [];
        setPropertyTypes(Array.isArray(props) ? props.map((p: any) => String(p.name ?? p.type ?? p)) : []);
      } catch (err) {
        console.warn("property types fetch failed for plan:", planId, err);
        setPropertyTypes([]);
      }
    };

    fetchPropertyTypesByPlan();
  }, [apiPlan?.id, planSlug]);

  useEffect(() => {
    const valid =
      !!formData.fullName &&
      !!formData.email &&
      !!formData.mobile &&
      !!formData.emirate &&
      !!formData.address &&
      !!formData.propertyType &&
      !!formData.terms;
    setIsFormValid(valid);
  }, [formData]);

  const handleChange = (field: string, value: any) => setFormData((p) => ({ ...p, [field]: value }));

  const selectAddress = (addr: AddressItem) => {
    setFormData((p) => ({ ...p, address: addr.label }));
    setShowAddressList(false);
  };

  const addNewAddress = () => {
    const label = prompt("Address label (Home/Work):", "New Address");
    const address = prompt("Full address:", "");
    if (!label || !address) return;
    const newAddr: AddressItem = { id: `new-${Date.now()}`, label, address, icon: HomeIcon };
    setAddresses((p) => [newAddr, ...p]);
    setFormData((p) => ({ ...p, address: label }));
    setShowAddressList(false);
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setSubmitting(true);
    try {
      const payload = {
        plan_slug: planSlug,
        full_name: formData.fullName,
        email: formData.email,
        mobile: `${formData.countryCode}${formData.mobile}`,
        emirate: formData.emirate,
        address_label: formData.address,
        category: formData.category,
        property_type: formData.propertyType,
      };
      const res = await apiClient.post("/user/plan/V1/subscribe", payload);
      alert(res?.data?.message || "Subscription successful");
      if (planSlug) localStorage.setItem("selectedPlan", planSlug);
      router.push(`/payment?plan=${planSlug}`);
    } catch (err: any) {
      console.error("submit error:", err);
      alert(err?.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // left form / right summary derived values
  const priceRaw = apiPlan?.base_price ?? apiPlan?.price ?? apiPlan?.basePrice ?? "AED 0";
  const price = typeof priceRaw === "number" ? `AED ${priceRaw}` : (priceRaw as string);
  const planName = apiPlan?.name ?? planSlug ?? "Plan";
  const stars = Number(apiPlan?.stars ?? 0);
  const includedArr: string[] =
    Array.isArray(apiPlan?.included) ? apiPlan.included :
    Array.isArray(apiPlan?.features) ? apiPlan.features :
    [];

  const renderStars = (filled: number) => (
    <div className="relative w-16 h-12 mb-2">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 w-6 h-6 flex items-center justify-center">
        {filled >= 1 ? <Image src={Filled_star} alt="star" width={24} height={24} className="w-6 h-6" /> : <Star className="w-6 h-6 stroke-primary" />}
      </div>
      <div className="absolute bottom-0 left-1/4 -translate-x-3 w-6 h-6 flex items-center justify-center">
        {filled >= 2 ? <Image src={Filled_star} alt="star" width={24} height={24} className="w-6 h-6" /> : <Star className="w-6 h-6 stroke-primary" />}
      </div>
      <div className="absolute bottom-0 right-1/4 translate-x-3 w-6 h-6 flex items-center justify-center">
        {filled >= 3 ? <Image src={Filled_star} alt="star" width={24} height={24} className="w-6 h-6" /> : <Star className="w-6 h-6 stroke-primary" />}
      </div>
    </div>
  );

  // If planSlug isn't present, keep a simple fallback view (redirect or ask user)
  if (!planSlug && !apiPlan) {
    return (
      <div className="bg-white min-h-screen">
        <div className="p-2"><Navbar /></div>
        <div className="px-4 md:px-10 lg:px-20 py-20 text-center">
          <h2 className="text-xl font-semibold mb-4">No plan selected</h2>
          <p className="text-gray-600 mb-6">Please select a plan from the packages page.</p>
          <button onClick={() => router.push("/allpackages")} className="px-4 py-2 bg-primary text-white rounded">View Packages</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="p-2"><Navbar /></div>

      <Image src={Years_Packages} alt="Year banner" width={500} height={300} className="w-full h-auto" />

      <div className="px-4 md:px-10 lg:px-20 py-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Package Details - {planName}</h2>
            <div className="text-xs px-3 py-1 border rounded-full bg-gray-50 text-gray-700">{planName}</div>
          </div>

          {planLoading && <p className="text-sm text-gray-500 mb-4">Loading latest plan details...</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input className="w-full p-2 border rounded-lg" value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input className="w-full p-2 border rounded-lg" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mobile Number *</label>
              <div className="flex">
                <select className="border rounded-l-lg p-2" value={formData.countryCode} onChange={(e) => handleChange("countryCode", e.target.value)}>
                  {countryOptions.length ? countryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>) : <option value="+971">AE +971</option>}
                </select>
                <input className="flex-1 p-2 border rounded-r-lg" value={formData.mobile} onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, ""))} maxLength={12} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Choose Emirate *</label>
              <select className="w-full p-2 border rounded-lg" value={formData.emirate} onChange={(e) => handleChange("emirate", e.target.value)}>
                <option value="">Select Emirate</option>
                {emirates.map((em) => <option key={em} value={em}>{em}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Address *</label>
            <div onClick={() => setShowAddressList((s) => !s)} className="w-full p-3 border rounded-lg flex justify-between items-center cursor-pointer">
              <span>{formData.address || "Select Address"}</span>
              <span>▼</span>
            </div>

            {showAddressList && (
              <div className="mt-3 border rounded-lg p-3 max-h-56 overflow-auto">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">Saved Addresses</div>
                  <button onClick={addNewAddress} className="bg-primary text-white px-3 py-1 rounded-full text-sm">+ Add New address</button>
                </div>

                <div className="space-y-3">
                  {addresses.length ? addresses.map((addr) => (
                    <div key={addr.id} className="border rounded-lg p-3 flex items-start hover:bg-gray-50">
                      <div className="mr-3">{addr.icon ? <Image src={addr.icon} alt={addr.label} width={28} height={28} /> : null}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{addr.label}</div>
                            <div className="text-sm text-gray-600">{addr.address}</div>
                          </div>
                          <div>
                            <input type="radio" name="selectedAddress" checked={formData.address === addr.label} onChange={() => selectAddress(addr)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : <div className="text-sm text-gray-500">No saved addresses found</div>}
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Choose property Type *</label>
            <div className="relative">
              <select className="w-full p-2 border rounded-lg" value={formData.propertyType} onChange={(e) => handleChange("propertyType", e.target.value)}>
                <option value="">Select Property Type</option>
                {propertyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>

              <div className="mt-2">
                <button type="button" onClick={() => setShowPropertyOptions((s) => !s)} className="text-sm text-primary underline">Show all options</button>
              </div>

              {showPropertyOptions && (
                <div className="mt-3 border rounded-lg p-3 max-h-44 overflow-auto">
                  {propertyTypes.map((t) => (
                    <label key={t} className="flex items-center justify-between border-b py-2 last:border-b-0 cursor-pointer">
                      <span>{t}</span>
                      <input type="radio" name="propertyTypeRadio" checked={formData.propertyType === t} onChange={() => handleChange("propertyType", t)} />
                    </label>
                  ))}
                  {propertyTypes.length === 0 && <div className="text-sm text-gray-500">No property types available</div>}
                </div>
              )}
            </div>
          </div>

          <label className="flex items-start gap-3 mb-6 text-sm">
            <input type="checkbox" checked={formData.terms} onChange={(e) => handleChange("terms", e.target.checked)} className="mt-1" />
            <div>I accept the <span className="text-primary">Terms & Conditions</span> and <span className="text-primary">Privacy Policy</span></div>
          </label>

          <div className="flex justify-end">
            <button disabled={!isFormValid || submitting} onClick={handleSubmit} className={`w-[30%] py-3 rounded-lg font-medium transition ${isFormValid ? "bg-primary text-white hover:bg-primary" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
              {submitting ? "Submitting..." : "Continue Payment"}
            </button>
          </div>
        </div>

        <aside className="bg-white max-h-max border rounded-xl p-4 shadow-sm">
          <div className="text-center mb-3">
            <h3 className="text-lg font-bold">{planName} starts from</h3>
            <div className="flex items-center justify-center">
              <span className="text-xl font-bold mr-2">{price}</span>
              {renderStars(stars)}
            </div>
          </div>

          <h4 className="font-semibold mb-2 text-sm">What's included:</h4>
          <div className="text-xs text-gray-700 space-y-1 mb-4">
            {/* If API returned structured included array show that, otherwise show description HTML */}
            {includedArr.length ? (
              <ul className="list-disc list-inside">
                {includedArr.map((item: any, idx: number) => <li key={idx}>{item}</li>)}
              </ul>
            ) : apiPlan?.description ? (
              <div className="prose text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: String(apiPlan.description) }} />
            ) : (
              <div className="text-gray-500">Plan details loading...</div>
            )}
          </div>

          <div className="text-right">
            <p className="text-base font-bold">Package Cost</p>
            <p className="text-xl font-bold text-primary">{price}/year</p>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
