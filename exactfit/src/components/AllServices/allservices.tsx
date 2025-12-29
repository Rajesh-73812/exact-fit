"use client";

import Navbar from "../Navbar/Navbar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import Emergency_Icon from "@/public/white_emergency.svg";
import PlaceholderImage from "@/public/placeholder.jpg";

import apiClient from "@/lib/apiClient";

// ================== TYPES ==================

type Category = {
  id: string;
  title: string;
  icon: string;
  type: "Enquiry" | "Subscription";
  subServices: {
    id: string;
    title: string;
    image: string;
    slug: string;
  }[];
};

type ApiSubService = {
  id: string;
  title: string;
  sub_service_slug: string;
  image_url?: string | null;
};

type ApiService = {
  id: string;
  title: string;
  service_slug: string;
  image_url?: string | null;
  category?: string | null;
  type?: "Enquiry" | "Subscription" | string | null;
  sub_services?: ApiSubService[];
};

// ================== COMPONENT ==================

export default function AllServices() {
  const pathname = usePathname();
  const [hasPlan, setHasPlan] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const currentCategory =
    categories.find((c) => c.id === selectedCategory) || categories[0];

  // load plan flag and services from API
  useEffect(() => {
    const plan = localStorage.getItem("selectedPlan");
    setHasPlan(!!plan);

    const fetchServices = async () => {
      try {
        const res = await apiClient.get(
          "/user/dashboard/V1/get-all-services-sub-services"
        );
        console.log(res, "allservicessssssssssssss");

        const apiServices: ApiService[] = res.data?.data || [];

        const mappedCategories: Category[] = apiServices.map((service, sIdx) => {
          // make service_type check case-insensitive (API may return "enquiry" lowercase)
          const type: "Enquiry" | "Subscription" =
            String(service.type || "").toLowerCase() === "enquiry"
              ? "Enquiry"
              : "Subscription";

          const subServices = (service.sub_services || []).map((sub, index) => ({
            id: String(sub.id ?? `${service.id}-${index}`),
            title: sub.title || "Sub Service",
            slug: sub.sub_service_slug || String(sub.id ?? index),
            // Use API image OR placeholder
            image:
              sub.image_url && sub.image_url.trim() !== ""
                ? sub.image_url
                : PlaceholderImage.src,
          }));

          return {
            id: service.service_slug || String(service.id ?? sIdx),
            title: service.title || "Service",
            // Use API icon OR placeholder
            icon:
              service.image_url && service.image_url.trim() !== ""
                ? service.image_url
                : PlaceholderImage.src,
            type,
            subServices,
          };
        });

        setCategories(mappedCategories);
        if (mappedCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(mappedCategories[0].id);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handle hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash || categories.length === 0) return;

      const category = categories.find(
        (cat) =>
          cat.id === hash || cat.subServices.some((sub) => sub.slug === hash)
      );

      if (category) setSelectedCategory(category.id);

      const target = document.getElementById(hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname, categories]);

  return (
    <div className="text-center bg-white p-4" id="All-Services">
      <div className="p-2">
        <Navbar />
      </div>

      <div className="container mx-auto px-12 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* SIDEBAR */}
          <aside className="w-full md:w-1/3 border p-4 rounded-lg space-y-6">
            {hasPlan && (
              <Link href="/emergencyservice">
                <Button
                  variant="outline"
                  className="w-full mb-4 flex items-center cursor-pointer justify-center gap-2 text-primary border-primary rounded-full"
                >
                  <Image
                    src={Emergency_Icon}
                    alt="emergency"
                    width={18}
                    height={18}
                  />
                  Emergency Service
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}

            <div className="relative mb-6">
              <Search className="absolute text-primary left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
              <Input
                className="pl-10 rounded-full"
                placeholder="Search for a Service"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat) => (
                <Card
                  key={cat.id}
                  id={cat.id}
                  className={`cursor-pointer ${
                    selectedCategory === cat.id ? "border-primary text-primary" : ""
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <CardHeader className="flex flex-col items-center p-4">
                    <Image
                      src={cat.icon}
                      alt={cat.title}
                      width={30}
                      height={30}
                      className="h-12 w-12 mb-2 object-contain"
                      style={{ width: "24", height: "24" }}
                    />
                    <CardTitle className="text-sm text-center">
                      {cat.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 border p-4 rounded-lg">
            {currentCategory ? (
              <>
                <h2 className="text-2xl font-bold mb-6 text-primary">
                  {currentCategory.title}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentCategory.subServices.map((sub) => (
                    <Card
                      key={sub.id}
                      id={sub.slug}
                      className="overflow-hidden p-0 max-w-[300px] cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/servicedetails/${sub.slug}?type=${currentCategory.type}`)
                      }
                    >
                      <CardContent className="p-0">
                        <Image
                          src={sub.image}
                          alt={sub.title}
                          className="w-full h-35 object-cover rounded-t-lg"
                          width={400}
                          height={200}
                          style={{ width: "100%", height: "200px" }}
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-center">
                            {sub.title}
                          </h3>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
