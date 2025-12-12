"use client";

import Navbar from "@/src/components/Navbar/Navbar";
import Image from "next/image";
import Years_Packages from "@/public/Years_Packages.svg";
import Footer from "@/src/components/Homepage/Footer";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";
import PackageForm from "./PackageForm";
import { Star } from "lucide-react";

export type PlanCard = {
  id: string | number;
  name: string;
  slug: string;
  price: string | number;
  stars: number;
  category: "Residential" | "Commercial";
  description?: string;
  included?: string[];
  image?: string;
  api_raw?: any;
};

export default function AllPackages() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [plans, setPlans] = useState<PlanCard[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] =
    useState<"Residential" | "Commercial">("Residential");

  const renderStars = (filled: number) => (
    <div className="relative w-16 h-12 mb-2">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 w-6 h-6 flex items-center justify-center">
        {filled >= 1 ? (
          <Image src="/Filled_star.svg" alt="star" width={24} height={24} className="w-6 h-6" />
        ) : (
          <Star className="w-6 h-6 stroke-primary" />
        )}
      </div>

      <div className="absolute bottom-0 left-1/4 -translate-x-3 w-6 h-6 flex items-center justify-center">
        {filled >= 2 ? (
          <Image src="/Filled_star.svg" alt="star" width={24} height={24} className="w-6 h-6" />
        ) : (
          <Star className="w-6 h-6 stroke-primary" />
        )}
      </div>

      <div className="absolute bottom-0 right-1/4 translate-x-3 w-6 h-6 flex items-center justify-center">
        {filled >= 3 ? (
          <Image src="/Filled_star.svg" alt="star" width={24} height={24} className="w-6 h-6" />
        ) : (
          <Star className="w-6 h-6 stroke-primary" />
        )}
      </div>
    </div>
  );

  const handleGetStarted = (slug: string) => {
    // persist selection to localStorage first so /package-form can resolve it reliably
    try {
      if (typeof window !== "undefined" && slug) {
        localStorage.setItem("selectedPlan", slug);
      }
    } catch (e) {
      // ignore storage errors
    }

    setSelectedPlan(slug);
    setShowForm(true);

    // navigate to dedicated package-form route with plan query param
    router.push(`/package-form?plan=${encodeURIComponent(slug)}`);
  };

  const getButtonClass = (slug: string) =>
    selectedPlan === slug
      ? "w-full bg-primary text-white py-2 rounded-lg hover:bg-primary transition mt-6"
      : "w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition mt-6";

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const res = await apiClient.get("/user/plan/V1/get-all-plan", {
          params: { page: 1, limit: 50 },
        });

        const apiList = res.data?.data?.rows || res.data?.data || [];

        const mapped: PlanCard[] = (Array.isArray(apiList) ? apiList : []).map((p: any, idx: number) => {
          const rawCat = String(p.category ?? p.plan_category ?? "").toLowerCase();
          const category = rawCat === "commercial" ? "Commercial" : "Residential";

          return {
            id: p.id ?? idx,
            name: p.name ?? p.plan_name ?? `Plan ${idx + 1}`,
            slug:
              p.slug ??
              (p.name ?? p.plan_name ?? `plan-${idx + 1}`).toLowerCase().replace(/\s+/g, "-"),
            price: p.base_price ?? p.price ?? "AED 0",
            stars: p.stars ?? 0,
            category,
            description: p.description,
            included: p.included ?? p.features ?? [],
            image: p.image_url ?? undefined,
            api_raw: p,
          };
        });

        setPlans(mapped);
      } catch (err) {
        console.error("Error fetching plans:", err);
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // support opening from url ?plan=slug - keep selectedPlan in-sync
  useEffect(() => {
    const slug = searchParams.get("plan");
    if (slug) {
      setSelectedPlan(slug);
      setShowForm(true);
      // ensure localStorage also updated (so other clients / direct route reads correctly)
      try {
        if (typeof window !== "undefined") localStorage.setItem("selectedPlan", slug);
      } catch (e) {}
      // replace to keep history clean
      router.replace(`/package-form?plan=${slug}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // We're not embedding the form here; the dedicated route `/package-form` will render it.
  const filteredPlans = plans.filter((p) => p.category === activeCategoryTab);

  return (
    <div className="bg-white">
      <div className="p-2"><Navbar /></div>

      <Image src={Years_Packages} alt="Years Packages" width={500} height={300} className="w-full h-auto" />

      <div className="mt-10 flex justify-center">
        <div className="flex border-b border-gray-200 gap-10">
          <button onClick={() => setActiveCategoryTab("Residential")} className={`pb-2 text-sm font-semibold ${activeCategoryTab === "Residential" ? "text-primary border-b-2 border-primary" : "text-gray-500"}`}>Residential</button>
          <button onClick={() => setActiveCategoryTab("Commercial")} className={`pb-2 text-sm font-semibold ${activeCategoryTab === "Commercial" ? "text-primary border-b-2 border-primary" : "text-gray-500"}`}>Commercial</button>
        </div>
      </div>

      <div className="text-center mt-6">
        <h2 className="text-primary font-semibold tracking-wide text-sm">Starting from</h2>
      </div>

      <div className="mt-6 px-4 md:px-10 lg:px-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {plansLoading && !plans.length && <div className="col-span-3 text-center text-sm text-gray-500">Loading packages...</div>}

        {!plansLoading && filteredPlans.map((plan) => {
          const price = typeof plan.price === "number" ? `AED ${plan.price}` : (plan.price as string);
          return (
            <div key={plan.id} onClick={() => handleGetStarted(plan.slug)} className="border rounded-xl p-6 shadow-sm hover:shadow-lg transition bg-white cursor-pointer flex flex-col">
              <div className="flex-1">
                <h3 className="text-left font-semibold">{plan.name}</h3>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold">{price}</span>
                  {renderStars(plan.stars)}
                </div>

                {plan.description && <div className="mt-3 text-sm text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: plan.description }} />}
              </div>

              <button onClick={(e) => { e.stopPropagation(); handleGetStarted(plan.slug); }} className={getButtonClass(plan.slug)}>Get Started</button>
            </div>
          );
        })}
      </div>

      <div className="h-16" />
      <Footer />
    </div>
  );
}
