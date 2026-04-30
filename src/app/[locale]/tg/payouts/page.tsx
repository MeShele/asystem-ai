"use client";
// TMA-версия — переиспользует web-страницу /partner/payouts. Там уже компактная адаптивная вёрстка.
import dynamic from "next/dynamic";

const PartnerPayouts = dynamic(
  () => import("@/app/[locale]/partner/(dashboard)/payouts/page"),
  { ssr: false }
);

export default function TgPayoutsPage() {
  return <PartnerPayouts />;
}
