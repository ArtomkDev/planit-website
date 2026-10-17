import OpenGraphImage from "@/components/metadata/OpenGraphImage";

export const dynamic = "force-static";

// Keep the public image URL stable across root layouts and route groups.
export function GET() {
  return OpenGraphImage();
}
