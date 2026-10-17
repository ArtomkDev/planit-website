import OpenGraphImage from "@/components/metadata/OpenGraphImage";

export const dynamic = "force-static";

export function GET() {
  return OpenGraphImage();
}
