import OpenGraphImage from "@/components/metadata/OpenGraphImage";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "uk" }, { locale: "en" }];
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return OpenGraphImage(locale === "en" ? "en" : "uk");
}
