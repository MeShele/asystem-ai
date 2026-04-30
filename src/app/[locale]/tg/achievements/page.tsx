"use client";
import dynamic from "next/dynamic";

const PartnerAchievements = dynamic(
  () => import("@/app/[locale]/partner/(dashboard)/achievements/page"),
  { ssr: false }
);

export default function TgAchievementsPage() {
  return <PartnerAchievements />;
}
