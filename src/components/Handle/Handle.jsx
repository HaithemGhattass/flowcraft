import { useState } from "react";

export function Handle({ nodeId, type, viewport, cx, cy, onStartConnect, onFinishConnect, saturated }) {
  const [hovered, setHovered] = useState(false);
  const r = hovered && !saturated ? 7 : 5;
  const sx = cx * viewport.zoom + viewport.x;
  const sy = cy * viewport.zoom + viewport.y;

  return (
    <div
      data-handle="true"
      onMouseDown={(e) => { if (saturated) { e.stopPropagation(); return; } onStartConnect(e, nodeId, type, sx, sy); }}
      onMouseUp={(e) => { e.stopPropagation(); if (!saturated) onFinishConnect(nodeId); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={saturated ? "Connection limit reached" : undefined}
      style={{
        position: "absolute",
        left:  type === "target" ? -r : "auto",
        right: type === "source" ? -r : "auto",
        top: "50%", transform: "translateY(-50%)",
        width: r * 2, height: r * 2, borderRadius: "50%",
        background: saturated ? "#0a0f1a" : hovered ? "#60a5fa" : "#1e3a5f",
        border: `2px solid ${saturated ? "#1e2d3d" : hovered ? "#93c5fd" : "#3b82f6"}`,
        cursor: saturated ? "not-allowed" : "crosshair",
        zIndex: 10, transition: "all 0.1s",
        boxShadow: hovered && !saturated ? "0 0 8px rgba(96,165,250,0.7)" : "none",
        opacity: saturated ? 0.3 : 1,
      }}
    />
  );
}