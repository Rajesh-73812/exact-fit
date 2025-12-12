"use client";
import React, { useState,useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import DashboardIcon from "@/public/Dashboard_icon.svg";
import UserIcon from "@/public/User_icon.svg";
import AddressIcon from "@/public/Address_icon.svg";
import BookingsIcon from "@/public/Bookings_icon.svg";
import PaymentsIcon from "@/public/Payments_icon.svg";
import SubscriptionIcon from "@/public/Subscription_icon.svg";
import NotificationIcon from "@/public/Notification_icon.svg";
import HelpIcon from "@/public/Help_support_icon.svg";
import LogoutIcon from "@/public/Logout_icon.svg";
import EmergencyIcon from "@/public/Red_Emergency_icon.svg";

import Active_Dashboard from "@/public/Active_Dashboard.svg";
import Active_User from "@/public/Active_User.svg";
import Active_Addresses from "@/public/Active_Addresses.svg";
import Active_Bookings from "@/public/Active_Bookings.svg";
import Active_Payments from "@/public/Active_Payments.svg";
import Active_Subscriptions from "@/public/Active_Subscriptions.svg";
import Active_Notifications from "@/public/Active_Notifications.svg";
import Active_Help from "@/public/Active_Help.svg";
import Active_Logout from "@/public/Active_Logout.svg";

import RedLogoutIcon from "@/public/Red_Logout_icon.svg"; // add this icon (same as image)

const menuItems = [
  { name: "Dashboard", icon: DashboardIcon, activeIcon: Active_Dashboard, path: "/dashboard" },
  { name: "Profile", icon: UserIcon, activeIcon: Active_User, path: "/profile" },
  { name: "Addresses", icon: AddressIcon, activeIcon: Active_Addresses, path: "/addresses" },
  { name: "Bookings", icon: BookingsIcon, activeIcon: Active_Bookings, path: "/bookings" },
  { name: "Payments", icon: PaymentsIcon, activeIcon: Active_Payments, path: "/payments" },
  { name: "Subscription", icon: SubscriptionIcon, activeIcon: Active_Subscriptions, path: "/subscriptions" },
  { name: "Notifications", icon: NotificationIcon, activeIcon: Active_Notifications, path: "/notifications" },
  { name: "Help & Support", icon: HelpIcon, activeIcon: Active_Help, path: "/help" },
  { name: "Log out", icon: LogoutIcon, activeIcon: Active_Logout, path: "/logout" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [hasPlan, setHasPlan] = useState(false);


  const handleLogoutClick = (name: string, path: string) => {
    if (name === "Log out") {
      setShowLogoutPopup(true);
    } else {
      router.push(path);
    }
  };

  useEffect(() => {
  const plan = localStorage.getItem("selectedPlan");
  setHasPlan(!!plan);
}, []);

  // update this function
const confirmLogout = () => {
  // remove login data
  localStorage.removeItem("token");
  localStorage.removeItem("userPhone");

  // if you stored plan also remove (optional)
  localStorage.removeItem("selectedPlan");

  setShowLogoutPopup(false);
  router.push("/");
};


  return (
    <>
      <div className="w-full lg:w-[38%] border max-h-max rounded-2xl p-6 shadow-sm relative">

        {/* Emergency Button */}
        {/* ✅ Emergency Button (only visible if plan exists) */}
{hasPlan && (
  <button className="w-full border border-primary text-primary rounded-full py-2 text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition">
    <Image src={EmergencyIcon} alt="Emergency" className="w-4 h-4" />
    <span className="text-black">Emergency Service</span>
    <span className="text-2xl font-bold">→</span>
  </button>
)}

        {/* Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 text-center text-sm font-medium">
          {menuItems.map((item) => (
            <div
              key={item.name}
              onClick={() => handleLogoutClick(item.name, item.path)}
              className={`cursor-pointer border-2 rounded-lg p-5 flex flex-col shadow-sm items-center justify-center transition ${
                pathname === item.path
                  ? "text-primary "
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Image
                src={pathname === item.path ? item.activeIcon : item.icon}
                alt={item.name}
                className="mb-2 w-6 h-6"
              />
              {item.name}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Logout Confirmation Popup */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-10 shadow-lg text-center w-[380px]">
            <Image
              src={RedLogoutIcon}
              alt="Logout"
              className="w-10 h-10 mx-auto mb-4"
            />
            <p className="text-base text-gray-800 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="px-6 py-2 border border-primary text-primary rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-6 py-2 bg-primary text-white rounded-lg"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
