"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Navbar from "@/src/components/Navbar/Navbar";

// Hero banner images
import Banner1 from "@/public/Background_Banner.svg";
import Banner2 from "@/public/About_2.svg";
import Banner3 from "@/public/About_4.svg";
import Banner4 from "@/public/About_3.svg";

// Section images
import Section1 from "@/public/details_banner1.svg";
import Section2 from "@/public/details_banner2.svg";

// Gallery images
import Gallery1 from "@/public/Gallery_1.svg";
import Gallery2 from "@/public/Gallery_2.svg";
import Gallery3 from "@/public/Gallery_3.svg";
import Gallery4 from "@/public/Gallery_4.svg";
import Footer from "@/src/components/Homepage/Footer";

export default function ServiceDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") ?? "Subscription";

  const serviceId = (params?.id as string) || "";
  const serviceName = decodeURIComponent(serviceId.replace(/-/g, " "));

  return (
    <div className="bg-white text-gray-900">
      {/* Navbar */}
      <div className="p-4">
        <Navbar />
      </div>

      {/* HERO SECTION */}
      {/* HERO SECTION */}
<section className="relative w-full h-[400px] md:h-[500px]">
  <Image
    src={Banner1}
    alt="service-banner"
    className="object-cover w-full h-full"
    priority
  />

  {/* Overlay content */}
  <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/50 text-white text-center">
    <h1 className="text-4xl md:text-5xl font-bold mb-2">Services</h1>
    <p className="text-lg md:text-xl mb-4 capitalize">{serviceName}</p>
    <Button
      className="bg-red-600 text-white cursor-pointer rounded-full px-8 py-3"
      onClick={() =>
        router.push(type === "Enquiry" ? "/enquiry-form" : "/allpackages")
      }
    >
      {type === "Enquiry" ? "Enquire Now" : "View Packages"}
    </Button>
  </div>
</section>


      {/* MAIN CONTENT */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 space-y-24">
        {/* SECTION 1 - Image Left, Text Right */}
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Left image */}
          <div>
            <Image
              src={Section1}
              alt="equipment"
              className="rounded-lg shadow-lg object-cover w-full"
            />
          </div>

          {/* Right text block (both headings + paras) */}
          <div className="space-y-6">
            <div>
              <h2 className="text-[16px] font-semibold text-red-600 mb-2">
                Every Piece of Equipment is Important
              </h2>
              <p className="text-black text-[12px] mb-3">
                To keep your business running like clockwork, everything in a commercial kitchen
                needs to be in top working order. From the freezer and dishwasher to the combi oven
                and food processor, every piece of equipment is as important as the next.
              </p>
              <p className="text-black text-[12px]">
                At Hitches and Glitches, we understand this and take special care when it comes to
                all maintenance, repairs and kitchen supply and installation. From the toaster,
                waffle maker and other small table-top appliances to the larger appliances, such as
                the bain-marie grill, the blast chiller and the conveyor dishwasher.
              </p>
            </div>

            <div>
              <h2 className="text-[16px] font-semibold text-red-600 mb-2">
                Avoid Breakdowns with Annual Maintenance Contract for Kitchen Equipment
              </h2>
              <p className="text-black text-[12px] mb-3">
                Every time something in your kitchen malfunctions, delays happen. The meat cutter
                grinds to a halt or the glass washer starts leaking. Someone on your staff now has
                to perform the task by hand. These handy gadgets are invaluable and timesaving which
                enables you to serve customers quickly and efficiently.
              </p>
              <p className="text-black text-[12px]">
                Unfortunately, things do go wrong and, when they do, repair bills can be expensive.
                By signing up for an annual maintenance contract, you can save both time and money.
                Having trained technicians in commercial kitchen maintenance regularly check on the
                performance of your equipment means catching potential problems before they occur by
                making the necessary repairs.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2 - Image Right, Text Left */}
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Left text block (both paras) */}
          <div className="space-y-6">
            <div>
              <h2 className="text-[16px] font-semibold text-red-600 mb-2">
                Every Piece of Equipment is Important
              </h2>
              <p className="text-black text-[12px] mb-3">
                To keep your business running like clockwork, everything in a commercial kitchen
                needs to be in top working order. From the freezer and dishwasher to the combi oven
                and food processor, every piece of equipment is as important as the next.
              </p>
              <p className="text-black text-[12px]">
                At Hitches and Glitches, we understand this and take special care when it comes to
                all maintenance, repairs and kitchen supply and installation. From the toaster,
                waffle maker and other small table-top appliances to the larger appliances, such as
                the bain-marie grill, the blast chiller and the conveyor dishwasher.
              </p>
            </div>

            <div>
              <h2 className="text-[16px] font-semibold text-red-600 mb-2">
                Avoid Breakdowns with Annual Maintenance Contract for Kitchen Equipment
              </h2>
              <p className="text-black mb-3 text-[12px]">
                Every time something in your kitchen malfunctions, delays happen. The meat cutter
                grinds to a halt or the glass washer starts leaking. Someone on your staff now has
                to perform the task by hand. These handy gadgets are invaluable and timesaving which
                enables you to serve customers quickly and efficiently.
              </p>
              <p className="text-black text-[12px]">
                Unfortunately, things do go wrong and, when they do, repair bills can be expensive.
                By signing up for an annual maintenance contract, you can save both time and money.
                Having trained technicians in commercial kitchen maintenance regularly check on the
                performance of your equipment means catching potential problems before they occur by
                making the necessary repairs.
              </p>

                <div className="flex justify-left mt-12">
          <Button className="bg-red-600 text-white rounded-full cursor-pointer px-8 py-3"
            onClick={() => router.push(type === "Enquiry" ? "/enquiry-form" : "/allpackages")}>
            {type === "Enquiry" ? "Enquire Now" : "View Packages"}
          </Button>
        </div>
            </div>
          </div>

          {/* Right image */}
          <div>
            <Image
              src={Section2}
              alt="maintenance"
              className="rounded-lg shadow-lg object-cover w-full"
            />
          </div>
        </div>

        {/* Enquire Button below both sections */}
      
      </section>

      {/* GALLERY SECTION */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[Gallery1, Gallery2, Gallery3, Gallery4].map((img, i) => (
            <Image
              key={i}
              src={img}
              alt={`gallery-${i}`}
              className="rounded-lg object-cover w-full h-full"
            />
          ))}
        </div>
      </section>

      <div>
        <Footer />
      </div>
    </div>
  );
}
