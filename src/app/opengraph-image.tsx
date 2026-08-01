import { ImageResponse } from "next/og";

export const alt = "PlanIt — a clear class schedule for Android and the web";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#fbfbfc",
          color: "#18181b",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(24,24,27,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(24,24,27,.045) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 430,
            height: 430,
            borderRadius: 999,
            left: -150,
            top: -150,
            background: "rgba(244,91,138,.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 470,
            height: 470,
            borderRadius: 999,
            right: -170,
            bottom: -210,
            background: "rgba(62,247,210,.22)",
          }}
        />
        <div
          style={{
            width: "100%",
            padding: "72px 82px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 800 }}>
            PlanIt<span style={{ color: "#f45b8a" }}>.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
            <div style={{ display: "flex", fontSize: 72, lineHeight: 1.02, letterSpacing: -3.5, fontWeight: 800 }}>
              Every class. One clear schedule.
            </div>
            <div style={{ display: "flex", marginTop: 24, fontSize: 29, color: "#52525b" }}>
              Android · Web · Offline access · Synchronization
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, fontWeight: 700, color: "#087563" }}>
            <span style={{ width: 42, height: 4, borderRadius: 99, background: "#f45b8a" }} />
            Plan your week without the clutter
          </div>
        </div>
      </div>
    ),
    size,
  );
}
