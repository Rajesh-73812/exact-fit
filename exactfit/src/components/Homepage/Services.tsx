"use client";

import { useEffect, useState } from "react";
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
import apiClient from "@/lib/apiClient";


interface Service {
  title: string;
  description: string;
  image_url: string;
}
export function Services() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await apiClient.get("user/dashboard/V1/get-all-services-sub-services");
        const data = res.data?.data || [];
        console.log(data,"servicesssssssssss")

        setServices(data.slice(0, 6)); // show first 6
      } catch (error) {
        console.log("Error loading services:", error);
      }
    };

    fetchServices();
  }, []);

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
                  src={service.image_url}
                  alt={service.title}
                  width={60}
                  height={60}
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
            <Button size="lg" variant="default" className="bg-primary">
              Explore All
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
