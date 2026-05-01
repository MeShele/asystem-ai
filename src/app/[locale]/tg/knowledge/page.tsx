"use client";
import dynamic from "next/dynamic";

const PartnerKnowledge = dynamic(
  () => import("@/app/[locale]/partner/(dashboard)/knowledge/page"),
  { ssr: false }
);

export default function TgKnowledgePage() {
  return <PartnerKnowledge />;
}
