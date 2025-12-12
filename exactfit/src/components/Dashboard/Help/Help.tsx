"use client";

import { useState, useEffect, useRef } from "react";
import UserLayout from "@/src/components/Dashboard/UserLayout";
import Image from "next/image";
import apiClient from "@/lib/apiClient";

import CheckIcon from "@/public/checked_circle.svg";
import PhoneIcon from "@/public/Phone_icon.svg";
import MailIcon from "@/public/Mail_icon.svg";

// Presigned upload hook
import { usePresignedUpload } from "@/hook/usePresignedUpload";

// ---------- Settings type ----------
type Settings = {
  support_mobile_number?: string;
  support_email?: string;
  contact_us_email?: string;
  contact_us_number?: string;
  website_address?: string;
  address?: string;
};

export default function HelpSupport() {
  const [view, setView] = useState<
    "main" | "raise" | "success" | "tickets" | "ticketDetail"
  >("main");

  // use presigned upload hook (multiple = true)
  const {
    files: uploadedFiles,
    uploading,
    uploadFiles,
    removeFile: removeUploadedFile,
    getUploadedUrls,
  } = usePresignedUpload("tickets", true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({ title: "", description: "" });
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Pending" | "In progress" | "Complete"
  >("All");

  // tickets from API
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // ticket detail
  const [ticketDetail, setTicketDetail] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // simple popup state
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // image preview modal state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalSrc, setImageModalSrc] = useState<string | null>(null);

  // Settings (support contact details from backend)
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const openImageModal = (src: string) => {
    setImageModalSrc(src);
    setImageModalOpen(true);
  };
  const closeImageModal = () => {
    setImageModalOpen(false);
    setImageModalSrc(null);
  };

  // helper: show transient popup
  const showSuccess = (text: string) => {
    setMessage(text);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 1500);
  };

  // ----------------- API endpoints (base) -----------------
  const TICKET_BASE = "/user/ticket/V1";

  // ----------------- Files handling (hook) -----------------
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fArray = Array.from(e.target.files);
    try {
      await uploadFiles(fArray);
    } catch (err) {
      console.error("Presigned upload failed:", err);
      showSuccess("Failed to upload images");
    }
  };

  const removeFile = (index: number) => {
    removeUploadedFile(index);
  };

  // ----------------- Load Settings (support contact) -----------------
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const { data } = await apiClient.get("/admin/settings/V1/get-settings");
        setSettings(data?.data || null);
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // ----------------- Create ticket -----------------
  const handleSubmit = async () => {
    // basic validation
    if (!form.title.trim() || !form.description.trim()) {
      showSuccess("Please enter title and description");
      return;
    }

    setSubmitting(true);
    try {
      // If hook has uploaded files, collect their public URLs
      const uploadedUrls = getUploadedUrls(); // returns array of public URLs

      // Build payload: include images array and a fallback image_url (first)
      const payload: any = {
        title: form.title,
        description: form.description,
      };

      if (uploadedUrls && uploadedUrls.length > 0) {
        payload.images = uploadedUrls; // server can use images[]
        payload.image_url = uploadedUrls[0]; // fallback single image field if needed
      }

      // send JSON — backend expects body (req.body shows images as array)
      await apiClient.post(`${TICKET_BASE}/rise-ticket`, payload);

      setView("success");
      // refresh tickets list so new ticket shows in "My tickets"
      await fetchTickets();
      // reset form + hook files
      setForm({ title: "", description: "" });

      // clear all uploaded files from hook state
      while (uploadedFiles.length > 0) {
        // always remove index 0 until empty
        removeUploadedFile(0);
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Raise ticket error", err);
      showSuccess("Failed to raise ticket");
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------- Fetch tickets -----------------
  const fetchTickets = async (status?: string) => {
    try {
      setLoadingTickets(true);
      let res;
      if (!status || status === "All") {
        res = await apiClient.get(`${TICKET_BASE}/get-all-ticket`);
      } else {
        const statusParam = encodeURIComponent(status.toLowerCase());
        res = await apiClient.get(`${TICKET_BASE}/ticket/${statusParam}`);
      }

      const data = res.data?.data || [];
      setTickets(
        data.map((t: any) => ({
          id: t.ticketNumber || t.id || t._id || "",
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "",
          status: t.status || "Pending",
          raw: t,
        }))
      );
    } catch (err) {
      console.error("Fetch tickets error", err);
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (view === "tickets")
      fetchTickets(statusFilter === "All" ? undefined : statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, statusFilter]);

  // ----------------- Fetch ticket detail -----------------
  const openTicketDetail = async (ticketNumber: string) => {
    try {
      setTicketDetail(null);
      setView("ticketDetail");
      const tn = encodeURIComponent(ticketNumber);
      const res = await apiClient.get(`${TICKET_BASE}/get-ticket/${tn}`);
      setTicketDetail(res.data?.data || null);
    } catch (err) {
      console.error("Fetch ticket detail error", err);
      showSuccess("Failed to load ticket");
      setView("tickets");
    }
  };

  return (
    <UserLayout>
      {/* Success popup after raising ticket */}
      {view === "success" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-10 shadow-lg text-center max-w-md w-full">
            <Image
              src={CheckIcon}
              alt="check"
              className="w-10 h-10 mx-auto mb-4"
            />
            <p className="text-lg font-semibold text-gray-800 mb-2">
              Ticket Raised
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Thanks for reaching out. Our team is on it! You’ll hear from us
              within 24 hours.
            </p>
            <button
              onClick={() => setView("main")}
              className="px-6 py-2 border border-primary text-primary rounded-lg cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Default Help & Support screen */}
      {view === "main" && (
        <div>
          <div className="flex justify-between mb-6">
            <h2 className="text-lg font-semibold text-primary">
              Help & Support
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setView("tickets");
                  setStatusFilter("All");
                }}
                className="border border-primary text-primary px-5 py-1.5 rounded-full text-sm"
              >
                My tickets
              </button>
              <button
                onClick={() => setView("raise")}
                className="bg-primary text-white px-5 py-1.5 rounded-full text-sm"
              >
                Raise a ticket
              </button>
            </div>
          </div>

          <div className=" border p-4 rounded-2xl space-y-4">
            <div className="border rounded-xl">
              {/* Call support (from settings) */}
              <div className="p-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Image src={PhoneIcon} alt="phone" className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Call Support</p>
                    <p className="text-sm text-gray-600">
                      {settingsLoading
                        ? "Loading..."
                        : settings?.support_mobile_number ||
                          settings?.contact_us_number ||
                          "+971 9870643210"}
                    </p>
                  </div>
                </div>
                <button className="bg-primary text-white text-sm px-4 py-1.5 rounded-md">
                  Contact
                </button>
              </div>

              {/* Email support (from settings) */}
              <div className=" p-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Image src={MailIcon} alt="mail" className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-gray-600">
                      {settingsLoading
                        ? "Loading..."
                        : settings?.support_email ||
                          settings?.contact_us_email ||
                          "execatif@gmail.com"}
                    </p>
                  </div>
                </div>
                <button className="bg-primary text-white text-sm px-4 py-1.5 rounded-md">
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Raise a Ticket */}
      {view === "raise" && (
        <div>
          <div className="flex justify-between mb-6">
            <h2 className="text-lg font-semibold text-primary">
              Raise a Ticket
            </h2>
          </div>

          <div className="border rounded-xl p-6 space-y-5">
            <div>
              <label className="text-sm font-medium">Subject/ Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="Enter subject / title"
                className="w-full border border-gray-300 focus:border-primary rounded-md px-4 py-2 mt-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Enter your Description"
                className="w-full border border-gray-300 focus:border-primary rounded-md px-4 py-2 mt-2 text-sm outline-none min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Upload a Screenshot</label>

              <div className="relative mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileUpload"
                />
                <div className="border rounded-md flex items-center justify-between px-4 py-2 w-full bg-white">
                  <span className="text-sm text-gray-400">Choose file</span>
                  <label
                    htmlFor="fileUpload"
                    className="text-sm bg-primary text-white px-4 py-1.5 rounded-md cursor-pointer"
                  >
                    Choose file
                  </label>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedFiles.map((f: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between items-center border rounded-md px-4 py-2 text-sm bg-gray-50"
                    >
                      <span>{f.file.name}</span>
                      <div className="flex items-center gap-2">
                        {f.uploadedUrl ? (
                          <a
                            href={f.uploadedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline text-sm"
                          >
                            View
                          </a>
                        ) : uploading || f.uploading ? (
                          <span className="text-sm text-gray-500">
                            Uploading...
                          </span>
                        ) : null}
                        <button
                          onClick={() => removeFile(i)}
                          className="text-red-600 font-bold text-lg leading-none"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => setView("main")}
                className="px-6 py-2 border border-primary text-primary rounded-lg"
              >
                &lt; Back
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-primary text-white rounded-lg"
                disabled={submitting}
              >
                {submitting ? "Raising..." : "Raise a ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Tickets List */}
      {view === "tickets" && (
        <div>
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("main")}
                className="text-xl font-bold text-gray-600"
              >
                ←
              </button>
              <h2 className="text-lg font-semibold text-primary">My Tickets</h2>
            </div>

            <div className="flex gap-2 mt-3 md:mt-0">
              {(["All", "Pending", "In progress", "Complete"] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-1.5 rounded-full border text-sm transition ${
                      statusFilter === status
                        ? "bg-primary text-white border-primary"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="space-y-3">
            {loadingTickets ? (
              <p className="text-center text-sm text-gray-500 py-10">
                Loading tickets...
              </p>
            ) : tickets.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-10">
                No tickets found.
              </p>
            ) : (
              tickets
                .filter((t) =>
                  statusFilter === "All" ? true : t.status === statusFilter
                )
                .map((t, index) => (
                  <div
                    key={index}
                    onClick={() => openTicketDetail(t.id)}
                    className="border rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Ticket ID: {t.id}
                      </p>
                      <p className="text-xs text-gray-600">
                        Submitted: {t.date}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 self-end rounded-full">
                        Status: {t.status}
                      </span>
                      <span className="text-gray-500 font-bold text-md self-end">
                        →
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Ticket Detail */}
      {view === "ticketDetail" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm font-medium text-primary">
              Ticket ID:{" "}
              <span className="font-semibold text-red-500">
                {ticketDetail?.ticketNumber || "—"}
              </span>
            </p>
            <p className="text-sm text-gray-800">
              Status:{" "}
              <span className="font-medium">
                {ticketDetail?.status || "Open"}
              </span>
            </p>
          </div>

          <div className="border rounded-xl p-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Subject/ Title</label>
              <input
                value={ticketDetail?.title || ""}
                readOnly
                className="w-full border border-gray-300 rounded-md px-4 py-2 mt-2 text-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                readOnly
                value={ticketDetail?.description || ""}
                className="w-full border border-gray-300 rounded-md px-4 py-2 mt-2 text-sm bg-gray-50 min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Uploaded Files</label>
              <div className="mt-2 space-y-2">
                {(ticketDetail?.image_url || ticketDetail?.images || [])
                  .length === 0 && (
                  <div className="text-sm text-gray-500">No attachments</div>
                )}
                {(
                  ticketDetail?.image_url
                    ? [ticketDetail.image_url]
                    : ticketDetail?.images || []
                ).map((f: any, i: number) => (
                  <div
                    key={i}
                    className="border rounded-md px-3 py-1 text-sm bg-gray-50 flex items-center justify-between"
                  >
                    {typeof f === "string" ? (
                      <>
                        <button
                          onClick={() => openImageModal(f)}
                          className="text-left text-primary underline text-sm hover:text-primary/90"
                          aria-label={`Open attachment ${i + 1}`}
                        >
                          View attachment
                        </button>

                        <a
                          href={f}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-3 text-xs text-gray-500 hover:underline"
                        >
                          (open)
                        </a>
                      </>
                    ) : (
                      <span>{JSON.stringify(f)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setView("tickets");
                  fetchTickets(
                    statusFilter === "All" ? undefined : statusFilter
                  );
                }}
                className="px-6 py-2 border border-primary text-primary rounded-lg"
              >
                &lt; Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image preview modal */}
      {imageModalOpen && imageModalSrc && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          onClick={closeImageModal}
        >
          <div
            className="relative max-w-[900px] w-full max-h-[90vh] bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeImageModal}
              className="absolute top-3 right-3 z-50 bg-white rounded-full p-2 shadow-md"
              aria-label="Close image"
            >
              ✕
            </button>

            <div className="w-full h-full flex items-center justify-center overflow-auto rounded">
              <img
                src={imageModalSrc}
                alt="Attachment preview"
                className="max-w-full max-h-[85vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* transient popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-xl p-4 shadow-lg text-center max-w-sm w-full pointer-events-auto">
            <p className="text-sm text-gray-800">{message}</p>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
