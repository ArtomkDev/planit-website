import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 112,
          background: "#18181b",
          color: "white",
          fontSize: 220,
          fontWeight: 800,
          letterSpacing: -18,
        }}
      >
        P<span style={{ color: "#f45b8a" }}>.</span>
      </div>
    ),
    size,
  );
}
