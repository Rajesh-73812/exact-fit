"use client";

import PackageForm from "@/src/components/Packages/PackageForm";
import { Suspense } from "react";

export default function PackageFormPage() {
  return (
    <main>
      <Suspense fallback={<div>Loading form...</div>}>
      <PackageForm />
      </Suspense>
    </main>
  );
}
