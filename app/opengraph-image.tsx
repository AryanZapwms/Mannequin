import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FDF6EC 0%, #F5ECD7 60%, #FFE45A 100%)",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 96,
            color: "#3D2B1F",
          }}
        >
          Mannequin
          <span style={{ color: "#F5C400" }}>Care</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontFamily: "Georgia, serif",
            fontSize: 34,
            color: "#8B6914",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          India&apos;s Vitamin E Skincare Specialist
        </div>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            gap: 20,
          }}
        >
          {["Stretch Mark Repair", "Hair Strengthening", "Post-Pregnancy Care"].map((pill) => (
            <div
              key={pill}
              style={{
                display: "flex",
                padding: "12px 28px",
                borderRadius: 999,
                border: "2px solid #E8D5B0",
                background: "rgba(255,255,255,0.6)",
                fontFamily: "Georgia, serif",
                fontSize: 24,
                color: "#5C4033",
              }}
            >
              {pill}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
