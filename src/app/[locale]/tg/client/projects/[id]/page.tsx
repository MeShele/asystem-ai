"use client";
import dynamic from "next/dynamic";

const ClientProjectDetail = dynamic(
  () => import("@/app/[locale]/client/(dashboard)/projects/[id]/page"),
  { ssr: false }
);

export default function TgClientProjectDetail() {
  return <ClientProjectDetail />;
}
