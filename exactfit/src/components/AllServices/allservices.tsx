"use client";

import Navbar from "../Navbar/Navbar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Search,
  Wind,
  Zap,
  Droplets,
  User,
  Building2,
} from "lucide-react";
import Image from "next/image";

// ✅ Imported local images
import Form_Cleaning from "@/public/form_cleaning.png";
import Gas_Filling from "@/public/gas_filling.png";
import AC_Repair from "@/public/ac_repair.png";
import AC_Coil_Servicing from "@/public/ac_coil_servicing.png";
import AC_Deep_Water_Cleaning from "@/public/ac_deep_water_cleaning.png";
import AC_Spare_Parts_Replacement from "@/public/ac_spare_part.png";
import Emergency_Icon from "@/public/white_emergency.svg";

type SubService = {
  id: string; // ✅ added id
  title: string;
  image: any;
};

type Category = {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  subServices: SubService[];
};

export default function AllServices() {
  const pathname = usePathname();
  
  const categories: Category[] = [
    {
      id: "ac",
      title: "Air Conditioning Services",
      icon: Wind,
      subServices: [
        { id: "foam-cleaning", title: "Foam Cleaning", image: Form_Cleaning },
        { id: "gas-filling", title: "Gas Filling", image: Gas_Filling },
        { id: "ac-repair", title: "AC Repair", image: AC_Repair },
        {
          id: "ac-coil-servicing",
          title: "AC Coil Servicing",
          image: AC_Coil_Servicing,
        },
        {
          id: "ac-deep-water-cleaning",
          title: "AC Deep Water Cleaning",
          image: AC_Deep_Water_Cleaning,
        },
        {
          id: "ac-spare-parts-replacement",
          title: "AC Spare Parts Replacement",
          image: AC_Spare_Parts_Replacement,
        },
      ],
    },
    {
      id: "electrical",
      title: "Electrical Services",
      icon: Zap,
      subServices: [
        { id: "wiring-repair", title: "Wiring Repair", image: Gas_Filling },
        {
          id: "light-installation",
          title: "Light Installation",
          image: AC_Repair,
        },
      ],
    },
    {
      id: "cleaning",
      title: "Cleaning",
      icon: User,
      subServices: [
        { id: "home-cleaning", title: "Home Cleaning", image: Form_Cleaning },
        {
          id: "office-cleaning",
          title: "Office Cleaning",
          image: AC_Coil_Servicing,
        },
      ],
    },
    {
      id: "plumbing",
      title: "Plumbing Services",
      icon: Droplets,
      subServices: [
        { id: "pipe-repair", title: "Pipe Repair", image: AC_Deep_Water_Cleaning },
        {
          id: "drain-cleaning",
          title: "Drain Cleaning",
          image: AC_Spare_Parts_Replacement,
        },
      ],
    },
    {
      id: "cleaning-services",
      title: "Cleaning Services",
      icon: User,
      subServices: [
        { id: "deep-cleaning", title: "Deep Cleaning", image: Form_Cleaning },
        {
          id: "carpet-cleaning",
          title: "Carpet Cleaning",
          image: AC_Repair,
        },
      ],
    },
    {
      id: "house-maintenance",
      title: "House Maintenance",
      icon: Building2,
      subServices: [
        { id: "painting", title: "Painting", image: AC_Coil_Servicing },
        {
          id: "roof-repair",
          title: "Roof Repair",
          image: AC_Spare_Parts_Replacement,
        },
      ],
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const currentCategory = categories.find((c) => c.id === selectedCategory);


// ✅ Auto-select category based on URL hash (#id)
useEffect(() => {
  const handleHashChange = () => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const category = categories.find(
      (cat) =>
        cat.id === hash ||
        cat.subServices.some((sub) => sub.id === hash)
    );

    if (category) setSelectedCategory(category.id);

    const target = document.getElementById(hash);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  };

  // Run on mount + whenever hash changes
  handleHashChange();
  window.addEventListener("hashchange", handleHashChange);

  return () => window.removeEventListener("hashchange", handleHashChange);
}, [pathname]);


  return (
    <div className="text-center bg-white p-4" id="All-Services">
      <div className="p-6">
        <Navbar />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-1/3 lg:w-1/3/4 border p-4 rounded-lg space-y-6">
            <Button
              variant="outline"
              className="w-full mb-4 flex items-center justify-center gap-2 text-primary border-primary rounded-full"
            >
              <Image
                src={Emergency_Icon}
                alt="Emergency"
                width={18}
                height={18}
              />
              Emergency Service
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="relative mb-6">
              <Search className="absolute text-primary left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 " />
              <Input
                className="pl-10 rounded-full"
                placeholder="Search for AC Service"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat) => (
                <Card
                  key={cat.id}
                  id={cat.id} // ✅ added id to category card
                  className={`cursor-pointer ${
                    selectedCategory === cat.id
                      ? "border-primary text-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <CardHeader className="flex flex-col items-center p-4">
                    <cat.icon className="h-6 w-6 mb-2" />
                    <CardTitle className="text-sm text-center">
                      {cat.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 border p-3 md:p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-primary">
              {currentCategory?.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentCategory?.subServices.map((sub) => (
                <Card key={sub.id} id={sub.id} className="overflow-hidden p-0 max-w-[300px]">
                  <CardContent className="p-0">
                    <Image
                      src={sub.image}
                      alt={sub.title}
                      className="w-full h-35 object-cover rounded-t-lg"
                      width={400}
                      height={250}
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-center">{sub.title}</h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
