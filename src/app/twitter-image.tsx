import OpenGraphImage from "./opengraph-image";

export const alt = "PlanIt — a clear class schedule for Android and the web";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function TwitterImage() {
  return OpenGraphImage();
}
