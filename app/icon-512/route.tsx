import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f46e5",
        }}
      >
        <div style={{ fontSize: 300, display: "flex" }}>🎯</div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
