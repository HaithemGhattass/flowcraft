import { useState, useRef, useEffect } from "react";

const NODE_OPTIONS = [
  { type: "transform", label: "Transform", icon: "⟳", color: "#a78bfa", desc: "1 in · 1 out"      },
  { type: "join",      label: "Join",       icon: "⋈", color: "#34d399", desc: "many in · 1 out"   },
  { type: "branch",    label: "Branch",     icon: "⑂", color: "#fbbf24", desc: "1 in · many out"   },
//   { type: "initial",   label: "Initial",    icon: "◉", color: "#60a5fa", desc: "0 in · many out"   },
];

export function EdgeInsertMenu({ mid, edgeId, dispatch }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef(null);
  const BTN_R = 9;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!menuRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const insert = (opt) => {
    setOpen(false);
    dispatch({ type: "INSERT_NODE_ON_EDGE", edgeId, label: opt.label, nodeType: opt.type });
  };

  const showBtn = hovered || open;

  return (
    <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => { if (!open) setHovered(false); }}>
      {/* hover area */}
      <rect x={mid.x - 20} y={mid.y - 14} width={40} height={28} fill="transparent" />

      {showBtn && (
        <g style={{ cursor: "pointer" }} onMouseDown={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>
          <circle cx={mid.x} cy={mid.y} r={BTN_R}
            fill={open ? "#1d4ed8" : "#0f172a"}
            stroke={open ? "#60a5fa" : "#1e3a5f"}
            strokeWidth={1.5}
            style={{ transition: "fill 0.1s, stroke 0.1s" }}
          />
          <text x={mid.x} y={mid.y + 4} textAnchor="middle"
            fill={open ? "#93c5fd" : "#4b6a8a"} fontSize={13} fontFamily="monospace"
            style={{ pointerEvents: "none", userSelect: "none" }}>
            +
          </text>
        </g>
      )}

      {open && (
        <foreignObject
          x={mid.x - 104} y={mid.y + BTN_R + 6}
          width={208} height={NODE_OPTIONS.length * 52 + 32}
          style={{ overflow: "visible" }}
        >
          <div
            ref={menuRef}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              background: "#080f1e", border: "1px solid #1e3a5f",
              borderRadius: 10, overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <div style={{
              padding: "7px 12px 5px", fontSize: 9, color: "#1e3a5f",
              letterSpacing: "0.12em", textTransform: "uppercase",
              borderBottom: "1px solid #0d1e33",
            }}>
              insert node
            </div>
            {NODE_OPTIONS.map((opt) => (
              <div
                key={opt.type}
                onMouseDown={(e) => { e.stopPropagation(); insert(opt); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", cursor: "pointer",
                  borderBottom: "1px solid #0a1628", transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#0d1e33"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: `${opt.color}18`, border: `1px solid ${opt.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: opt.color, flexShrink: 0,
                }}>
                  {opt.icon}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#e2e8f0", fontWeight: 500 }}>{opt.label}</div>
                  <div style={{ fontSize: 9, color: "#4b6a8a", marginTop: 1 }}>{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </foreignObject>
      )}
    </g>
  );
}