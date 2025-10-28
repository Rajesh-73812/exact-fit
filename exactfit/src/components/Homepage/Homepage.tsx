"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "../Navbar/Navbar";
import SearchBar from "../Searchbar/searchbar";
import HeroBanner from "./HeroBanner";

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
    </div>
  );
}
