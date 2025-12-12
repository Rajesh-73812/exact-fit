"use client";

import { useState } from "react";
import SignIn from "../../../src/components/SIGNIN/signin";

export default function Home() {
  const [stage, setStage] = useState("phone");
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [otp, setOtp] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-800">
      <SignIn
        stage={stage}
        setStage={setStage}
        phone={phone}
        setPhone={setPhone}
        otp={otp}
        setOtp={setOtp}
      />
    </main>
  );
}
