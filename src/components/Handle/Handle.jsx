import { useState } from "react";

export function Handle({ nodeId, type, viewport, cx, cy, onStartConnect, onFinishConnect }) {
  const [hovered, setHovered] = useState(false);
  const r = hovered ? 7 : 5;
  const sx = cx * viewport.zoom + viewport.x;
  const sy = cy * viewport.zoom + viewport.y;

  return (
    <div
      onMouseDown={(e) => onStartConnect(e, nodeId, type, sx, sy)}
      onMouseUp={(e) => {
        e.stopPropagation();
        onFinishConnect(nodeId);
      }}
      data-handle="true" 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        left: type === "target" ? -r : "auto",
        right: type === "source" ? -r : "auto",
        top: "50%",
        transform: "translateY(-50%)",
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: hovered ? "#60a5fa" : "#1e3a5f",
        border: `2px solid ${hovered ? "#93c5fd" : "#3b82f6"}`,
        cursor: "crosshair",
        zIndex: 10,
        transition: "all 0.1s",
        boxShadow: hovered ? "0 0 8px rgba(96,165,250,0.7)" : "none",
      }}
    />
  );
}
