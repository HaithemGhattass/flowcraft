import { useState } from "react";

export function Handle({ nodeId, type, viewport, cx, cy, onStartConnect, onFinishConnect, saturated, accent = "#4f7cff" }) {
  const [hovered, setHovered] = useState(false);
  const uiScale = Math.max(0.7, Math.min(viewport.zoom, 1.8));
  const r = (hovered && !saturated ? 6 : 4) * uiScale;

  return (
    <div
      data-handle="true"
      onMouseDown={(e) => { if (saturated) { e.stopPropagation(); return; } onStartConnect(e, nodeId, type, cx, cy); }}
      onMouseUp={(e) => { e.stopPropagation(); if (!saturated) onFinishConnect(nodeId); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={saturated ? "Connection limit reached" : undefined}
      style={{
        position: "absolute",
        left: "50%",
        top: type === "target" ? -r : "auto",
        bottom: type === "source" ? -r : "auto",
        transform: "translateX(-50%)",
        width: r * 2, height: r * 2, borderRadius: "50%",
        background: saturated ? "#f4f5f7" : hovered ? accent : "#ffffff",
        border: `${1.5 * uiScale}px solid ${saturated ? "#d6d9de" : hovered ? accent : "#d7dce4"}`,
        cursor: saturated ? "not-allowed" : "crosshair",
        zIndex: 10, transition: "all 0.1s",
        boxShadow: hovered && !saturated ? `0 0 0 ${4 * uiScale}px rgba(79, 124, 255, 0.12)` : "0 4px 12px rgba(15, 23, 42, 0.08)",
        opacity: saturated ? 0.45 : 1,
      }}
    />
  );
}
