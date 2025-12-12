"use client";

import { useState } from "react";
import UserLayout from "@/src/components/Dashboard/UserLayout";
import Image from "next/image";
import StarIcon from "@/public/Subscription_star.svg";
import CheckIcon from "@/public/checked_circle.svg";
import CancelIcon from "@/public/Red_Cancel_icon.svg";
import Link from "next/link";

export default function Subscriptions() {
  const [activePlan, setActivePlan] = useState("Basic Plan");
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelPolicy, setShowCancelPolicy] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const plans = [
    {
      name: "Basic Plan",
      price: "1670 AED",
      start: "12-11-2025",
      end: "12-11-2026",
      included: [
        "Emergency and routine callouts 24/7/365 Helpline",
        "Unlimited emergency callouts for AC, electrical and plumbing failure",
        "First six routine callouts for AC, electrical and plumbing issues are free",
        "60 Minutes emergency response time",
        "6 Hours non-emergency response time",
      ],
    },
    {
      name: "Standard Plan",
      price: "2500 AED",
      included: [
        "Emergency and routine callouts 24/7/365 Helpline",
        "Unlimited emergency callouts for AC, electrical and plumbing failure",
        "First six routine callouts for AC, electrical and plumbing issues are free",
        "60 Minutes emergency response time",
        "6 Hours non-emergency response time",
      ],
    },
    {
      name: "Executive Plan",
      price: "5000 AED",
      included: [
        "Emergency and routine callouts 24/7/365 Helpline",
        "Unlimited emergency callouts for AC, electrical and plumbing failure",
        "First six routine callouts for AC, electrical and plumbing issues are free",
        "60 Minutes emergency response time",
        "6 Hours non-emergency response time",
      ],
    },
  ];

  const handleUpgrade = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  };

  const handleCancelPlan = () => {
    setShowCancelPolicy(true);
  };

  const confirmCancel = () => {
    setShowCancelPolicy(false);
    setShowCancelConfirm(true);
  };

  const completeCancel = () => {
    setShowCancelConfirm(false);
    setActivePlan("");
  };

  return (
    <UserLayout>
      {/* ✅ Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-10 shadow-lg text-center">
            <Image src={CheckIcon} alt="check" className="w-10 h-10 mx-auto mb-4" />
            <p className="text-lg font-medium">Plan upgraded Successfully</p>
          </div>
        </div>
      )}

      {/* ✅ Cancellation Policy Modal */}
      {showCancelPolicy && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg text-center w-[480px]">
            <p className="text-lg font-semibold text-primary mb-4">Cancellation Policy</p>
            <ul className="text-sm text-gray-700 text-left mb-6 list-disc pl-5">
              <li>
                Subscription cancellation– No cancellation available after technician visits for one of the service in plan
              </li>
              <li>Cannot cancel subscription after 14 days of activation</li>
            </ul>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowCancelPolicy(false)}
                className="px-6 py-2 border border-primary text-primary rounded-lg"
              >
                Back
              </button>
              <button
                onClick={confirmCancel}
                className="px-6 py-2 bg-primary text-white rounded-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Final Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-10 shadow-lg text-center w-[360px]">
            <Image src={CancelIcon} alt="cancel" className="w-10 h-10 mx-auto mb-4" />
            <p className="text-base text-gray-800 mb-6">
              Are you sure, you want to cancel
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-6 py-2 border border-primary text-primary rounded-lg"
              >
                Back
              </button>
              <button
                onClick={completeCancel}
                className="px-6 py-2 bg-primary text-white rounded-lg"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-primary mb-4">Subscriptions</h2>

      {/* ✅ If no active plan */}
      <div className="">
        {!activePlan ? (
          <div className="border rounded-xl p-10 text-center">
            <Image src={StarIcon} alt="star" className="w-15 h-15 mx-auto mb-4" />
            <p className="text-sm font-bold mb-6">
              There is No Active plan, Please Subscribe any plan.
            </p>
           
          </div>
        ) : (
          <div className="space-y-4 border rounded-2xl p-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`border rounded-xl p-5 ${
                  activePlan === plan.name ? "border-primary/20 " : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {plan.name} <span className="text-xs">/ Year</span>
                    </p>
                    {activePlan === plan.name && (
                      <p className="text-xs mt-1 text-gray-500">
                        Plan Start Date:{plan.start}, Plan End Date:{plan.end}
                      </p>
                    )}
                  </div>

                  {/* ✅ Added 'Starts From' before price for non-active plans */}
                  <div className="text-right">
                    {activePlan !== plan.name && (
                      <p className="text-xs text-gray-500 mb-1">Starts From</p>
                    )}
                    <p className="font-semibold text-gray-900">{plan.price}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  {activePlan === plan.name ? (
                    <span className="px-4 py-1.5 rounded-full text-xs bg-white shadow border border-gray-200 text-primary font-medium">
                      Active Plan
                    </span>
                  ) : (
                    <button
                      onClick={handleUpgrade}
                      className="px-4 py-1.5 bg-primary text-white rounded-md text-sm"
                    >
                      Upgrade Plan
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setExpandedPlan(
                        expandedPlan === plan.name ? null : plan.name
                      )
                    }
                    className="text-primary text-sm font-medium"
                  >
                    View Plan Details{" "}
                    {expandedPlan === plan.name ? "▲" : "▼"}
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedPlan === plan.name && (
                  <div className="mt-4  pt-4">
                    <p className="font-semibold mb-2 text-sm text-gray-800">
                      What’s included:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {plan.included.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>

                    {activePlan === plan.name && (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={handleCancelPlan}
                          className="px-5 py-1.5 border border-primary text-primary rounded-lg text-sm"
                        >
                          Cancel Plan
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
