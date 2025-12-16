import AllPackages from "@/src/components/Packages/AllPackages";
import React, { Suspense } from "react";

export default function Page() {
  return (
    <main>
      <Suspense fallback={<div>Loading packages...</div>}>
      <AllPackages /></Suspense>
      
    </main>
  );
}
