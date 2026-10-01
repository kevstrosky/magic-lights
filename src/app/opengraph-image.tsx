import { ImageResponse } from "next/og";
import { SITE_NAME } from "./lib/site";

export const alt = `${SITE_NAME} – glowing card border generator for Tailwind CSS`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GRADIENT = "linear-gradient(to right, #6366f1, #a855f7, #ef4444)";

// Social preview: the title plus a card with the signature glow under it.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 96px",
        background: "#101010",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          maxWidth: 620,
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            backgroundImage: GRADIENT,
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Magic lights for your cards
        </div>
        <div style={{ fontSize: 30, color: "#9d9d9d", lineHeight: 1.35 }}>
          Design glowing borders and copy the Tailwind CSS or plain CSS code.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          position: "relative",
          width: 260,
          height: 400,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 8,
            right: 8,
            bottom: -6,
            height: 12,
            backgroundImage: GRADIENT,
            filter: "blur(14px)",
          }}
        />
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            borderRadius: 10,
            border: "2px solid #3a3a3a",
            background: "#1c1c1c",
            padding: 24,
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          Card example
        </div>
      </div>
    </div>,
    size,
  );
}
