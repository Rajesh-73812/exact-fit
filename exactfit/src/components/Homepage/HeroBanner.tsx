"use client";
import Image from "next/image";

import HeroImage1 from "../../../public/HeroBanner_1.png";
import HeroImage2 from "../../../public/HeroBanner_2.png";
import HeroImage3 from "../../../public/HeroBanner_3.png";
import TopArrow from "../../../public/Top-arrow.svg";
import BottomArrow from "../../../public/Bottom-arrow.svg";

export default function HeroBanner() {
  return (
    <section className="relative px-5 bg-white py-12 sm:py-16 lg:py-20 overflow-hidden shadow-[0_2px_0_rgba(0,0,0,0.1)]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-16">
          {/* ✅ Left: Text Section */}
          <div className="flex-1 text-left space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-gray-900 leading-tight">
              <span className="text-primary">Exact Fit</span>
              <br />
              For Every Home,
              <br />
              Every Time.
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-lg">
              &quot;Don&apos;t wait, get it done right. The perfect fit is just
              a call away.&quot;
            </p>

            <button className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium text-base sm:text-lg hover:bg-primary/90 transition-colors flex items-center gap-3 cursor-pointer">
              Contact Us
            </button>
          </div>

          {/* ✅ Right: Image Grid (1 on top, 2 below) */}
          <div className="relative flex-1 max-w-md mx-auto  sm:w-[80%] lg:mx-0 w-[50%]">
            {/* 🔴 Top Decorative Arrow (above main image) */}
            <Image
              src={TopArrow}
              alt="Top Border"
              width={120}
              height={120}
              className="absolute -top-4 -left-5 z-20 w-20 sm:w-28 lg:w-32 pointer-events-none select-none"
              priority
            />

            {/* Grid Container */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
              {/* Top Large Image - Span both columns */}
              <div className="relative col-span-2 h-48 sm:h-56 lg:h-50">
                <Image
                  src={HeroImage1}
                  alt="Technician installing AC unit"
                  fill
                  className="rounded-lg object-fill"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority
                />
              </div>

              {/* Bottom Left Image */}
              <div className="relative h-32 sm:h-40 lg:h-30">
                <Image
                  src={HeroImage2}
                  alt="Electrical work"
                  fill
                  className="rounded-lg object-fill"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                />
              </div>

              {/* Bottom Right Image */}
              <div className="relative h-32 sm:h-40 lg:h-30">
                <Image
                  src={HeroImage3}
                  alt="Plumbing repair"
                  fill
                  className="rounded-lg object-fill"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                />
              </div>
            </div>

            {/* 🔴 Bottom Decorative Arrow (below bottom-right image) */}
            <Image
              src={BottomArrow}
              alt="Bottom Border"
              width={120}
              height={120}
              className="absolute -bottom-6 -right-4 z-20 w-20 sm:w-28 lg:w-32 pointer-events-none select-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
