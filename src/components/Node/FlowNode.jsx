import { useState, useRef, useEffect } from "react";
import { Handle } from "../Handle/Handle";
import { NodeResizer } from "./NodeResizer";

export const NODE_COLORS = {
  input: { bg: "#0f2744", border: "#3b82f6", accent: "#60a5fa", label: "#93c5fd" },
  default: { bg: "#111827", border: "#374151", accent: "#6b7280", label: "#e5e7eb" },
  output: { bg: "#0d2e1a", border: "#22c55e", accent: "#4ade80", label: "#86efac" },
};

const NODE_TYPES = ["input", "default", "output"];

export function FlowNode({ node, viewport, onStartConnect, onFinishConnect, dispatch, onDragStart }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(node.label);
  const inputRef = useRef(null);

  const colors = NODE_COLORS[node.type] ?? NODE_COLORS.default;
  const sx = node.x * viewport.zoom + viewport.x;
  const sy = node.y * viewport.zoom + viewport.y;
  const sw = node.width * viewport.zoom;
  const sh = node.height * viewport.zoom;

  useEffect(() => {
    setLabel(node.label);
  }, [node.label]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setEditing(true);
  };

  const commitEdit = () => {
    setEditing(false);
    dispatch({ type: "RENAME_NODE", id: node.id, label });
  };

  return (
    <div
      style={{
        position: "absolute",
        left: sx,
        top: sy,
        width: sw,
        height: sh,
        background: colors.bg,
        border: `1.5px solid ${node.selected ? colors.accent : colors.border}`,
        borderRadius: 8,
        cursor: "grab",
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: node.selected
          ? `0 0 0 2px ${colors.accent}44, 0 4px 20px rgba(0,0,0,0.5)`
          : "0 2px 8px rgba(0,0,0,0.4)",
        transition: "border-color 0.15s, box-shadow 0.15s",
        zIndex: node.selected ? 20 : 10,
      }}
      data-nid={node.id}
      onMouseDown={(e) => {
        dispatch({ type: "SELECT_NODE", id: node.id, multi: e.metaKey || e.ctrlKey });
        onDragStart(e, node.id, node.x, node.y); // ✅ use the prop
      }}

      onDoubleClick={handleDoubleClick}
    >
      <div
        style={{
          position: "absolute",
          top: -9,
          left: 10,
          fontSize: 9,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          color: colors.accent,
          background: colors.bg,
          padding: "0 6px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          borderRadius: 3,
          border: `1px solid ${colors.border}`,
          lineHeight: "16px",
        }}
      >
        {node.type}
      </div>

      {editing ? (
        <input
          ref={inputRef}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") {
              setLabel(node.label);
              setEditing(false);
            }
          }}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: colors.label,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: Math.max(9, 13 * viewport.zoom),
            fontWeight: 500,
            textAlign: "center",
            width: "80%",
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          style={{
            color: colors.label,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: Math.max(9, 13 * viewport.zoom),
            fontWeight: 500,
            letterSpacing: "0.02em",
            pointerEvents: "none",
            maxWidth: "85%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {node.label}
        </span>
      )}
      {node.selected && (
        <NodeResizer
          node={node}
          viewport={viewport}
          dispatch={dispatch}
        />
      )}


      {node.type !== "input" && (
        <Handle
          nodeId={node.id}
          type="target"
          viewport={viewport}
          cx={node.x}
          cy={node.y + node.height / 2}
          onStartConnect={onStartConnect}
          onFinishConnect={onFinishConnect}
        />
      )}
      {node.type !== "output" && (
        <Handle
          nodeId={node.id}
          type="source"
          viewport={viewport}
          cx={node.x + node.width}
          cy={node.y + node.height / 2}
          onStartConnect={onStartConnect}
          onFinishConnect={onFinishConnect}
        />
      )}
      {node.selected && (
        <div
          style={{
            position: "absolute",
            bottom: -28,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 3,
            background: "#050d1a",
            border: "1px solid #1e2d3d",
            borderRadius: 6,
            padding: "3px 5px",
            zIndex: 50,
          }}
        >
          {NODE_TYPES.map((t) => (
            <button
              key={t}
              onMouseDown={(e) => {
                e.stopPropagation();
                dispatch({ type: "CHANGE_NODE_TYPE", id: node.id, nodeType: t });
              }}
              style={{
                height: 18,
                padding: "0 7px",
                background: node.type === t ? NODE_COLORS[t].border : "transparent",
                border: `1px solid ${node.type === t ? NODE_COLORS[t].border : "#1e2d3d"}`,
                borderRadius: 4,
                color: node.type === t ? "#fff" : "#4b6a8a",
                fontSize: 9,
                fontFamily: "monospace",
                letterSpacing: "0.08em",
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => {
                if (node.type !== t) {
                  e.currentTarget.style.borderColor = NODE_COLORS[t].border;
                  e.currentTarget.style.color = NODE_COLORS[t].accent;
                }
              }}
              onMouseLeave={(e) => {
                if (node.type !== t) {
                  e.currentTarget.style.borderColor = "#1e2d3d";
                  e.currentTarget.style.color = "#4b6a8a";
                }
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
