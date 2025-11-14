"use client";

import dynamic from "next/dynamic";

const IncomeManager = dynamic(() => import("@/components/income/IncomeManager"), {
  ssr: false,
});

export default IncomeManager;


