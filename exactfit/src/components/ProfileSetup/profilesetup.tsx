"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import CheckIcon from "@/public/checked_circle.svg";
import HomeIcon from "@/public/home_icon.svg";
import WorkIcon from "@/public/work_icon.svg";
import StoreIcon from "@/public/Store_icon.svg";
import MallIcon from "@/public/Mall_icon.svg";
import OthersIcon from "@/public/Other_icon.svg";

import {
  GoogleMap as RawGoogleMap,
  Marker as RawMarker,
  useJsApiLoader,
} from "@react-google-maps/api";

import apiClient from "@/lib/apiClient";

// Google Maps Types
interface GoogleMapProps {
  mapContainerStyle: React.CSSProperties;
  center: google.maps.LatLngLiteral;
  zoom: number;
  onClick?: (e: google.maps.MapMouseEvent) => void;
  children?: React.ReactNode;
}

interface MarkerProps {
  position: google.maps.LatLngLiteral;
  draggable?: boolean;
  onDragEnd?: (e: google.maps.MapMouseEvent) => void;
}

const GoogleMap = RawGoogleMap as unknown as React.FC<GoogleMapProps>;
const Marker = RawMarker as unknown as React.FC<MarkerProps>;

export default function ProfileSetup() {
  const router = useRouter();

  // ================================
  // FORM STATES
  // ================================
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");

  const [emirate, setEmirate] = useState("");
  const [area, setArea] = useState("");
  const [building, setBuilding] = useState("");
  const [appartment, setAppartment] = useState("");
  const [additional, setAdditional] = useState("");

  const [mobile, setMobile] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("Residential");
  const [selectedLabel, setSelectedLabel] = useState("Home");

  const [address, setAddress] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // Map states
  const [markerPosition, setMarkerPosition] = useState({
    lat: 25.276987,
    lng: 55.296249,
  });

  // Load Google Maps
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  // Get address from lat/lng
  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress("Address not found");
      }
    });
  }, []);

  // Map Click Handler
  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setMarkerPosition({ lat, lng });
        fetchAddress(lat, lng);
      }
    },
    [fetchAddress]
  );

  // ================================
  // SUBMIT HANDLER (API CALL)
  // ================================
  const handleSubmit = async () => {
    try {
      const payload = {
        fullname,
        email,
        emirate,
        area,
        building,
        appartment,
        addtional_address: additional,
        category: selectedCategory,
        save_as_address_type: selectedLabel,
        location: address,
        latitude: markerPosition.lat,
        longitude: markerPosition.lng,
      };

      const res = await apiClient.patch(
        "/user/user-auth/V1/update-profile",
        payload
      );

      if (res.data.success) {
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          router.push("/");
        }, 1500);
      }
    } catch (err: any) {
      console.error("Profile Update Error:", err.response?.data || err);
    }
  };

  const addressLabels = [
    { label: "Home", icon: HomeIcon },
    { label: "Work", icon: WorkIcon },
    { label: "Store", icon: StoreIcon },
    { label: "Mall", icon: MallIcon },
    { label: "Others", icon: OthersIcon },
  ];

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center py-10 px-4">
      {/* Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-10 shadow-lg text-center">
            <Image
              src={CheckIcon}
              alt="check"
              className="w-10 h-10 mx-auto mb-4"
            />
            <p className="text-lg font-medium">Profile Added Successfully</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md max-w-4xl w-full p-8">
        <h1 className="text-2xl font-bold text-center text-primary mt-6">
          Profile Setup
        </h1>
        <p className="text-center text-gray-600 mb-8">Enter your details</p>

        <form>
          {/* Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Full Name *</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 mt-2 outline-none"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email *</label>
              <input
                type="email"
                className="w-full border rounded-md px-3 py-2 mt-2 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Google Map */}
          <label className="text-sm font-medium">Choose Location *</label>
          <div className="mt-2 mb-4 rounded-md overflow-hidden h-56 border">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={markerPosition}
                zoom={14}
                onClick={handleMapClick}
              >
                <Marker
                  position={markerPosition}
                  draggable
                  onDragEnd={(e) => {
                    if (e.latLng) {
                      const lat = e.latLng.lat();
                      const lng = e.latLng.lng();
                      setMarkerPosition({ lat, lng });
                      fetchAddress(lat, lng);
                    }
                  }}
                />
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Loading map...
              </div>
            )}
          </div>

          <input
            type="text"
            readOnly
            value={address || "Select a location on map"}
            className="w-full border rounded-md px-3 py-2 mb-6 outline-none text-sm"
          />

          {/* Mobile + Emirates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Mobile Number *</label>
              <div className="flex gap-2 mt-2">
                <select className="border rounded-md px-2 py-2 text-sm">
                  <option>+971</option>
                </select>

                <input
                  type="text"
                  className="flex-1 border rounded-md px-3 py-2 outline-none"
                  maxLength={9}
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, ""))
                  }
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
                <option value="">Select</option>
                <option>Dubai</option>
                <option>Abu Dhabi</option>
                <option>Sharjah</option>
              </select>
            </div>
          </div>

          {/* Area + Building */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Choose Area *</label>
              <select
                className="w-full border rounded-md px-3 py-2 mt-2"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                <option value="">Select</option>
                <option>Burj Khalifa</option>
                <option>Jumeirah</option>
                <option>Downtown</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Building *</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 mt-2 outline-none"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
              />
            </div>
          </div>

          {/* Apartment + Additional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">
                Apartment / Villa No *
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 mt-2 outline-none"
                value={appartment}
                onChange={(e) => setAppartment(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Additional Address Details *
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 mt-2 outline-none"
                value={additional}
                onChange={(e) => setAdditional(e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="text-sm font-medium block mb-2">Category</label>
            <div className="flex gap-6">
              {["Residential", "Commercial"].map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="accent-primary"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Save Address As */}
          <div className="mb-8">
            <label className="text-sm font-medium block mb-3">
              Save Address as
            </label>
            <div className="flex flex-wrap gap-3">
              {addressLabels.map((addr) => (
                <button
                  key={addr.label}
                  type="button"
                  onClick={() => setSelectedLabel(addr.label)}
                  className={`px-4 py-2 rounded-full border text-sm flex items-center gap-2 ${
                    selectedLabel === addr.label
                      ? "border-primary text-primary bg-[#FFF1F1]"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  <Image
                    src={addr.icon}
                    alt={addr.label}
                    width={18}
                    height={18}
                  />
                  {addr.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="border border-primary text-primary px-6 py-2 rounded-md"
            >
              &lt; Back
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="bg-primary text-white px-6 py-2 rounded-md"
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
