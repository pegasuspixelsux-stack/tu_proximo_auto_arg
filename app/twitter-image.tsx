import { ImageResponse } from "next/og";

export const alt = "Tu Próximo Auto - Autos usados en Tigre y Buenos Aires";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #000 0%, #1d1d1f 100%)",
          color: "#f5f5f7",
        }}
      >
        <div style={{ display: "flex", fontSize: 96, fontWeight: 800, textTransform: "uppercase" }}>
          Tu Próximo
          <span style={{ marginLeft: 24, padding: "0 24px", background: "#ffea00", color: "#000" }}>
            Auto
          </span>
        </div>
        <div style={{ marginTop: 40, fontSize: 48, color: "#a1a1a6" }}>
          Autos usados en venta en Tigre, Zona Norte y Buenos Aires
        </div>
      </div>
    ),
    size,
  );
}
