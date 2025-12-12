"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "../Navbar/Navbar";
import SearchBar from "../Searchbar/searchbar";
import HeroBanner from "./HeroBanner";
import { Services } from "./Services";
import Packages  from "./Packages";
import WhyChooseUs from "./WhyChooseUs";
import AboutUs from "./AboutUs";
import Footer from "./Footer";

export default function Homepage() {
  return (
    <div className="text-center bg-white">
      <div className="p-4">
        <Navbar />
      </div>
      <div>
        <SearchBar />
      </div>
      <div className="px-8">
        <HeroBanner />
      </div>
      <div className="px-8">
        <Services />
      </div>
      <div className="">
        <Packages />
      </div>
      <div className="px-8">
        <WhyChooseUs />
      </div>
      <div className="p-8">
        <AboutUs />
      </div>
      <div className="">
        <Footer />
      </div>
    </div>
  );
}
