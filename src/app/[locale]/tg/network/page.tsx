"use client";
import dynamic from "next/dynamic";

const PartnerNetwork = dynamic(
  () => import("@/app/[locale]/partner/(dashboard)/network/page"),
  { ssr: false }
);

export default function TgNetworkPage() {
  return <PartnerNetwork />;
}
