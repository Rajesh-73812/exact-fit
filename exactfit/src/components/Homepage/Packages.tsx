"use client";

import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import Filled_star from "@/public/Filled_star.svg";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

type PlanCard = {
  id: string | number;
  name: string;
  slug: string;
  price: string | number;
  stars: number;
};

const Packages = () => {
  const router = useRouter();

  const [plans, setPlans] = useState<PlanCard[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        // adjust URL if your route is different
        const res = await apiClient.get("/user/plan/V1/get-all-plan", {
          params: { page: 1, },
        });

        const data = res.data?.data;
        const apiPlans = Array.isArray(data?.rows) ? data.rows : Array.isArray(data) ? data : [];

        const mapped: PlanCard[] = apiPlans.map((p: any, idx: number) => ({
          id: p.id ?? idx,
          name: p.name || p.plan_name || `Plan ${idx + 1}`,
          slug: p.slug || (p.name || p.plan_name || `plan-${idx + 1}`).toLowerCase().replace(/\s+/g, "-"),
          price: p.price ?? "AED 0",
          stars: p.stars ?? p.starCount ?? Math.min(idx + 1, 3), // fallback stars
        }));

        setPlans(mapped);
      } catch (err) {
        console.error("Failed to load plans:", err);
        // fallback static plans if API fails (optional)
        setPlans([
          { id: 1, name: "Basic", slug: "basic", stars: 1, price: "AED 500" },
          { id: 2, name: "Standard", slug: "standard", stars: 2, price: "AED 500" },
          { id: 3, name: "Executive", slug: "executive", stars: 3, price: "AED 500" },
          { id: 4, name: "Custom", slug: "custom", stars: 0, price: "AED 500" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const renderStars = (filled: number) => (
    <div className="relative w-16 h-12 mx-auto mb-2">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 w-6 h-6 flex items-center justify-center">
        {filled >= 1 ? (
          <Image src={Filled_star} alt="star" className="w-6 h-6" />
        ) : (
          <Star className="w-6 h-6 stroke-primary" />
        )}
      </div>
      <div className="absolute bottom-0 left-1/4 -translate-x-3 w-6 h-6 flex items-center justify-center">
        {filled >= 2 ? (
          <Image src={Filled_star} alt="star" className="w-6 h-6" />
        ) : (
          <Star className="w-6 h-6 stroke-primary" />
        )}
      </div>
      <div className="absolute bottom-0 right-1/4 translate-x-3 w-6 h-6 flex items-center justify-center">
        {filled >= 3 ? (
          <Image src={Filled_star} alt="star" className="w-6 h-6" />
        ) : (
          <Star className="w-6 h-6 stroke-primary" />
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-col lg:flex-row items-center gap-10 lg:gap-50 justify-center p-6 md:p-8 bg-[#F8F8F8] w-full">
      {/* Left Section */}
      <div className="flex flex-col text-center lg:text-left">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Yearly Maintenance
        </h2>
        <h3 className="text-2xl font-semibold text-center text-primary mb-6">Packages</h3>
        <button
          onClick={() => router.push("/allpackages")}
          className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium"
        >
          Explore All
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {loading && plans.length === 0 && (
          <div className="text-sm text-gray-500 col-span-2 text-center">
            Loading packages...
          </div>
        )}

        {!loading &&
          plans.map((plan) => {
            const planPrice =
              typeof plan.price === "number"
                ? `AED ${plan.price}`
                : (plan.price as string);

            return (
              <div
                key={plan.id}
                className="border border-gray-200 rounded-xl p-4 text-center bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {renderStars(plan.stars)}
                <h4 className="text-lg font-bold text-gray-900 mb-1">
                  {plan.name}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Starting at {planPrice}
                  <span className="text-xs text-gray-500"> /YEAR</span>
                </p>
                <button
                  onClick={() => {
                    if (plan.slug === "custom") {
                      // custom plan route unchanged
                      router.push("/customplan");
                    } else {
                      // 🔹 pass slug as ?plan=<slug>
                      router.push(`/allpackages?plan=${plan.slug}`);
                    }
                  }}
                  className="text-primary px-4 py-2 rounded-full text-xs font-medium border border-primary w-full"
                >
                  Select Plan
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Packages;
