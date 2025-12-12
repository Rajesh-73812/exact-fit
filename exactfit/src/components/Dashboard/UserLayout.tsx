"use client";

import Navbar from "../Navbar/Navbar";
import Footer from "../Homepage/Footer";
import Sidebar from "./Sidebar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="p-4">
        <Navbar />
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDEBAR */}
          <Sidebar />

          {/* RIGHT PANEL CONTENT */}
          <div className="flex-1">{children}</div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
