"use client";
import Image from "next/image";
import Link from "next/link";
import WhiteLogo from "@/public/White_logo.png";
import AppStore from "@/public/App_Store.svg";
import PlayStore from "@/public/Play_Store.svg";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0F0F0F] text-white py-16 px-6 md:px-12 lg:px-20">
      
      {/* ✅ TOP ROW — Logo + Columns */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-10">

        {/* Logo Column */}
        <div className="flex flex-col justify-center gap-6">
          <Image
            src={WhiteLogo}
            alt="Exact Fit"
            width={140}
            height={50}
            className="object-contain"
          />
        </div>

        {/* Column 1 */}
        <div className="flex flex-col gap-3 text-sm">
          <Link href="/aboutus">About</Link>
          <Link href="/allservices">Services</Link>
          <Link href="/bookings">Bookings</Link>
          <Link href="/allpackages">Packages</Link>
          <Link href="/contactus">Contact us</Link>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-3 text-sm">
          <Link href="#">Getting Started</Link>
          <Link href="#">Features</Link>
          <Link href="#">FAQs</Link>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-3 text-sm">
          <Link href="#">Terms and Conditions</Link>
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Cookie Notice</Link>
        </div>

        {/* Column 4 — Connect */}
        

      </div>

      {/* ✅ SECOND ROW — App Buttons + Social Icons */}
      <div className="max-w-7xl mx-auto mt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">

        {/* Left: Get the App */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">Get the App</p>

          <div className="flex items-center gap-3">
            <Image src={AppStore} alt="App Store" width={130} height={40} />
            <Image src={PlayStore} alt="Google Play" width={130} height={40} />
          </div>
        </div>

        {/* Right: Social Icons */}
        <div className="flex flex-col gap-6 text-xl">
            <div>
                <p className="text-sm font-semibold">Connect with us</p>
            </div>
          <div className="flex gap-4">
            <Link href="#">
            <i className="ri-twitter-fill"></i>
          </Link>
          <Link href="#">
            <i className="ri-instagram-line"></i>
          </Link>
          <Link href="#">
            <i className="ri-linkedin-fill"></i>
          </Link>
          <Link href="#">
            <i className="ri-youtube-fill"></i>
          </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
