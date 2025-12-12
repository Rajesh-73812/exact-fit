"use client";

import Image from "next/image";
import Navbar from "../Navbar/Navbar";
import Footer from "@/src/components/Homepage/Footer";
import BG_Shape from "@/public/Bg_shape.svg";

// ✅ Import your images (replace with actual file paths)
import AboutBanner from "@/public/about_banner.svg";
import TeamImage from "@/public/about_img1.svg";
import ReliableIcon from "@/public/Right_mark.svg";
import ProfessionalIcon from "@/public/Right_mark.svg";
import ExperiencedIcon from "@/public/Right_mark.svg";
import SecureIcon from "@/public/Right_mark.svg";
import AboutImage1 from "@/public/About-image1.svg";
import AboutImage2 from "@/public/About_image2.svg";
import AboutImage3 from "@/public/About_image3.svg";
import AboutImage4 from "@/public/About_image4.svg"

export default function AboutUs() {
  const values = [
    {
      title: "Reliable",
      desc: "On time & accurate",
      icon: ReliableIcon,
    },
    {
      title: "Professional Technicians",
      desc: "Highly trained and certified technicians",
      icon: ProfessionalIcon,
    },
    {
      title: "Highly Experienced",
      desc: "Experience over years in this business",
      icon: ExperiencedIcon,
    },
    {
      title: "Safe and Secure",
      desc: "Lorem ipsum dolor sit amet,",
      icon: SecureIcon,
    },
  ];

  return (
    <div className="w-full bg-white">
      {/* ✅ Navbar */}
      <div className="p-4">
        <Navbar />
      </div>

      {/* ✅ Hero Section */}
      <section className="relative w-full h-[400px] md:h-[480px]">
        <Image
          src={AboutBanner}
          alt="About Us Banner"
          fill
          className="object-cover brightness-75"
        />
        {/* <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-4xl md:text-5xl font-semibold">
            About Us
          </h1>
        </div> */}
      </section>

      {/* ✅ Our Values Section */}
      <section className="py-16 w-full px-6 md:px-16 lg:px-24 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#E30613] mb-12">
          Our Values
        </h2>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
         
          
          <div className="relative flex-1 flex justify-center items-center">
            {/* Background SVG shape */}
            <Image
              src={BG_Shape}
              alt="Background Shape"
              width={700}
              height={700}
              className="absolute w-[600px] h-[1000px] object-contain z-0"
            />

            {/* Foreground team image */}
            <Image
              src={TeamImage}
              alt="Exact Fit Team"
              width={500}
              height={500}
              className="relative z-10 object-contain pb-30"
            />
          </div>

          

<div className="relative flex-1 flex flex-col items-start justify-center ">
  {values.map((value, index) => {
    const shadowStyles = [
      "0 6px 16px rgba(154, 167, 193, 0.25)",  
      "0 10px 24px rgba(154, 167, 193, 0.25)", 
      "0 12px 30px rgba(154, 167, 193, 0.25)",
      "0 10px 26px rgba(154, 167, 193, 0.25)",
    ];

    const zIndexes = [100, 40, 20, 10];

    return (
      <div className="pl-40">
        <div
        key={index}
        className={`relative max-w-max bg-[#FEFEFE] rounded-2xl flex items-center gap-4 p-3 py-4 transition-all duration-300   ${
          index === 0
            ? "-translate-y-5"
            : index === 1
            ? "-translate-y-2.5 ml-10"
            : index === 2
            ? "translate-y-0.5 -ml-3"
            : "translate-y-2.5 ml-20"
        }`}
        style={{
          boxShadow: shadowStyles[index],
          border: "1px solid rgba(240, 240, 240, 0.7)",
          backdropFilter: "blur(6px)",
          width: "380px",
          borderRadius: "16px",
          zIndex: zIndexes[index], // 🧱 each card has unique z-index
        }}
      >
        {/* Left Icon */}
        <div className="shrink-0 bg-[#FFE9E9] rounded-full p-6 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
          <Image src={value.icon} alt={value.title} width={28} height={28} />
        </div>

        {/* Text */}
        <div className="text-left">
          <h3 className="text-[18px] font-semibold text-[#2B2B2B]">{value.title}</h3>
          <p className="text-[12px] text-[#2B2B2B]">{value.desc}</p>
        </div>

        {/* Soft aura per card */}
        <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-[#ffffff] via-[#f8f9ff] to-[#eef1f9] opacity-50 blur-xl -z-10" />
      </div>
      </div>
    );
  })}
</div>



        </div>

        <p className="text-gray-700 mt-12 font-medium text-sm md:text-base">
          The backbone of Exact Fit is our team of dedicated professionals.
        </p>
      </section>

      {/* ✅ About Content */}
      {/* ✅ About Gallery + Quoted Text Section */}
<section className="bg-[#FFF4F4] py-16 px-6 md:px-16 lg:px-24">
  <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

    {/* ✅ Left Image Grid */}
  

    {/* ✅ Right Quoted Text */}
    <div className="relative w-full lg:w-1/2 text-left max-w-[650px] bg-[#FFF4F4]">
    <span className="absolute -top-7 -left-7 font-serif text-[60px] text-primary">
          “
        </span>
      <p className="relative text-gray-800  md:text-lg leading-relaxed font-medium">
        
        Exact Fit was founded on a simple belief: that maintaining a comfortable,
        functional home or facility shouldn’t be a source of stress. We saw a need
        for a reliable, all-in-one service provider that treats every job—from a
        minor plumbing fix to a major AC overhaul—with the utmost professionalism.
        Our growth is a testament to our commitment to that original vision,
        establishing us as the trusted name for home and facility services in the
        region.
        
      </p>
      <span className="absolute -bottom-13 -right-3 font-serif text-[60px] text-primary">
          ”
        </span>
    </div>
      <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4 max-w-[420px]">
      <Image
        src={AboutImage1}
        alt="Technician 1"
        className=" w-full h-auto object-cover"
      />
      <Image
        src={AboutImage2}
        alt="Technician 2"
        className=" w-full h-auto object-cover"
      />
      <Image
        src={AboutImage3}
        alt="Technician 3"
        className=" w-full h-auto object-cover"
      />
      <Image
        src={AboutImage4}
        alt="Technician 4"
        className="w-full h-auto object-cover"
      />
    </div>
  </div>
</section>


      {/* ✅ Footer */}
      <Footer />
    </div>
  );
}
