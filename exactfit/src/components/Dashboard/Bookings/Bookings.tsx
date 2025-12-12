"use client";

import { useState, useEffect, useRef } from "react";
import UserLayout from "@/src/components/Dashboard/UserLayout";
import Image from "next/image";
import CheckIcon from "@/public/checked_circle.svg";
import FilterIcon from "@/public/Filter_icon.svg";
import apiClient from "@/lib/apiClient";

type ScheduleItem = {
  service: string;
  date: string;
  done: boolean;
};

type SubscriptionItem = {
  id: number | string;
  name: string;
  price: string;
  status: string;
  startDate: string;
  endDate: string;
  included?: string[];
  schedules?: ScheduleItem[];
};

type EnquiryItem = {
  id: number | string;
  title: string;
  status: string;
  date: string;
  description: string[];
};

type EmergencyItem = {
  id: number | string;
  title: string;
  status: string;
  date: string;
  description: string[];
};
type WithStatus = { status?: string };

const SUBSCRIPTION_BASE = "/user/user-subscription/V1";
const BOOKING_BASE = "/user/booking/V1";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export default function BookingsPage() {
  const [tab, setTab] = useState<"subscription" | "enquiries" | "emergency">(
    "subscription"
  );
  const [expanded, setExpanded] = useState<number | string | null>(null);
  const [filter, setFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [showAcceptPopup, setShowAcceptPopup] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);

  // ---------------- STATE FROM API ----------------
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyItem[]>([]);

  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [loadingEmergencies, setLoadingEmergencies] = useState(false);

  // ---------------- FILTER POPUP OUTSIDE CLICK ----------------
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // ---------------- STATUS COLOR ----------------
  const getStatusClass = (status: string) =>
    status === "Active"
      ? "text-green-600"
      : status === "In Progress"
      ? "text-orange-500"
      : status === "Under Review"
      ? "text-blue-500"
      : "text-gray-500";

  // ---------------- FILTER OPTIONS ----------------
  const filterOptions =
    tab === "subscription"
      ? ["All", "Active", "Completed"]
      : tab === "enquiries"
      ? ["All","Pending", "Completed", "In Progress", "Under Review"]
      : ["All", "Pending","Active", "In Progress", "Completed"];

  const getFiltered = <T extends WithStatus>(list: T[]) =>
    filter === "All" ? list : list.filter((x) => x.status === filter);

  // ---------------- FETCH SUBSCRIPTIONS ----------------
  const fetchSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true);
      const res = await apiClient.get(`${SUBSCRIPTION_BASE}/get-subscription`, {
        params: {
          
          offset: 0,
        },
      });
      console.log(res,"ressssssssssss")
      const body = res.data;


      // Result shape can vary; handle common patterns
      const raw = Array.isArray(body?.subscriptions)
  ? body.subscriptions
  : Array.isArray(body?.data)
  ? body.data
  : [];

      const mapped: SubscriptionItem[] = raw.map((s: any) => {
        const plan =
          s.SubscriptionPlan || s.plan || s.subscriptionPlan || s.subscription_plan;

        const name: string =
          plan?.name || s.name || "Subscription Plan";

        const basePrice = plan?.base_price || s.base_price || s.price_total;
        const price =
          basePrice !== undefined && basePrice !== null
            ? `${basePrice} AED`
            : "";

        // ✅ normalize subscription status to UI labels
const rawStatus = (s.status || "").toString().toLowerCase();
let status: string;

switch (rawStatus) {
  case "active":
    status = "Active";
    break;
  case "pending":
    status = "Pending";
    break;
  case "completed":
  case "complete":
    status = "Completed";
    break;
  default:
    status = s.status || "Active";
}


        const startDate = formatDate(s.start_date || s.startDate);
        const endDate = formatDate(s.end_date || s.endDate);

        let included: string[] | undefined;
        if (plan?.description) {
          const descStr = String(plan.description);
          included = descStr.split("\n").filter((line) => line.trim().length);
        }

        // if schedules ever come from backend, map here; for now keep empty to preserve table layout
        const schedules: ScheduleItem[] | undefined = Array.isArray(s.schedules)
          ? s.schedules.map((sch: any) => ({
              service: sch.service || sch.service_name || "Service",
              date: formatDate(sch.date || sch.schedule_date),
              done: !!sch.done || sch.status === "Completed",
            }))
          : undefined;

        return {
          id: s.id,
          name,
          price,
          status,
          startDate,
          endDate,
          included,
          schedules,
        };
      });

      setSubscriptions(mapped);
    } catch (err) {
      console.error("Fetch subscriptions error:", err);
      setSubscriptions([]);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  // ---------------- FETCH ENQUIRIES ----------------
  const fetchEnquiries = async () => {
    try {
      setLoadingEnquiries(true);
      const res = await apiClient.get(`${BOOKING_BASE}/get-all-enquiry`, {
        params: {
          page: 1,
          pageSize: 50,
          search: "",
        },
      });

      const raw = Array.isArray(res.data?.data) ? res.data.data : [];

      const mapped: EnquiryItem[] = raw.map((e: any) => {
        const title =
          e.scope_of_work ||
          e.title ||
          "Enquiry";

        // ✅ normalize enquiry status
const rawStatus = (e.status || "").toString().toLowerCase();
let status: string;

switch (rawStatus) {
  case "pending":
    status = "Pending";
    break;
  case "in_progress":
  case "in progress":
    status = "In Progress";
    break;
  case "completed":
  case "complete":
    status = "Completed";
    break;
  case "under_review":
  case "under review":
    status = "Under Review";
    break;
  default:
    status = e.status || "Pending";
}

        const date = formatDate(e.createdAt || e.date);

        let description: string[] = [];
        if (Array.isArray(e.description)) {
          description = e.description;
        } else if (typeof e.description === "string") {
          description = e.description
            .split("\n")
            .filter((line:any) => line.trim().length);
        }

        return {
          id: e.id,
          title,
          status,
          date,
          description,
        };
      });

      setEnquiries(mapped);
    } catch (err) {
      console.error("Fetch enquiries error:", err);
      setEnquiries([]);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  // ---------------- FETCH EMERGENCIES ----------------
  const fetchEmergencies = async () => {
    try {
      setLoadingEmergencies(true);
      const res = await apiClient.get(`${BOOKING_BASE}/get-all-emergency`, {
        params: {
          page: 1,
          pageSize: 50,
          search: "",
        },
      });

      const raw = Array.isArray(res.data?.data) ? res.data.data : [];

      const mapped: EmergencyItem[] = raw.map((r: any) => {
        const serviceName =
          r.service?.name ||
          r.sub_service?.name ||
          r.title ||
          "Emergency Service";

        // ✅ normalize emergency status
const rawStatus = (r.status || "").toString().toLowerCase();
let status: string;

switch (rawStatus) {
  case "pending":
    status = "Pending";
    break;
  case "active":
    status = "Active";
    break;
  case "in_progress":
  case "in progress":
    status = "In Progress";
    break;
  case "completed":
  case "complete":
    status = "Completed";
    break;
  case "under_review":
  case "under review":
    status = "Under Review";
    break;
  default:
    status = r.status || "Pending";
}

        const date = formatDate(r.createdAt || r.date);

        let description: string[] = [];
        if (Array.isArray(r.description)) {
          description = r.description;
        } else if (typeof r.description === "string") {
          description = r.description
            .split("\n")
            .filter((line:any) => line.trim().length);
        }

        return {
          id: r.id,
          title: serviceName,
          status,
          date,
          description,
        };
      });

      setEmergencies(mapped);
    } catch (err) {
      console.error("Fetch emergencies error:", err);
      setEmergencies([]);
    } finally {
      setLoadingEmergencies(false);
    }
  };

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    fetchSubscriptions();
    fetchEnquiries();
    fetchEmergencies();
  }, []);

  return (
    <UserLayout>
      {showAcceptPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg text-center w-[380px]">
            <Image
              src={CheckIcon}
              alt="check"
              className="w-12 h-12 mx-auto mb-4"
            />
            <p className="font-medium text-lg mb-6">
              Are you sure want to Accept
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 border rounded-lg"
                onClick={() => setShowAcceptPopup(false)}
              >
                Back
              </button>
              <button
                className="px-6 py-2 bg-red-500 text-white rounded-lg"
                onClick={() => setShowAcceptPopup(false)}
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-primary mb-4">Bookings</h2>

      <div className="border p-4 rounded-2xl">
        <div className="flex justify-between mb-6">
          <div className="flex gap-8 text-sm">
            {[
              { key: "subscription", label: "Subscription" },
              { key: "enquiries", label: "Enquiries" },
              { key: "emergency", label: "Emergency Services" },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`pb-2 ${
                  tab === key
                    ? "text-primary border-b-2 border-red-600 font-semibold"
                    : "text-gray-500"
                }`}
                onClick={() => {
                  setTab(key as typeof tab);
                  setFilter("All");
                  setExpanded(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex justify-end mb-4 relative" ref={filterRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFilter(!showFilter);
              }}
              className="flex items-center gap-2 border border-red-600 text-primary px-4 py-1 rounded-full text-sm"
            >
              <Image src={FilterIcon} alt="filter" className="w-4 h-4" />
              Filter
            </button>

            {showFilter && (
              <ul className="absolute right-0 mt-9 bg-white text-center shadow-xl rounded-xl text-[12px] border w-44 py-2 z-50">
                {filterOptions.map((f) => (
                  <li
                    key={f}
                    onClick={() => {
                      setFilter(f);
                      setShowFilter(false);
                    }}
                    className={`px-4 py-2 cursor-pointer ${
                      filter === f
                        ? "text-primary text-left font-semibold border-b"
                        : "text-gray-800 border-b text-left"
                    }`}
                  >
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* SUBSCRIPTION TAB */}
        {tab === "subscription" && (
          <div className="space-y-4">
            {loadingSubscriptions ? (
              <p className="text-center text-sm text-gray-500 py-6">
                Loading subscriptions...
              </p>
            ) : getFiltered(subscriptions).length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-6">
                No subscription bookings found.
              </p>
            ) : (
              getFiltered(subscriptions).map((plan) => (
                <div key={plan.id} className="border rounded-xl p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-primary">
                        {plan.name}{" "}
                        <span className="text-xs text-black">/ Year</span>
                      </p>
                      <p className="text-xs mt-1 text-gray-500">
                        Plan Start Date:{plan.startDate}, Plan End Date:
                        {plan.endDate}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p
                        className={`text-sm self-end font-semibold ${getStatusClass(
                          plan.status
                        )}`}
                      >
                        {plan.price}
                      </p>
                      <p className="self-end text-[12px]">
                        status: {plan.status}{" "}
                      </p>
                      <button
                        onClick={() =>
                          setExpanded(expanded === plan.id ? null : plan.id)
                        }
                        className="text-primary text-sm mt-2 self-end"
                      >
                        View Plan Details {expanded === plan.id ? "▲" : "▼"}
                      </button>
                    </div>
                  </div>

                  {expanded === plan.id && (
                    <div className="mt-4 border-t pt-4 text-sm">
                      <p className="font-semibold mb-2">What's included:</p>
                      <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-700">
                        {plan.included && plan.included.length > 0 ? (
                          plan.included.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))
                        ) : (
                          <li>No description available</li>
                        )}
                      </ul>

                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-center text-primary border-b">
                            <th className="py-2 text-left">Service Name</th>
                            <th>Schedule Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plan.schedules && plan.schedules.length > 0 ? (
                            plan.schedules.map(
                              (s: ScheduleItem, i: number) => (
                                <tr key={i} className="border-b text-center">
                                  <td className="py-2 text-left">
                                    {s.service}
                                  </td>
                                  <td>{s.date}</td>
                                  <td
                                    className={
                                      s.done
                                        ? "text-primary font-bold"
                                        : "text-gray-500"
                                    }
                                  >
                                    {s.done ? "✓" : "✕"}
                                  </td>
                                </tr>
                              )
                            )
                          ) : (
                            <tr>
                              <td
                                colSpan={3}
                                className="text-center py-3 text-gray-500"
                              >
                                No scheduled services
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ENQUIRIES TAB */}
        {tab === "enquiries" && (
          <div className="space-y-4">
            {loadingEnquiries ? (
              <p className="text-center text-sm text-gray-500 py-6">
                Loading enquiries...
              </p>
            ) : getFiltered(enquiries).length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-6">
                No enquiries found.
              </p>
            ) : (
              getFiltered(enquiries).map((e) => (
                <div key={e.id} className="flex border rounded-xl p-4">
                  <div className="text-sm flex-1">
                    <p className="font-semibold text-primary">{e.title}</p>
                    <p className="text-xs text-gray-500 mb-2">
                      Request Raised Date: {e.date}
                    </p>

                    <p className="text-sm font-medium mb-2">Description</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-3">
                      {e.description.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <p className={`text-[12px] ${getStatusClass(e.status)}`}>
                    <span className="text-black">Status:</span> {e.status}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* EMERGENCY TAB */}
        {tab === "emergency" && (
          <div className="space-y-4">
            {loadingEmergencies ? (
              <p className="text-center text-sm text-gray-500 py-6">
                Loading emergency services...
              </p>
            ) : getFiltered(emergencies).length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-6">
                No emergency services found.
              </p>
            ) : (
              getFiltered(emergencies).map((req) => (
                <div key={req.id} className="border rounded-xl p-4 text-sm">
                  <div className="flex justify-between">
                    <p className="font-semibold text-primary">{req.title}</p>
                    <div className="flex flex-col">
                      <p
                        className={`text-[12px] font-semibold self-end ${getStatusClass(
                          req.status
                        )}`}
                      >
                        Status: {req.status}
                      </p>
                      <button
                        onClick={() =>
                          setExpanded(expanded === req.id ? null : req.id)
                        }
                        className="text-primary text-sm self-end"
                      >
                        View Details {expanded === req.id ? "▲" : "▼"}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    Request Raised Date: {req.date}
                  </p>

                  {expanded === req.id && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-sm font-medium mb-2">Description</p>
                      <ul className="list-disc pl-5 space-y-1 mb-4 text-gray-700">
                        {req.description.map((d: string, i: number) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>

                      <p className="text-sm mb-3">
                        Quotation sent by Exact Fit team
                      </p>

                      <label className="flex items-center gap-2 text-sm cursor-pointer mb-4">
                        <input
                          type="checkbox"
                          className="accent-red-600"
                        />
                        I accept the{" "}
                        <a
                          href="/quotation.pdf"
                          download
                          className="text-primary underline"
                        >
                          Quotation Received
                        </a>
                      </label>

                      <div className="flex justify-end">
                        <button
                          className="px-6 py-2 bg-red-600 text-white rounded-lg"
                          onClick={() => setShowAcceptPopup(true)}
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
