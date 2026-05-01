"use client";
import dynamic from "next/dynamic";

const PartnerLeads = dynamic(
  () => import("@/app/[locale]/partner/(dashboard)/leads/page"),
  { ssr: false }
);

export default function TgLeadsPage() {
  return <PartnerLeads />;
}
