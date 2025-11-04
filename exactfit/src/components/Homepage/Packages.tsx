"use client";
import React from 'react';
import { Star } from "lucide-react";
import Image from 'next/image';
import Filled_star from '@/public/Filled_star.svg';
import { useRouter } from 'next/navigation';

const Packages = () => {
  const router = useRouter();
  
  const plans = [
    { name: 'Basic', stars: 1, price: 'AED 500', suffix: '/YEAR' },
    { name: 'Standard', stars: 2, price: 'AED 500', suffix: '/YEAR' },
    { name: 'Executive', stars: 3, price: 'AED 500', suffix: '/YEAR' },
    { name: 'Custom', stars: 0, price: 'AED 500', suffix: '/YEAR' }
  ];
  
  const renderStars = (filled: number) => (
    <div className="relative w-16 h-12 mx-auto mb-2">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 w-6 h-6 flex items-center justify-center">
        {filled >= 1 ? <Image src={Filled_star} alt="star" className="w-6 h-6" /> : <Star className="w-6 h-6 stroke-primary" />}
      </div>
      <div className="absolute bottom-0 left-1/4 -translate-x-3 w-6 h-6 flex items-center justify-center">
        {filled >= 2 ? <Image src={Filled_star} alt="star" className="w-6 h-6" /> : <Star className="w-6 h-6 stroke-primary" />}
      </div>
      <div className="absolute bottom-0 right-1/4 translate-x-3 w-6 h-6 flex items-center justify-center">
        {filled >= 3 ? <Image src={Filled_star} alt="star" className="w-6 h-6" /> : <Star className="w-6 h-6 stroke-primary" />}
      </div>
    </div>
  );
  
  return (
    <div className="flex flex-col md:flex-col lg:flex-row items-center gap-10 lg:gap-50 justify-center p-6 md:p-8 bg-[#F8F8F8] w-full">
      {/* Left Section */}
      <div className="flex flex-col text-center lg:text-left">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Yearly Maintenance</h2>
        <h3 className="text-2xl font-semibold text-primary mb-6">Packages</h3>
        <button 
          onClick={() => router.push('/allpackages')}
          className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium"
        >
          Explore All
        </button>
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl p-4 text-center bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {renderStars(plan.stars)}
            <h4 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h4>
            <p className="text-sm text-gray-600 mb-3">
              Starting at {plan.price}{plan.suffix}
            </p>
            <button 
              onClick={() => {
                if (plan.name === 'Custom') {
                  router.push('/allpackages');
                } else {
                  router.push(`/allpackages?plan=${plan.name.toLowerCase()}`);
                }
              }}
              className="text-primary px-4 py-2 rounded-full text-xs font-medium border border-primary w-full"
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Packages;