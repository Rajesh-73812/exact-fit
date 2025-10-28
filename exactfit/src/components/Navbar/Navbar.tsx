"use client";
import { useState } from "react";
import { useRef } from "react";
import { ChevronDown, User, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/White_logo.png";

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  // simulate auth (replace with real logic later)
  const isLoggedIn = false;

  return (
    <nav className="bg-[#303030] text-white flex items-center px-4 md:px-6 py-4 rounded-full shadow-md relative">
      {/* Left: Mobile Hamburger / Desktop Logo */}
      <div className="flex items-center">
        <button className="md:hidden" onClick={() => setMobileOpen(true)}>
          <Menu size={24} />
        </button>
        <div className="hidden md:block ml-0 md:ml-4">
          <Image src={Logo} alt="logo" width={120} height={40} priority />
        </div>
      </div>

      {/* Middle: Desktop Menu (Home/Services/About) / Mobile Logo */}
      <div className="flex-1 flex justify-center items-center">
        {/* Desktop Middle Menu */}
        <ul className="hidden md:flex md:space-x-8 text-sm items-center">
          <li>
            <Link href="/" className="hover:text-gray-300">
              Home
            </Link>
          </li>

          <li>
            <div
              className="relative group"
              onMouseEnter={() => {
                setOpenDropdown("services");
                // Clear any pending close timeout
                if (closeTimeout.current) clearTimeout(closeTimeout.current);
              }}
              onMouseLeave={() => {
                // Delay close to bridge hover gaps
                closeTimeout.current = setTimeout(() => {
                  setOpenDropdown(null);
                  setOpenSubDropdown(null);
                }, 150);
              }}
            >
              <button
                className="flex items-center hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(
                    openDropdown === "services" ? null : "services"
                  );
                }}
              >
                Services <ChevronDown size={14} className="ml-1" />
              </button>

              {openDropdown === "services" && (
                <ul
                  className="absolute left-0 top-full mt-0 bg-white text-black rounded-lg shadow-lg w-56 py-2 z-50"
                  onMouseEnter={() => {
                    if (closeTimeout.current)
                      clearTimeout(closeTimeout.current);
                  }}
                  onMouseLeave={() => {
                    closeTimeout.current = setTimeout(() => {
                      setOpenDropdown(null);
                      setOpenSubDropdown(null);
                    }, 150);
                  }}
                >
                  {[
                    "Air Conditioning Services",
                    "Electrical Services",
                    "Gardening Services",
                    "Cleaning Services",
                    "Plumbing Services",
                    "Building Services",
                  ].map((item) => (
                    <li key={item}>
                      {item === "Air Conditioning Services" ? (
                        <div
                          className="relative"
                          onMouseEnter={() => {
                            setOpenSubDropdown(item);
                            if (closeTimeout.current)
                              clearTimeout(closeTimeout.current);
                          }}
                          onMouseLeave={() => {
                            closeTimeout.current = setTimeout(
                              () => setOpenSubDropdown(null),
                              150
                            );
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenSubDropdown(
                              openSubDropdown === item ? null : item
                            );
                          }}
                        >
                          <div className="flex justify-between items-center px-4 border-b py-2 hover:bg-gray-100 cursor-pointer text-primary">
                            {item}
                            <ChevronDown size={12} />
                          </div>

                          {openSubDropdown === item && (
                            <ul className="absolute left-full top-0 bg-white text-black rounded-lg shadow-lg w-48 py-2 z-50">
                              {[
                                "AC Cleaning",
                                "Foam Jet Cleaning",
                                "Deep Water Cleaning",
                                "AC Installation",
                                "Gas Filling",
                                "AC Repair",
                              ].map((sub) => (
                                <li key={sub}>
                                  <Link
                                    href={`/services/${sub
                                      .toLowerCase()
                                      .replace(/ /g, "-")}`}
                                    className="block px-4 py-2 hover:bg-gray-100 text-black hover:text-primary border-b"
                                  >
                                    {sub}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={`/services/${item
                            .toLowerCase()
                            .replace(/ /g, "-")}`}
                          className="block px-4 py-2 hover:bg-gray-100 border-b text-black hover:text-primary"
                        >
                          {item}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>

          <li>
            <Link href="/about" className="hover:text-gray-300">
              About Us
            </Link>
          </li>
        </ul>

        {/* Mobile Middle Logo */}
        <div className="md:hidden">
          <Image src={Logo} alt="logo" width={120} height={40} priority />
        </div>
      </div>

      {/* Right: Desktop Contact + SignIn / Mobile SignIn */}
      <div className="flex items-center space-x-3 md:space-x-4">
        <button className="hidden md:block bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200">
          Contact us
        </button>
        {isLoggedIn ? (
          <div className="bg-primary p-2 rounded-full cursor-pointer hover:bg-primary">
            <User size={18} />
          </div>
        ) : (
          <Link
            href="/signin"
            className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* ---------- Sidebar Menu (Mobile) ---------- */}
      <div
        className={`fixed top-0 left-0 h-full w-[80%] sm:w-[60%] bg-[#303030] text-white transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 rounded-r-2xl shadow-xl md:hidden`}
      >
        {/* Sidebar Header */}
        <div className="flex justify-between items-center px-4 py-4 border-b border-gray-700">
          <Image src={Logo} alt="logo" width={100} height={40} />
          <button onClick={() => setMobileOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Links */}
        <ul className="flex flex-col space-y-4 p-4 text-sm">
          <li>
            <Link
              href="/"
              className="hover:text-gray-300"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
          </li>

          {/* Services Dropdown */}
          {/* Services Dropdown */}
          <li>
            <button
              className="flex justify-between items-center w-full hover:text-gray-300"
              onClick={() =>
                setOpenDropdown(openDropdown === "services" ? null : "services")
              }
            >
              Services <ChevronDown size={14} />
            </button>

            {openDropdown === "services" && (
              <ul className="ml-4 mt-2 space-y-2 text-gray-200">
                {[
                  "Air Conditioning Services",
                  "Electrical Services",
                  "Gardening Services",
                  "Cleaning Services",
                  "Plumbing Services",
                  "Building Services",
                ].map((item) => (
                  <li key={item}>
                    {item === "Air Conditioning Services" ? (
                      <button
                        className="flex justify-between w-full  hover:text-white text-primary" // Red for first
                        onClick={() =>
                          setOpenSubDropdown(
                            openSubDropdown === item ? null : item
                          )
                        }
                      >
                        {item}
                        <ChevronDown size={12} />
                      </button>
                    ) : (
                      <Link
                        href={`/services/${item
                          .toLowerCase()
                          .replace(/ /g, "-")}`}
                        className="block hover:text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item}
                      </Link>
                    )}

                    {/* Sub dropdown */}
                    {openSubDropdown === item && (
                      <ul className="ml-4 mt-2 space-y-1 text-gray-300">
                        {[
                          "AC Cleaning",
                          "Foam Jet Cleaning",
                          "Deep Water Cleaning",
                          "AC Installation",
                          "Gas Filling",
                          "AC Repair",
                        ].map((sub) => (
                          <li
                            key={sub}
                            className="hover:text-white pl-2 border-l border-gray-500"
                          >
                            <Link
                              href={`/services/${sub
                                .toLowerCase()
                                .replace(/ /g, "-")}`}
                              onClick={() => setMobileOpen(false)}
                            >
                              {sub}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li>
            <Link
              href="/about"
              className="hover:text-gray-300"
              onClick={() => setMobileOpen(false)}
            >
              About Us
            </Link>
          </li>

          <li>
            <button
              onClick={() => setMobileOpen(false)}
              className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200"
            >
              Contact us
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
