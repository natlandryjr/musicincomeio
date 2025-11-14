"use client";

import dynamic from "next/dynamic";

const RoyaltyChecklist = dynamic(
  () => import("@/components/checklist/RoyaltyChecklist"),
  { ssr: false }
);

export default RoyaltyChecklist;


