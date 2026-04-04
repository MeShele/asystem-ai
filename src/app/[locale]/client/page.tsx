import { redirect } from "next/navigation";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/client/request`);
}
