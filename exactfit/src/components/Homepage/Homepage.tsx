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
    <div className="text-center bg-white ">
      <div className="p-6">
        <Navbar />
      </div>
      <div>
        <SearchBar />
      </div>
      <div className="p-4">
        <HeroBanner />
      </div>
      <div className="p-4">
        <Services />
      </div>
      <div className="">
        <Packages />
      </div>
      <div className="p-4">
        <WhyChooseUs />
      </div>
      <div className="p-4">
        <AboutUs />
      </div>
      <div className="">
        <Footer />
      </div>
    </div>
  );
}
