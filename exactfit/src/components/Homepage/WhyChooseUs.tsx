"use client";
import React from 'react';
import Image from 'next/image';
import ChooseUS from "@/public/ChooseUS.png"
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
      title: 'Professional Technicians',
      description: 'Certified, and experienced professionals. They undergo training and background checks to ensure...'
    },
    {
      icon: Badge,
      title: '100% Secure',
      description: 'Your security is our top priority. We use data encryption to protect all your...'
    },
    {
      icon: Support,
      title: '24/7 Support',
      description: 'We offer 24/7 support so you\'re never left in the dark. Our dedicated support team is always...'
    },
    {
      icon: Truck,
      title: 'Punctual Service',
      description: 'Utilize efficient scheduling and dispatch systems to ensure our...'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-8 bg-white max-w-7xl mx-auto">
      
      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
        <p className="text-[16px] text-gray-600 max-w-2xl mx-auto">
          Many reasons why customers choose us than other eCommerce. We have some plus point that may other can&apos;t have.
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
