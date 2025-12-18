"use client";
import React from "react";
import Image from "next/image";
import About1 from "@/public/About-1.jpg";
import About2 from "@/public/About-2.jpg";
import About3 from "@/public/About-3.jpg";
import About4 from "@/public/About-4.jpg";

const AboutUs: React.FC = () => {
  return (
    <section className="py-16 px-8 bg-white max-w-7xl mx-auto">

      {/* Layout same as WhyChooseUs */}
      <div className="flex flex-col lg:flex-row gap-10 items-center justify-between">

        {/* Left Image Grid */}
        <div className="w-full lg:w-1/2 flex flex-col">

          <div className="grid grid-cols-2 gap-2 mb-2 max-w-[450px]">
            <Image
              src={About1}
              alt="About 1"
              width={150}
              height={150}
              className="w-full h-full object-cover rounded-tl-2xl"
            />
            <Image
              src={About2}
              alt="About 2"
              width={150}
              height={150}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 max-w-[450px]">
            <Image
              src={About3}
              alt="About 3"
              width={150}
              height={150}
              className="w-full h-full object-cover"
            />
            <Image
              src={About4}
              alt="About 4"
              width={150}
              height={150}
              className="w-full h-full object-cover"
            />
          </div>

        </div>

        {/* Right Text */}
        <div className="w-full lg:w-10/12 space-y-4">
          <h2 className="text-4xl text-left font-bold text-primary">
            About Us
          </h2>

          <p className="text-lg text-left text-gray-700 leading-relaxed">
            Exact Fix offers a total service solution, engineered for the demands of modern residential and
commercial facilities. Our service offerings span the entire spectrum rom quick emergency fixes
and scheduled care covered by your annual subscription, to the meticulous planning and execution
of major Enquiry-Based renovation projects. We commit to on-time performance and are
exclusively dedicated to providing the highest quality results
          </p>
        </div>

      </div>
    </section>
  );
};

export default AboutUs;
