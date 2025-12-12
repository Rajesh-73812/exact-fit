"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import UserLayout from "@/src/components/Dashboard/UserLayout";
import apiClient from "@/lib/apiClient";

import EditIcon from "@/public/Edit_icon.svg";
import HomeIcon from "@/public/home_icon.svg";
import WorkIcon from "@/public/work_icon.svg";
import StoreIcon from "@/public/Store_icon.svg";
import MallIcon from "@/public/Mall_icon.svg";
import OtherIcon from "@/public/Other_icon.svg";
import CheckIcon from "@/public/checked_circle.svg";

import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import type { CountryCode } from "libphonenumber-js";

// Google Maps global
declare const google: any;

// === Country → Emirates mapping ===
const UAE_EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

const getEmiratesForCountry = (country: CountryCode): string[] => {
  if (country === "AE") return UAE_EMIRATES;
  // extend for other countries if needed
  return [];
};

export default function ProfilePage() {
  const [isEdit, setIsEdit] = useState(false);
  const [selectedTag, setSelectedTag] = useState("Home");
  const [showSuccess, setShowSuccess] = useState(false);

  // ============================
  // FORM STATES
  // ============================
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [mobile, setMobile] = useState(""); // full mobile as stored in backend
  const [emirate, setEmirate] = useState("");
  const [area, setArea] = useState("");
  const [building, setBuilding] = useState("");
  const [appartment, setAppartment] = useState("");
  const [additional, setAdditional] = useState("");
  const [category, setCategory] = useState<"residential" | "commercial">(
    "residential"
  ); // backend uses lowercase

  // country/phone split
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("AE");
  const [localMobile, setLocalMobile] = useState("");

  // ============================
  // MAP / AUTOCOMPLETE STATE
  // ============================
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  // ============================
  // GET USER DETAILS
  // ============================
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await apiClient.get("/user/user-auth/V1/user-details");
        const d = res.data?.data;
        console.log("USER DETAILS:", d);

        if (d) {
          setFullname(d.fullname || "");
          setEmail(d.email || "");
          setMobile(d.mobile || "");

          // derive country + local mobile from full mobile
          const rawMobile: string = d.mobile || "";
          const digitsOnly = rawMobile.replace(/\D/g, "");

          let detectedCountry: CountryCode = "AE";
          let nationalNumber = digitsOnly;

          if (rawMobile.startsWith("+") && digitsOnly) {
            const countries = getCountries();
            let bestMatchCountry: CountryCode | null = null;
            let bestMatchCode = "";

            countries.forEach((c) => {
              const code = getCountryCallingCode(c as CountryCode);
              if (digitsOnly.startsWith(code)) {
                if (!bestMatchCountry || code.length > bestMatchCode.length) {
                  bestMatchCountry = c as CountryCode;
                  bestMatchCode = code;
                }
              }
            });

            if (bestMatchCountry) {
              detectedCountry = bestMatchCountry;
              nationalNumber = digitsOnly.slice(bestMatchCode.length);
            }
          }

          setSelectedCountry(detectedCountry);
          setLocalMobile(nationalNumber);

          const addr =
            Array.isArray(d.addresses) && d.addresses.length > 0
              ? d.addresses[0]
              : null;

          if (addr) {
            setEmirate(addr.emirate || "");
            setArea(addr.area || "");
            setBuilding(addr.building || "");
            setAppartment(addr.appartment || "");
            setAdditional(addr.addtional_address || "");
            setLocationAddress(addr.location || "");

            const cat = (addr.category || "residential").toLowerCase();
            setCategory(
              cat === "commercial" ? "commercial" : "residential"
            );
            setSelectedTag(addr.save_as_address_type || "Home");
          }
        }
      } catch (err) {
        console.log("User details error:", err);
      }
    };

    fetchUserDetails();
  }, []);

  // keep emirate consistent with selected country
  useEffect(() => {
    const options = getEmiratesForCountry(selectedCountry);
    if (options.length === 0) return;
    if (!options.includes(emirate)) {
      setEmirate(options[0]);
    }
  }, [selectedCountry, emirate]);

  // ============================
  // GOOGLE MAPS + AUTOCOMPLETE INIT (same behaviour as addresses page)
  // ============================
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
      return;
    }

    let mounted = true;

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = (e) => reject(e);
        document.head.appendChild(s);
      });

    const init = async () => {
      try {
        if (!mapRef.current) return;

        if (!(window as any).google) {
          await loadScript(
            `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
          );
        }

        if (!mounted) return;

        const google = (window as any).google;
        if (!google?.maps) {
          console.warn("Google maps failed to load");
          return;
        }

        const defaultCoords = { lat: 25.2048, lng: 55.2708 }; // Dubai

        // try geolocation for initial center
        const startCoords: { lat: number; lng: number } =
          await new Promise((resolve) => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) =>
                  resolve({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                  }),
                () => resolve(defaultCoords),
                { timeout: 5000 }
              );
            } else {
              resolve(defaultCoords);
            }
          });

        const map = new google.maps.Map(mapRef.current, {
          center: startCoords,
          zoom: 15,
        });

        const marker = new google.maps.Marker({
          position: startCoords,
          map,
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setCoords(startCoords);

        // attach Places Autocomplete to location input
        const input = document.getElementById(
          "location-input"
        ) as HTMLInputElement | null;

        if (input) {
          autocompleteRef.current = new google.maps.places.Autocomplete(input, {
            types: ["geocode", "establishment"],
            // componentRestrictions: { country: "ae" },
          });

          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current.getPlace();
            if (!place) return;

            const formatted = place.formatted_address || input.value;
            const location = place.geometry?.location;
            const newCoords = location
              ? { lat: location.lat(), lng: location.lng() }
              : null;

            const components: Record<string, string> = {};
            (place.address_components || []).forEach((comp: any) => {
              (comp.types || []).forEach((t: string) => {
                components[t] = comp.long_name;
              });
            });

            setLocationAddress(formatted);
            setEmirate(
              components["administrative_area_level_1"] ||
                components["country"] ||
                emirate
            );
            setArea(
              components["sublocality"] ||
                components["neighborhood"] ||
                components["locality"] ||
                area
            );
            setBuilding(components["premise"] || building);
            setAppartment(components["subpremise"] || appartment);

            if (newCoords && mapInstanceRef.current && markerRef.current) {
              try {
                markerRef.current.setPosition(newCoords);
                mapInstanceRef.current.setCenter(newCoords);
                setCoords(newCoords);
              } catch (e) {
                console.log("Marker/mapping update error:", e);
              }
            }
          });
        }
      } catch (err) {
        console.error("Google maps init error", err);
      }
    };

    init();

    return () => {
      mounted = false;
      if (autocompleteRef.current && autocompleteRef.current.unbindAll) {
        try {
          autocompleteRef.current.unbindAll();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [emirate, area, building, appartment]);

  // optional: geocode free-text address on blur
  const geocodeAddressOnBlur = async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !locationAddress) return;

    try {
      const encoded = encodeURIComponent(locationAddress);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${apiKey}`;
      const r = await fetch(url);
      const j = await r.json();
      if (j.results && j.results.length > 0) {
        const place = j.results[0];
        const loc = place.geometry.location;
        const newCoords = { lat: loc.lat, lng: loc.lng };

        const comps: Record<string, string> = {};
        (place.address_components || []).forEach((comp: any) =>
          (comp.types || []).forEach(
            (t: string) => (comps[t] = comp.long_name)
          )
        );

        setEmirate(
          comps["administrative_area_level_1"] ||
            comps["country"] ||
            emirate
        );
        setArea(
          comps["sublocality"] ||
            comps["neighborhood"] ||
            comps["locality"] ||
            area
        );
        setBuilding(comps["premise"] || building);
        setAppartment(comps["subpremise"] || appartment);

        if (mapInstanceRef.current && markerRef.current) {
          try {
            markerRef.current.setPosition(newCoords);
            mapInstanceRef.current.setCenter(newCoords);
            setCoords(newCoords);
          } catch (e) {
            console.log("Geocode map update error", e);
          }
        }
      }
    } catch (err) {
      console.warn("Geocode lookup failed", err);
    }
  };

  // ============================
  // UPDATE HANDLER
  // ============================
  const handleUpdate = async () => {
    try {
      const callingCode = getCountryCallingCode(selectedCountry);
      const fullMobile =
        localMobile && callingCode
          ? `+${callingCode}${localMobile}`
          : mobile;

      const payload = {
        fullname,
        email,
        emirate,
        area,
        building,
        appartment,
        addtional_address: additional,
        category,
        save_as_address_type: selectedTag,
        location: locationAddress,
        mobile: fullMobile,
      };

      console.log("UPDATE PAYLOAD:", payload);

      await apiClient.patch("/user/user-auth/V1/update-profile", payload);

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setIsEdit(false);
      }, 1500);
    } catch (err) {
      console.log("Update error:", err);
    }
  };

  return (
    <UserLayout>
      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-10 shadow-lg text-center">
            <Image
              src={CheckIcon}
              alt="success"
              className="w-10 h-10 mx-auto mb-4"
            />
            <p className="text-lg text-gray-700 font-medium">
              Profile Updated Successfully
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-red-600">Profile</h2>

        <button
          onClick={() => setIsEdit(!isEdit)}
          className="text-red-500 text-sm border border-red-500 px-3 py-1 rounded-2xl flex items-center gap-1"
        >
          <Image src={EditIcon} alt="edit" className="w-4 h-4" />
          {isEdit ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="border rounded-xl p-6 space-y-6">
        {/* Full Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Full Name *</label>
            <input
              type="text"
              value={fullname}
              disabled={!isEdit}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full mt-1 border rounded-md px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              value={email}
              disabled={!isEdit}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 border rounded-md px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Map (Google JS API) */}
        <div>
          <label className="text-sm font-medium">Choose Location *</label>
          <div className="w-full rounded-lg overflow-hidden mt-1">
            <div
              ref={mapRef}
              className="w-full h-64 rounded-lg"
              style={{ minHeight: 200 }}
            />
          </div>
        </div>

        {/* Address (Location) with Google Places Autocomplete */}
        <div>
          <input
            id="location-input"
            type="text"
            value={locationAddress}
            disabled={!isEdit}
            onChange={(e) => setLocationAddress(e.target.value)}
            onBlur={geocodeAddressOnBlur}
            placeholder="Search or type address"
            className="w-full border rounded-md px-3 py-2 text-sm disabled:bg-gray-50"
          />
        </div>

        {/* Mobile & Emirate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mobile with country list */}
          <div>
            <label className="text-sm font-medium">Mobile Number *</label>
            <div className="flex gap-2">
              {/* Country code select – ALL country codes */}
              <select
                disabled={!isEdit}
                className="border rounded-md px-3 py-2 text-sm disabled:bg-gray-50"
                value={selectedCountry}
                onChange={(e) =>
                  setSelectedCountry(e.target.value as CountryCode)
                }
              >
                {getCountries().map((country) => (
                  <option key={country} value={country}>
                    +{getCountryCallingCode(country as CountryCode)} ({country})
                  </option>
                ))}
              </select>

              {/* Local mobile (without country code) */}
              <input
                type="text"
                value={localMobile}
                disabled={!isEdit}
                maxLength={15}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  setLocalMobile(digits);
                }}
                className="w-full border rounded-md px-3 py-2 text-sm disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Emirates per country */}
          <div>
            <label className="text-sm font-medium">Choose Emirates *</label>
            <select
              value={emirate}
              disabled={!isEdit}
              onChange={(e) => setEmirate(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm disabled:bg-gray-50"
            >
              <option value="">Select Emirate</option>
              {getEmiratesForCountry(selectedCountry).map((em) => (
                <option key={em} value={em}>
                  {em}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Area & Building */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Choose Area *</label>
            <select
              value={area}
              disabled={!isEdit}
              onChange={(e) => setArea(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm disabled:bg-gray-50"
            >
              <option value="">Select Area</option>
              <option>Burj Khalifa</option>
              <option>Jumeirah</option>
              <option>Downtown</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Building *</label>
            <input
              type="text"
              value={building}
              disabled={!isEdit}
              onChange={(e) => setBuilding(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Villa & Additional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">
              Apartment / Villa No *
            </label>
            <input
              type="text"
              value={appartment}
              disabled={!isEdit}
              onChange={(e) => setAppartment(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Additional Address Details *
            </label>
            <input
              type="text"
              value={additional}
              disabled={!isEdit}
              onChange={(e) => setAdditional(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Save Address As */}
        <div>
          <label className="text-sm font-medium">Save Address as</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { label: "Home", icon: HomeIcon },
              { label: "Work", icon: WorkIcon },
              { label: "Store", icon: StoreIcon },
              { label: "Mall", icon: MallIcon },
              { label: "Others", icon: OtherIcon },
            ].map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                disabled={!isEdit}
                onClick={() => setSelectedTag(label)}
                className={`flex items-center gap-2 px-4 py-1 border rounded-full text-sm transition
                  ${
                    selectedTag === label
                      ? "bg-red-100 border-red-500 text-red-600"
                      : "border-gray-300 text-gray-700 disabled:bg-gray-100"
                  }
                `}
              >
                <Image src={icon} alt={label} className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium">Category</label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="category"
                checked={category === "residential"}
                disabled={!isEdit}
                onChange={() => setCategory("residential")}
              />
              Residential
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="category"
                checked={category === "commercial"}
                disabled={!isEdit}
                onChange={() => setCategory("commercial")}
              />
              Commercial
            </label>
          </div>
        </div>

        {/* BUTTONS WHEN EDITING */}
        {isEdit && (
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsEdit(false)}
              className="px-6 py-2 border border-gray-400 rounded-lg text-gray-600"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleUpdate}
              className="px-6 py-2 bg-red-500 text-white rounded-lg"
            >
              Update
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
