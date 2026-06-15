import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

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
          background: "#3D2B1F",
          borderRadius: 6,
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 20,
            color: "#FFD700",
            lineHeight: 1,
          }}
        >
          M
        </span>
      </div>
    ),
    { ...size },
  );
}
