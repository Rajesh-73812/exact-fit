"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, User, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/public/White_logo.png";
import apiClient from "@/lib/apiClient";

type Sub = { label: string; id: string };
type NavCategory = {
  label: string;
  id: string;
  subs?: Sub[];
  // from services table `type` column (Subscription / Enquiry)
  serviceType?: "subscription" | "enquiry" | string;
};

type SelectedType = "subscription" | "enquiry" | null;

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const [userPhone, setUserPhone] = useState<string | null>(null);

  // dynamic nav categories loaded from API
  const [navCategories, setNavCategories] = useState<NavCategory[]>([]);

  // for desktop mega menu
  const [selectedType, setSelectedType] = useState<SelectedType>(null);
  const [hoveredServiceId, setHoveredServiceId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const phone =
      typeof window !== "undefined" ? localStorage.getItem("userPhone") : null;
    setUserPhone(phone);
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchNavCategories = async () => {
      try {
        const res = await apiClient.get(
          "/user/dashboard/V1/get-all-services-sub-services",
        );
        const apiServices = res.data?.data || [];
        console.log(res, "Ressssssssss");

        const mapped: NavCategory[] = apiServices.map((service: any) => {
          const subs: Sub[] = (service.sub_services || []).map((s: any) => ({
            label: s.title || "Sub Service",
            id: s.sub_service_slug || String(s.id || ""),
          }));

          // read `type` column from service table (adjust key if needed)
          const rawType =
            service.type ?? service.service_type ?? service.serviceType ?? "";
          const normalizedType = String(rawType).toLowerCase();
          console.log(rawType, "rrrrrrrrrrraw");

          let serviceType: "subscription" | "enquiry" | string | undefined;
          if (normalizedType.includes("sub")) serviceType = "subscription";
          else if (normalizedType.includes("enq")) serviceType = "enquiry";
          else serviceType = normalizedType;

          return {
            label: service.title || "Service",
            id: service.service_slug || String(service.id || ""),
            subs,
            serviceType,
          };
        });

        if (mounted) setNavCategories(mapped);
      } catch (err) {
        console.error("Failed to load nav categories", err);
      }
    };

    fetchNavCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userPhone");
    }
    setUserPhone(null);
  };

  const clearTimeoutIfExists = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };

  const delayedClose = () => {
    closeTimeout.current = setTimeout(() => {
      setOpenDropdown(null);
      setOpenSubDropdown(null);
      setSelectedType(null);
      setHoveredServiceId(null);
    }, 150);
  };

  const servicesBySelectedType = selectedType
    ? navCategories.filter((cat) => {
        if (selectedType === "subscription")
          return cat.serviceType === "subscription";
        if (selectedType === "enquiry") return cat.serviceType === "enquiry";
        return false;
      })
    : [];

  const activeService =
    hoveredServiceId && servicesBySelectedType.length
      ? servicesBySelectedType.find((s) => s.id === hoveredServiceId)
      : undefined;

  return (
    <nav className="bg-[#303030] text-white flex items-center px-4 md:px-6 py-4 rounded-full shadow-md relative">
      {/* LEFT */}
      <div className="flex items-center">
        <button className="md:hidden" onClick={() => setMobileOpen(true)}>
          <Menu size={24} />
        </button>
        <Link href="/">
          <div className="hidden md:block ml-4">
            <Image src={Logo} alt="logo" width={120} height={40} priority />
          </div>
        </Link>
      </div>

      {/* CENTER (Desktop) */}
      <div className="flex-1 flex justify-center items-center">
        <ul className="hidden md:flex md:space-x-8 text-sm items-center">
          <li>
            <Link href="/">Home</Link>
          </li>

          {/* SERVICES (Desktop) */}
          <li>
            <div
              className="relative"
              onMouseEnter={() => {
                clearTimeoutIfExists();
                setOpenDropdown("services");
              }}
              onMouseLeave={delayedClose}
            >
              <button className="flex items-center hover:text-gray-300">
                Services
              </button>

              {openDropdown === "services" && (
                <div className="absolute -left-18 top-full mt-7 z-50">
                  {/* mega menu */}
                  <div className="flex gap-2 items-start bg-transparent">
                    {/* Column 1: Subscription / Enquiry selector card */}
                    <div className="bg-white rounded-3xl shadow-lg px-3 py-3 min-w-[220px] flex flex-col justify-center">
                      <div
                        onMouseEnter={() => {
                          setSelectedType("subscription");
                          setHoveredServiceId(null);
                        }}
                        className={`cursor-pointer text-center text-sm font-semibold py-2 ${
                          selectedType === "subscription"
                            ? "text-[#e30613]"
                            : "text-black"
                        }`}
                      >
                        Subscription Services
                      </div>
                      <div className="border-t my-2" />
                      <div
                        onMouseEnter={() => {
                          setSelectedType("enquiry");
                          setHoveredServiceId(null);
                        }}
                        className={`cursor-pointer text-center font-semibold text-sm py-2 ${
                          selectedType === "enquiry"
                            ? "text-[#e30613]"
                            : "text-black"
                        }`}
                      >
                        Enquiry Services
                      </div>
                    </div>

                    {/* Column 2: Services list by type (only when type hovered) */}
                    {selectedType && (
                      <div className="bg-white rounded-3xl mt-6 border border-gray-150 shadow-lg px-2 py-3 min-w-[200px]">
                        <div className="space-y-2 text-sm">
                          {servicesBySelectedType.length === 0 ? (
                            <div className="text-center text-gray-400">
                              No services
                            </div>
                          ) : (
                            servicesBySelectedType.map((service) => (
                              <button
                                key={service.id}
                                onMouseEnter={() =>
                                  setHoveredServiceId(service.id)
                                }
                                onClick={() =>
                                  router.push(`/allservices#${service.id}`)
                                }
                                className={`w-full text-center py-1.5 border-b last:border-b-0 ${
                                  activeService?.id === service.id
                                    ? "text-[#e30613]"
                                    : "text-black hover:text-[#e30613]"
                                }`}
                              >
                                {service.label}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Column 3: Sub-services of hovered service (only when service hovered) */}
                    {activeService && (
                      <div className="bg-white rounded-3xl mt-12 shadow-xl border border-gray-150 px-2 py-3 min-w-[200px]">
                        <div className="space-y-2 text-sm">
                          {activeService.subs &&
                          activeService.subs.length > 0 ? (
                            activeService.subs.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/allservices#${sub.id}`}
                                className="block text-center py-1.5 border-b text-black last:border-b-0 hover:text-[#e30613]"
                              >
                                {sub.label}
                              </Link>
                            ))
                          ) : (
                            <div className="text-center text-gray-400">
                              No sub services
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </li>

          <li>
            <Link href="/aboutus">About Us</Link>
          </li>
        </ul>
      </div>

      {/* RIGHT */}
      <div className="flex items-center space-x-4">
        <Link href="/contactus">
          <button className="hidden md:block bg-white text-black px-4 py-2 cursor-pointer rounded-full text-sm font-medium hover:bg-gray-200">
            Contact us
          </button>
        </Link>

        {/* Dynamic SignIn / User */}
        {userPhone ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <div className="bg-primary p-2 rounded-full cursor-pointer hover:bg-[#c81a20]">
                <User size={18} />
              </div>
            </Link>
          </div>
        ) : (
          <Link
            href="/signin"
            className="bg-primary px-4 py-2 rounded-full text-sm hover:bg-[#c81a20]"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-[80%] sm:w-[60%] bg-[#303030] text-white z-50 rounded-r-2xl shadow-xl transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-300`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <Image src={Logo} alt="logo" width={100} height={40} />
          <button
            onClick={() => {
              setMobileOpen(false);
              setMobileServicesOpen(false);
              setOpenSubDropdown(null);
            }}
          >
            <X size={24} />
          </button>
        </div>

        <ul className="p-4 space-y-4 text-sm">
          <li>
            <Link href="/" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
          </li>

          {/* TAP TO EXPAND SERVICES (Mobile) */}
          <li>
            <button
              onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              className="flex justify-between w-full"
            >
              Services <ChevronDown size={14} />
            </button>

            {mobileServicesOpen && (
              <ul className="ml-4 mt-2 space-y-3">
                {navCategories.length === 0 ? (
                  <li className="text-gray-300">Loading...</li>
                ) : (
                  navCategories.map((cat) => (
                    <li key={cat.label}>
                      {cat.subs && cat.subs.length > 0 ? (
                        <>
                          <button
                            onClick={() =>
                              setOpenSubDropdown(
                                openSubDropdown === cat.label ? null : cat.label
                              )
                            }
                            className="flex justify-between w-full text-left"
                          >
                            {cat.label} <ChevronDown size={12} />
                          </button>

                          {openSubDropdown === cat.label && (
                            <ul className="ml-4 mt-1 space-y-1 text-gray-300">
                              {cat.subs.map((sub) => (
                                <li
                                  key={sub.id}
                                  className="border-l pl-2 hover:text-white"
                                >
                                  <Link
                                    href={`/allservices#${sub.id}`}
                                    onClick={() => setMobileOpen(false)}
                                  >
                                    {sub.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <Link
                          href={`/allservices#${cat.id}`}
                          onClick={() => setMobileOpen(false)}
                        >
                          {cat.label}
                        </Link>
                      )}
                    </li>
                  ))
                )}
              </ul>
            )}
          </li>

          <li>
            <Link href="/aboutus" onClick={() => setMobileOpen(false)}>
              About Us
            </Link>
          </li>
          <li>
            <Link href="/contactus" onClick={() => setMobileOpen(false)}>
              <button className="bg-white text-black px-4 py-2 rounded-full">
                Contact us
              </button>
            </Link>
          </li>

          {/* Mobile Login / User */}
          <li>
            {userPhone ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <div className="bg-primary p-2 rounded-full cursor-pointer">
                    <User size={18} />
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="text-sm text-gray-300 hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/signin"
                onClick={() => setMobileOpen(false)}
                className="bg-primary px-4 py-2 rounded-full text-sm"
              >
                Sign In
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
