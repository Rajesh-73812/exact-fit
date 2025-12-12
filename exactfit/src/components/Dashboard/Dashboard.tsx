"use client";
import UserLayout from "./UserLayout";

export default function DashboardPage() {
  return (
    <UserLayout>
      <h2 className="text-lg font-semibold text-red-600 mb-6">Dashboard</h2>

      <div className="border p-4 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-red-200 rounded-xl py-10 text-center shadow-sm">
            <h3 className="text-3xl text-red-600 font-bold">5</h3>
            <p className="mt-1 text-sm font-bold">Bookings</p>
          </div>

          <div className="border border-red-200 rounded-xl py-10 text-center shadow-sm">
            <h3 className="text-3xl text-red-600 font-bold">1</h3>
            <p className="mt-1 text-sm font-bold">Subscription</p>
          </div>

          <div className="border border-red-200 rounded-xl py-10 text-center shadow-sm">
            <h3 className="text-3xl text-red-600 font-bold">3</h3>
            <p className="mt-1 text-sm font-bold">Enquiries</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          <div className="border border-red-200 rounded-xl py-10 text-center shadow-sm">
            <h3 className="text-3xl text-red-600 font-bold">2</h3>
            <p className="mt-1 text-sm font-bold">Emergency Requests</p>
          </div>

          <div className="border border-red-200 rounded-xl py-10 text-center shadow-sm">
            <h3 className="text-3xl text-red-600 font-bold">5</h3>
            <p className="mt-1 text-sm font-bold">Payments</p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
