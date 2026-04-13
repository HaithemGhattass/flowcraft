import React, { useState } from "react";
export function EdgeLabel({ edge, mid, onEditRequest }) {
    const [hovered, setHovered] = useState(false);
    const labelW = Math.max(60, (edge.label?.length ?? 0) * 9 + 24);
    const showLabel = edge.label || hovered;

    return (
        <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <rect
                x={mid.x - labelW / 2 - 6}
                y={mid.y - 12}
                width={labelW + 12}
                height={24}
                rx={4}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onDoubleClick={(e) => { e.stopPropagation(); onEditRequest?.(); }}  // ← call parent
            />
            {showLabel && (
                <g>
                    <rect
                        x={mid.x - labelW / 2}
                        y={mid.y - 10}
                        width={labelW}
                        height={18}
                        rx={4}
                        fill="#0f172a"
                        stroke={edge.label ? "#1e3a5f" : "transparent"}
                        strokeWidth={1}
                        style={{ cursor: "pointer" }}
                        onDoubleClick={(e) => { e.stopPropagation(); onEditRequest?.(); }}  // ← call parent
                    />
                    <text
                        x={mid.x}
                        y={mid.y + 4}
                        textAnchor="middle"
                        fill={edge.label ? "#60a5fa" : "#1e3a5f"}
                        fontSize={10}
                        fontFamily="'JetBrains Mono', monospace"
                        style={{ userSelect: "none", pointerEvents: "none" }}
                    >
                        {edge.label || "+ label"}
                    </text>
                </g>
            )}
        </g>
    );
}