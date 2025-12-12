"use client";

import { useState, useEffect, useRef } from "react";
import UserLayout from "@/src/components/Dashboard/UserLayout";
import Image from "next/image";
import apiClient from "@/lib/apiClient";

import CheckIcon from "@/public/checked_circle.svg";
import DeleteIcon from "@/public/Delete_icon.svg";
import PenIcon from "@/public/Pen_icon.svg";
import RedDeleteIcon from "@/public/Red_Delete_icon.svg";

// TAG ICONS
import HomeIcon from "@/public/home_icon.svg";
import WorkIcon from "@/public/work_icon.svg";
import StoreIcon from "@/public/Store_icon.svg";
import MallIcon from "@/public/Mall_icon.svg";
import OtherIcon from "@/public/Other_icon.svg";

export default function AddressesPage() {
  const [screen, setScreen] = useState<"list" | "add" | "edit">("list");
  const [selectedTag, setSelectedTag] = useState("Home");
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const tagIcons: Record<string, any> = {
    Home: HomeIcon,
    Work: WorkIcon,
    Store: StoreIcon,
    Mall: MallIcon,
    Office: StoreIcon,
    Others: OtherIcon,
  };

  // addresses now from API
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState({
    addressLine: "",
    emirate: "Abu Dhabi",
    area: "Al Reef",
    building: "",
    villa: "",
    additional: "",
    category: "Residential",
  });

  const resetForm = () =>
    setForm({
      addressLine: "",
      emirate: "Abu Dhabi",
      area: "Al Reef",
      building: "",
      villa: "",
      additional: "",
      category: "Residential",
    });

  // ------------------ MAP / AUTOCOMPLETE REFS & STATE ------------------
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // ------------------ API: fetch addresses ------------------
  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await apiClient.get("/user/user-auth/V1/user-details");
      const user = res.data?.data || null;

      // backend returns addresses as array; normalize to UI shape
      const apiAddresses: any[] = Array.isArray(user?.addresses) ? user.addresses : [];

      const mapped = apiAddresses.map((a) => ({
        id: a.id,
        label: a.save_as_address_type || "Home",
        addressLine:
          a.location ||
          [a.emirate, a.area, a.building, a.appartment, a.addtional_address]
            .filter(Boolean)
            .join(", "),
        emirate: a.emirate || "Abu Dhabi",
        area: a.area || "",
        building: a.building || "",
        villa: a.appartment || a.villa || "",
        additional: a.addtional_address || "",
        category: a.category ? capitalizeFirst(a.category) : "Residential",
        raw: a,
      }));

      setAddresses(mapped);
    } catch (err) {
      console.error("Failed to load addresses", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // ------------------ Helpers ------------------
  function capitalizeFirst(s?: string) {
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  // --------------- UI actions (open add/edit) ----------------
  const openAdd = () => {
    resetForm();
    setSelectedTag("Home");
    setEditId(null);
    setScreen("add");

    // center on current coords if available
    if (coords && mapInstanceRef.current) {
      try {
        mapInstanceRef.current.setCenter(coords);
        markerRef.current && markerRef.current.setPosition(coords);
      } catch (e) {}
    }
  };

  const openEdit = (id: number) => {
    const a = addresses.find((x) => x.id === id);
    setEditId(id);
    setForm({
      addressLine: a?.addressLine || "",
      emirate: a?.emirate || "Abu Dhabi",
      area: a?.area || "Al Reef",
      building: a?.building || "",
      villa: a?.villa || "",
      additional: a?.additional || "",
      category: a?.category || "Residential",
    });
    setSelectedTag(a?.label || "Home");
    setScreen("edit");

    // try center on saved coords if available in raw payload
    const raw = a?.raw;
    const lat = raw?.latitude || raw?.lat || null;
    const lng = raw?.longitude || raw?.lng || null;
    if (lat && lng && mapInstanceRef.current) {
      const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
      try {
        mapInstanceRef.current.setCenter(position);
        markerRef.current && markerRef.current.setPosition(position);
      } catch (e) {}
    }
  };

  // ------------------ Save (Add) ------------------
  const saveAddress = async () => {
    try {
      const payload: any = {
        emirate: form.emirate,
        area: form.area,
        building: form.building,
        appartment: form.villa,
        addtional_address: form.additional,
        category: form.category ? form.category.toLowerCase() : "residential",
        save_as_address_type: selectedTag,
        location: form.addressLine,
      };

      if (coords) {
        payload.latitude = coords.lat;
        payload.longitude = coords.lng;
      }

      await apiClient.patch("/user/user-auth/V1/update-profile", payload);

      await fetchAddresses();
      setScreen("list");
      showSuccess("Address Added Successfully");
    } catch (err) {
      console.error("Save address error", err);
      showSuccess("Failed to add address");
    }
  };

  // ------------------ Update ------------------
  const updateAddress = async () => {
    try {
      const payload: any = {
        id: editId,
        emirate: form.emirate,
        area: form.area,
        building: form.building,
        appartment: form.villa,
        addtional_address: form.additional,
        category: form.category ? form.category.toLowerCase() : "residential",
        save_as_address_type: selectedTag,
        location: form.addressLine,
      };

      if (coords) {
        payload.latitude = coords.lat;
        payload.longitude = coords.lng;
      }

      if (editId) payload.address_id = editId; // include if backend expects it

      await apiClient.post("/user/user-auth/V1/upsert-address", payload);

      await fetchAddresses();
      setScreen("list");
      showSuccess("Address Updated Successfully");
    } catch (err) {
      console.error("Update address error", err);
      showSuccess("Failed to update address");
    }
  };

  // ------------------ Delete ------------------
  const deleteAddress = async () => {
  try {
    if (showDeleteConfirm === null) return;

    await apiClient.delete(`/user/user-auth/V1/delete-address/${showDeleteConfirm}`);

    setAddresses((prev) => prev.filter((x) => x.id !== showDeleteConfirm));
    setShowDeleteConfirm(null);
    showSuccess("Address Deleted Successfully");

    fetchAddresses();
  } catch (err) {
    console.error("Delete address failed", err);
    showSuccess("Failed to delete address");
  }
};


  // ------------------ Utilities ------------------
  const showSuccess = (text: string) => {
    setMessage(text);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 1500);
  };

  // ------------------ GOOGLE MAPS + AUTOCOMPLETE LOADER & INIT ------------------
  useEffect(() => {
    // initialize only when add/edit screen is visible
    if (screen === "list") return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
      return;
    }

    let mounted = true;
    const existing = (window as any).google;

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
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
        // ensure map container exists
        if (!mapRef.current) return;

        if (!existing) {
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

        const defaultCoords = { lat: 25.2048, lng: 55.2708 };

        const startCoords: { lat: number; lng: number } =
          await new Promise((resolve) => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) =>
                  resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => resolve(defaultCoords),
                { timeout: 5000 }
              );
            } else {
              resolve(defaultCoords);
            }
          });

        // create map and marker
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: startCoords,
          zoom: 15,
        });

        markerRef.current = new google.maps.Marker({
          position: startCoords,
          map: mapInstanceRef.current,
        });

        setCoords(startCoords);
        setMapLoaded(true);

        // Autocomplete on the input
        const input = document.getElementById("address-input") as HTMLInputElement | null;
        if (input) {
          autocompleteRef.current = new google.maps.places.Autocomplete(input, {
            types: ["geocode", "establishment"],
            componentRestrictions: {}, // optionally { country: "ae" }
          });

          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current.getPlace();
            if (!place) return;

            const formatted = place.formatted_address || input.value;
            const location = place.geometry?.location;
            const newCoords = location
              ? { lat: location.lat(), lng: location.lng() }
              : null;

            const components: any = {};
            (place.address_components || []).forEach((comp: any) => {
              (comp.types || []).forEach((t: string) => {
                components[t] = comp.long_name;
              });
            });

            setForm((prev) => ({
              ...prev,
              addressLine: formatted,
              emirate: components["administrative_area_level_1"] || components["country"] || prev.emirate,
              area: components["sublocality"] || components["neighborhood"] || components["locality"] || prev.area,
              building: components["premise"] || prev.building,
              villa: components["subpremise"] || prev.villa,
              additional: prev.additional,
            }));

            if (newCoords && mapInstanceRef.current) {
              try {
                markerRef.current.setPosition(newCoords);
                mapInstanceRef.current.setCenter(newCoords);
                setCoords(newCoords);
              } catch (e) {}
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
        } catch (e) {}
      }
    };
    // re-run when screen changes
  }, [screen]);

  // allow manual change in address input to try to geocode on blur (optional helper)
  const geocodeAddressOnBlur = async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !form.addressLine) return;

    try {
      const encoded = encodeURIComponent(form.addressLine);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${apiKey}`;
      const r = await fetch(url);
      const j = await r.json();
      if (j.results && j.results.length > 0) {
        const place = j.results[0];
        const loc = place.geometry.location;
        const newCoords = { lat: loc.lat, lng: loc.lng };

        const comps: any = {};
        (place.address_components || []).forEach((comp: any) =>
          (comp.types || []).forEach((t: string) => (comps[t] = comp.long_name))
        );

        setForm((prev) => ({
          ...prev,
          emirate: comps["administrative_area_level_1"] || comps["country"] || prev.emirate,
          area: comps["sublocality"] || comps["neighborhood"] || comps["locality"] || prev.area,
          building: comps["premise"] || prev.building,
          villa: comps["subpremise"] || prev.villa,
        }));

        if (mapInstanceRef.current) {
          try {
            markerRef.current.setPosition(newCoords);
            mapInstanceRef.current.setCenter(newCoords);
            setCoords(newCoords);
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn("Geocode lookup failed", err);
    }
  };

  return (
    <UserLayout>
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-10 shadow-lg text-center">
            <Image src={CheckIcon} alt="success" className="w-10 h-10 mx-auto mb-4" />
            <p className="text-lg font-medium">{message}</p>
          </div>
        </div>
      )}

      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg text-center w-[360px]">
            <Image src={RedDeleteIcon} alt="delete" className="w-10 h-10 mx-auto mb-4" />
            <p className="font-medium text-lg mb-6">Sure want to Delete Address</p>

            <div className="flex justify-center gap-4">
              <button className="px-6 py-2 border rounded-lg" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="px-6 py-2 bg-red-500 text-white rounded-lg" onClick={deleteAddress}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {screen === "list" && (
        <>
          <div className="flex justify-between mb-6">
            <h2 className="text-lg font-semibold text-red-600">Addresses</h2>
            <button onClick={openAdd} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
              + Add New Address
            </button>
          </div>

          <div className="space-y-4">
            {loadingAddresses ? (
              <div className="text-sm text-gray-500">Loading addresses...</div>
            ) : addresses.length === 0 ? (
              <div className="text-sm text-gray-500">No saved addresses</div>
            ) : (
              addresses.map((a) => (
                <div key={a.id} className="border rounded-xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Image src={tagIcons[a.label] || OtherIcon} alt="tag" className="w-5 h-5" />
                    <div>
                      <p className="font-semibold">{a.label}</p>
                      <p className="text-sm text-gray-600">{a.addressLine}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => openEdit(a.id)} className="flex items-center gap-1 text-sm border px-4 py-1 rounded-lg">
                      <Image src={PenIcon} alt="edit" className="w-4 h-4" /> Edit
                    </button>

                    <button onClick={() => setShowDeleteConfirm(a.id)} className="flex items-center gap-1 text-sm border px-4 py-1 rounded-lg">
                      <Image src={DeleteIcon} alt="del" className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {(screen === "add" || screen === "edit") && (
        <>
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            {screen === "add" ? "Add New Address" : "Edit Address"}
          </h2>

          <div className="border rounded-xl p-6 space-y-6">
            {/* Map container (Google Maps JS will render here) */}
            <div
              ref={mapRef}
              id="map"
              className="w-full h-64 rounded-lg"
              style={{ minHeight: 200 }}
            />

            {/* Address input (autocomplete attaches here) */}
            <input
              id="address-input"
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={form.addressLine}
              onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
              onBlur={geocodeAddressOnBlur}
              placeholder="Search or type address"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                className="border px-3 py-2 rounded-md text-sm"
                value={form.emirate}
                onChange={(e) => setForm({ ...form, emirate: e.target.value })}
              >
                <option>Abu Dhabi</option>
                <option>Dubai</option>
                <option>Sharjah</option>
              </select>

              <select
                className="border px-3 py-2 rounded-md text-sm"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
              >
                <option>Al Reef</option>
                <option>Bur Dubai</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                className="border px-3 py-2 rounded-md text-sm"
                placeholder="Enter Building Name"
                value={form.building}
                onChange={(e) => setForm({ ...form, building: e.target.value })}
              />
              <input
                className="border px-3 py-2 rounded-md text-sm"
                placeholder="Enter Apartment Number"
                value={form.villa}
                onChange={(e) => setForm({ ...form, villa: e.target.value })}
              />
            </div>

            <textarea
              className="border w-full px-3 py-2 rounded-md text-sm"
              placeholder="Enter Address details"
              value={form.additional}
              onChange={(e) => setForm({ ...form, additional: e.target.value })}
            />

            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={form.category === "Residential"}
                  onChange={() => setForm({ ...form, category: "Residential" })}
                />
                Residential
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={form.category === "Commercial"}
                  onChange={() => setForm({ ...form, category: "Commercial" })}
                />
                Commercial
              </label>
            </div>

            <div>
              <label className="text-sm font-medium">Save Address As</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.keys(tagIcons).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(t)}
                    className={`flex items-center gap-2 px-4 py-1 rounded-full border text-sm ${
                      selectedTag === t ? "bg-red-100 border-red-500 text-red-600" : ""
                    }`}
                  >
                    <Image src={tagIcons[t]} alt={t} className="w-4 h-4" /> {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setScreen("list")} className="px-6 py-2 border rounded-lg">Back</button>
              <button
                onClick={screen === "add" ? saveAddress : updateAddress}
                className="px-6 py-2 bg-red-500 text-white rounded-lg"
              >
                {screen === "add" ? "Save" : "Update"}
              </button>
            </div>
          </div>
        </>
      )}
    </UserLayout>
  );
}
