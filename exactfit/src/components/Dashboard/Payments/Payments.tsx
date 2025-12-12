"use client";

import { useState } from "react";
import UserLayout from "@/src/components/Dashboard/UserLayout";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import FilterIcon from "@/public/Filter_icon.svg";
import WhiteFilterIcon from "@/public/White_Filter.svg";

export default function Payments() {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  const payments = [
    {
      id: 1,
      plan: "Executive Plan",
      transactionId: "123456780012",
      date: "09-10-2025",
      amount: "1670 AED",
      status: "Completed",
    },
    {
      id: 2,
      plan: "Emergency Service",
      transactionId: "123456780013",
      date: "10-10-2025",
      amount: "2500 AED",
      status: "Completed",
    },
    {
      id: 3,
      plan: "Custom plan",
      transactionId: "123456780014",
      date: "11-10-2025",
      amount: "3000 AED",
      status: "Completed",
    },
  ];

  const months = [
    "October 2025",
    "September 2025",
    "August 2025",
    "July 2025",
    "June 2025",
    "May 2025",
    "April 2025",
    "March 2025",
  ];

  const toggleMonth = (month: string) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMonths.length === months.length) {
      setSelectedMonths([]);
    } else {
      setSelectedMonths(months);
    }
  };

  return (
    <UserLayout>
      <div className="flex justify-between mb-6">
        <h2 className="text-lg font-semibold text-primary">Payments</h2>

        <div className="flex gap-3">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`px-3 py-1.5 rounded-full text-sm border flex items-center gap-1 transition ${
              showFilter
                ? "bg-primary text-white border-primary"
                : "border-primary text-primary"
            }`}
          >
            <Image
              src={showFilter ? WhiteFilterIcon : FilterIcon}
              alt="Filter"
              className="w-4 h-4"
            />
            Filter
          </button>

          <button className="border px-3 py-1.5 rounded-full text-sm text-primary border-primary flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
              />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* ✅ Payment List */}
      {!showFilter && (
        <div className="space-y-4">
          {payments.map((p) => (
            <div
              key={p.id}
              className="border rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{p.plan}</p>
                <p className="text-sm text-gray-600">
                  Transaction ID: {p.transactionId}
                </p>
                <p className="text-sm text-gray-600">Date: {p.date}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-semibold self-end text-gray-900">
                  {p.amount}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Payment Status:{" "}
                  <span className="font-medium">{p.status}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Filter View */}
      {showFilter && (
        <div className="border rounded-xl p-6 space-y-4">
          <div className="flex flex-col space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMonths.length === months.length}
                onChange={toggleSelectAll}
                className="accent-primary w-4 h-4"
              />
              Select All
            </label>

            <hr />

            {months.map((month) => (
              <label
                key={month}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedMonths.includes(month)}
                  onChange={() => toggleMonth(month)}
                  className="accent-primary w-4 h-4"
                />
                {month}
              </label>
            ))}
          </div>

          <div className="flex justify-between pt-6">
            <button
              onClick={() => setShowFilter(false)}
              className="px-6 py-2 border rounded-lg text-sm border-primary text-primary"
            >
              &lt; Back
            </button>
            <button
              onClick={() => setShowFilter(false)}
              className="px-6 py-2 bg-primary text-white rounded-lg text-sm"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
