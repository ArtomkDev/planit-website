import { redirect } from "next/navigation";

export default async function WikiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/wiki/terms`);
}
