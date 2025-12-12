"use client";

import { useState } from "react";
import UserLayout from "@/src/components/Dashboard/UserLayout";

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Technician Assigned",
      message:
        "Technician assigned will reach out you at specified time and date. — 06:40pm, 27-10-2025",
    },
    {
      id: 2,
      title: "Subscription Confirmed",
      message:
        "Technician assigned will reach out you at specified time and date. — 08:46pm, 27-10-2025",
    },
    {
      id: 3,
      title: "Next Service Schedule",
      message:
        "Your appointment has been rescheduled to a new date. Please check your email for details.",
    },
    {
      id: 4,
      title: "Payment Received",
      message:
        "Thank you! Your payment has been successfully processed. An email confirmation has been sent.",
    },
    {
      id: 5,
      title: "Service Completed",
      message:
        "The service you requested has been completed. A follow-up email will be sent shortly.",
    },
  ]);

  const clearAll = () => setNotifications([]);

  return (
    <UserLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-primary">Notifications</h2>
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="border rounded-xl p-4 space-y-3">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">
            No new notifications
          </p>
        ) : (
          notifications.map((note) => (
            <div
              key={note.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <p className="font-medium text-gray-800">{note.title}</p>
              <p className="text-sm text-gray-600 mt-1">{note.message}</p>
            </div>
          ))
        )}
      </div>
    </UserLayout>
  );
}
