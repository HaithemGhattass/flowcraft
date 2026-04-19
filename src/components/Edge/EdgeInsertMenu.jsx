import { useEffect, useRef, useState } from "react";
import { getNodeMeta } from "../../config/nodeTypes";

const NODE_OPTIONS = ["transform", "join", "branch", "output"];

export function EdgeInsertMenu({ mid, edgeId, dispatch }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const insert = (nodeType) => {
    const meta = getNodeMeta(nodeType);
    setOpen(false);
    dispatch({
      type: "INSERT_NODE_ON_EDGE",
      edgeId,
      label: meta.label,
      nodeType,
    });
  };

  return (
    <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => !open && setHovered(false)}>
      <rect x={mid.x - 20} y={mid.y - 16} width={40} height={32} fill="transparent" />

      {(hovered || open) && (
        <g
          style={{ cursor: "pointer" }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setOpen((value) => !value);
          }}
        >
          <circle
            cx={mid.x}
            cy={mid.y}
            r={10}
            fill="#ffffff"
            stroke={open ? "#4f7cff" : "#d6dbe4"}
            strokeWidth={1.5}
          />
          <text
            x={mid.x}
            y={mid.y + 4}
            textAnchor="middle"
            fill={open ? "#4f7cff" : "#778294"}
            fontSize={13}
            fontFamily="sans-serif"
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            +
          </text>
        </g>
      )}

      {open && (
        <foreignObject x={mid.x - 116} y={mid.y + 16} width={232} height={NODE_OPTIONS.length * 58 + 24}>
          <div ref={menuRef} className="edge-insert-menu" onMouseDown={(e) => e.stopPropagation()}>
            <div className="edge-insert-menu__header">Insert node</div>
            {NODE_OPTIONS.map((nodeType) => {
              const meta = getNodeMeta(nodeType);
              return (
                <button
                  key={nodeType}
                  type="button"
                  className="edge-insert-menu__item"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    insert(nodeType);
                  }}
                >
                  <span
                    className="edge-insert-menu__icon"
                    style={{
                      color: meta.accent,
                      background: meta.tint,
                      borderColor: meta.border,
                    }}
                  >
                    {meta.glyph}
                  </span>
                  <span className="edge-insert-menu__content">
                    <span className="edge-insert-menu__label">{meta.label}</span>
                    <span className="edge-insert-menu__desc">{meta.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </foreignObject>
      )}
    </g>
  );
}
