"use client";
import React from 'react';
import Image from 'next/image';
import ChooseUS from "@/public/WhychooseUs-1.jpg"
import Tools from "@/public/tools.svg"
import Support from "@/public/Support.svg"
import Truck from "@/public/Truck_Icon.svg"
import Badge from "@/public/Badge.svg"

interface Feature {
  icon: any;
  title: string;
  description: string;
}

const WhyChooseUs: React.FC = () => {
  const features: Feature[] = [
    {
      icon: Tools,
      title: 'All-in-One Convenience',
      description: 'Stop calling multiple contractors. We cover all your needs from minor appliance repairs to major civil works—all managed under one reliable system.'
    },
    {
      icon: Badge,
      title: 'Seamless 24/7 Access',
      description: 'As a registered member, you gain 24/7 access to initiate service requests. Our auto-dispatch system ensures the fastest possible response for emergencies.'
    },
    {
      icon: Support,
      title: 'Comprehensive Coverage',
      description: 'We provide total peace of mind, covering all service types from appliance repairs to large-scale interior fit-outs—under one accountable brand.'
    },
    {
      icon: Truck,
      title: 'Audited Accountability',
      description: 'Our process is fully transparent. Digital consent is mandatory before any emergency repair payment is processed, securing your authorization and protecting your interests.'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-8 bg-white max-w-7xl mx-auto">
      
      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
        <p className="text-[16px] text-gray-600 max-w-2xl mx-auto">
          Our service is built on unwavering transparency and an emphatic commitment to customer
satisfaction, guaranteeing every action is fully authorized and fully accountable.
        </p>
      </div>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-10 items-center justify-between">
        
        {/* Image Side */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <Image
            src={ChooseUS}
            alt="Professional technicians working on AC unit"
            className="w-full max-w-[450px] h-auto object-contain"
            priority
          />
        </div>

        {/* Feature Cards */}
        <div className="w-full lg:w-10/12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-black rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow w-full"
            >
              <div className="mb-4">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  className="w-10px h-10 md:w-[50px] md:h-[50px]"
                />
              </div>

              <h3 className="text-[16px] text-left font-semibold text-gray-900 mb-2">{feature.title}</h3>

              <p className="text-gray-600 text-left text-[11px] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;
