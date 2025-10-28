"use client";
import { useState, useEffect, useRef } from "react";
import PhoneInput from "react-phone-number-input/input";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import "react-phone-number-input/style.css";
// ✅ define CountryCode manually (type-safe fallback)
import type { CountryCode } from "libphonenumber-js";


import Image from "next/image";
import { Timer } from "lucide-react";
import Logo from "../../../public/Exact_Fit_login.png";

interface SignInProps {
  stage: string;
  setStage: (stage: string) => void;
  phone: string | undefined;
  setPhone: (phone: string | undefined) => void;
  otp: string;
  setOtp: (otp: string) => void;
}

export default function SignIn({
  stage,
  setStage,
  phone,
  setPhone,
  otp,
  setOtp,
}: SignInProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("AE");
  const otpRefs = useRef<HTMLInputElement[]>([]);

  const digitsOnly = phone?.replace(/\D/g, "") ?? "";
  const isValidPhone =
    phone && /^\+\d+$/.test(phone) && digitsOnly.length >= 10;
  const isValidOtp = otp === "123456";
  const isContinueDisabled = stage === "phone" && !isValidPhone;

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (!selectedCountry) return;

    const code = "+" + getCountryCallingCode(selectedCountry as CountryCode);

    if (phone && !phone.startsWith(code)) {
   const withoutOldCode = phone.replace(/^\+\d+/, "");
      const newPhone = code + withoutOldCode;
      if (newPhone !== phone) setPhone(newPhone); // ✅ prevents re-loop
  }
}, [selectedCountry, phone]);

  return (
    <div className="fixed inset-0 bg-[#303030CC] bg-opacity-75 flex items-center justify-center z-50">
      <div className="flex items-center justify-center w-full h-full px-4 sm:px-0">
        {/* Card */}
        <div className="relative bg-white mx-8 rounded-lg shadow-lg w-full max-w-md">
          {/* Close Button — inside card */}
          {stage === "phone" && (
            <button
              onClick={() => setStage("close")}
              className="absolute -top-8 right-2 bg-primary border border-red-500 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary shadow text-lg w-6 h-6"
            >
              ×
            </button>
          )}

          {/* Logo */}
          <div className="flex justify-center pt-6 mb-6">
            <Image
              src={Logo}
              alt="Exact Fit Logo"
              width={120}
              height={40}
              style={{ width: "auto", height: "auto" }}
            />
          </div>

          {stage === "phone" ? (
            <>
              <h3 className="text-primary text-[22px] px-4 font-semibold text-left">
                Enter your phone number
              </h3>
              <p className="text-[11px] px-4 mb-4 text-left">
                Please check your phone for the OTP.
              </p>

              {/* Country code + phone number input */}
              <div className="flex gap-2 px-4">
                <select
                  className="border border-gray-300 rounded-md text-[14px] p-2 bg-white text-gray-700 w-18"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value as CountryCode)}
                >
                  {getCountries().map((country) => (
                    <option key={country} value={country}>
                      +{getCountryCallingCode(country)} ({country})
                    </option>
                  ))}
                </select>

                <div className="relative flex-1">
                  <PhoneInput
                    country={selectedCountry as CountryCode}
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={setPhone}
                    className="w-full border border-gray-300 p-2 rounded-md text-[14px]"
                    maxLength={9}
                  />
                  {phone && (
                    <button
                      type="button"
                      onClick={() => setPhone(undefined)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                      aria-label="Clear phone number"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-gray-500 mt-3 px-4 text-left mb-3">
                By continuing, you agree to our{" "}
                <a href="#" className="text-blue-600">
                  T&C
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600">
                  Privacy Policy
                </a>
                .
              </p>

              <div className="mt-6 border-t border-gray-200 shadow-[2px_-2px_6px_0px_#00000029] px-2 pt-2">
                <button
                  disabled={isContinueDisabled}
                  onClick={() => {
                    setStage("otp");
                    setTimeLeft(30);
                  }}
                  className={`w-full py-3 rounded-lg mb-2 shadow-md transition-all duration-200 ${
                    isContinueDisabled
                      ? "bg-gray-300 text-gray-500"
                      : "bg-[#E31E24] text-white hover:bg-[#c81a20]"
                  }`}
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-primary text-[22px] px-4 font-semibold mb-2 text-left">
                Enter verification code
              </h3>
              <p className="text-gray-600 mb-4 text-[14px] px-4 text-left">
                A verification code has been sent to {phone}
              </p>

              {/* OTP Input */}
              <div className="flex justify-between mb-4 px-6">
                {Array(6)
                  .fill(null)
                  .map((_, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el!;
                      }}
                      type="text"
                      maxLength={1}
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const newOtp = otp.split("");
                        newOtp[i] = e.currentTarget.value;
                        setOtp(newOtp.join(""));
                        if (e.currentTarget.value.length === 1 && i < 5) {
                          otpRefs.current[i + 1]?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Backspace" &&
                          !e.currentTarget.value &&
                          i > 0
                        ) {
                          otpRefs.current[i - 1]?.focus();
                        }
                      }}
                      className={`w-10 h-10 text-center border-b-2 px-4 outline-none focus:border-b-2 focus:border-primary transition-colors ${
                        otp !== "123456" && otp.length === 6
                          ? "border-primary text-primary"
                          : "border-gray-300"
                      }`}
                    />
                  ))}
              </div>

              {timeLeft > 0 ? (
                <div className="flex items-center align-middle text-[11px] px-4 text-primary mb-3">
                  <Timer size={18} />
                  {timeLeft}s
                </div>
              ) : (
                <button
                  onClick={() => setTimeLeft(30)}
                  className="text-primary text-[11px] px-4"
                >
                  Resend OTP
                </button>
              )}

              {otp.length === 6 && otp !== "123456" && (
                <p className="text-black text-[11px] px-4 mb-2 text-left">
                  OTP entered is incorrect. Please try again.
                </p>
              )}

              <p className="text-[11px] text-black mb-3 px-4 text-left">
                By continuing, you agree to our{" "}
                <a href="#" className="">
                  T&C
                </a>{" "}
                and{" "}
                <a href="#" className="">
                  Privacy Policy
                </a>
                .
              </p>

              <div className="mt-6 border-t border-gray-200 shadow-[2px_-2px_6px_0px_#00000029] px-2 pt-2">
                <button
                  disabled={otp.length !== 6 || !isValidOtp}
                  onClick={() => {
                    // handle login here
                  }}
                  className={`w-full py-2 rounded-md mb-2 ${
                    otp.length !== 6 || !isValidOtp
                      ? "bg-gray-300 text-gray-500"
                      : "bg-primary text-white"
                  }`}
                >
                  Login
                </button>
              </div>
            </>
          )}
        </div>

        {/* Close Button — just above the card right corner */}
      </div>
    </div>
  );
}
