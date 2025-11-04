"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Line from "@/public/Line.svg";
import Image from "next/image";
import Building from "@/public/Building.svg";
import AC from "@/public/AC.svg";
import Electrical from "@/public/Current.svg";
import Cleaning from "@/public/Cleaning.svg";
import Gardening from "@/public/Garden.svg";
import Plumbing from "@/public/Plumbing.svg";

type Service = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

export function Services() {
  // ✅ Updated array using imported images instead of icons
  const services = [
    {
      icon: AC,
      title: "Air Conditioning",
      description:
        "Professional air conditioning services from installation to repairs.",
    },
    {
      icon: Electrical,
      title: "Electrical Service",
      description:
        "Electrical services keep your home running smoothly and safely.",
    },
    {
      icon: Plumbing,
      title: "Plumbing Service",
      description:
        "Certified plumbers for reliable installations and trusted repairs.",
    },
    {
      icon: Cleaning,
      title: "Cleaning",
      description:
        "Enjoy a pristine home with our professional, reliable cleaning.",
    },
    {
      icon: Gardening,
      title: "Gardening",
      description:
        "Professional gardening services that bring your dream landscape to life.",
    },
    {
      icon: Building,
      title: "Building Services",
      description:
        "Total home care, simplified. We handle everything from minor fixes to major overhauls.",
    },
  ];

  return (
    <section className="py-10 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center flex flex-col items-center justify-center mb-12">
          <h2 className="text-3xl font-bold text-primary tracking-tight">
            Services we provide
          </h2>
          <Image src={Line} alt="line" className="mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {services.map((service, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-col items-center">
                <Image
                  src={service.icon}
                  alt={service.title}
                  width={service.title === "Electrical Service" ? 40 : 60} // 👈 smaller size for Electrical
                  height={service.title === "Electrical Service" ? 40 : 60}
                  className="mb-4"
                />
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Link href="/allservices">
            <Button
              size="lg"
              variant="default"
              className="bg-primary cursor-pointer"
            >
              Explore All
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
