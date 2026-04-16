import { useState, useRef, useEffect } from "react";
import { Handle } from "../Handle/Handle";
import { NodeResizer } from "./NodeResizer";
import { utils } from "../../utils/utils";
export const NODE_COLORS = {
  initial:   { bg: "#071a34", border: "#1d4ed8", accent: "#60a5fa", label: "#93c5fd" },
  transform: { bg: "#1e1030", border: "#7c3aed", accent: "#a78bfa", label: "#c4b5fd" },
  branch:    { bg: "#1f1505", border: "#b45309", accent: "#fbbf24", label: "#fde68a" },
  join:      { bg: "#052e1c", border: "#059669", accent: "#34d399", label: "#6ee7b7" },
  output:    { bg: "#0d2e1a", border: "#22c55e", accent: "#4ade80", label: "#86efac" },
};

const HANDLE_VISIBILITY = {
  initial:   { target: false, source: true  },
  transform: { target: true,  source: true  },
  branch:    { target: true,  source: true  },
  join:      { target: true,  source: true  },
  output:    { target: true,  source: false },
};

const NODE_TYPE_OPTIONS = [
  { type: "initial",   color: "#60a5fa" },
  { type: "transform", color: "#a78bfa" },
  { type: "branch",    color: "#fbbf24" },
  { type: "join",      color: "#34d399" },
  { type: "output",    color: "#4ade80" },
];
const NODE_TYPES = ["input", "default", "output"];

export function FlowNode({ node, viewport, onStartConnect, onFinishConnect, onDragStart, dispatch, nodes, edges }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(node.label);
  const inputRef = useRef(null);

  const colors = NODE_COLORS[node.type] ?? NODE_COLORS.transform;
  const visibility = HANDLE_VISIBILITY[node.type] ?? { target: true, source: true };
  const sourceSaturated = utils.isHandleSaturated(node.id, "source", nodes, edges);
  const targetSaturated = utils.isHandleSaturated(node.id, "target", nodes, edges);

  const sx = node.x * viewport.zoom + viewport.x;
  const sy = node.y * viewport.zoom + viewport.y;
  const sw = node.width * viewport.zoom;
  const sh = node.height * viewport.zoom;

  useEffect(() => { setLabel(node.label); }, [node.label]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const commitEdit = () => {
    setEditing(false);
    dispatch({ type: "RENAME_NODE", id: node.id, label });
  };

  return (
    <div
      data-nid={node.id}
      style={{
        position: "absolute", left: sx, top: sy, width: sw, height: sh,
        background: colors.bg,
        border: `1.5px solid ${node.selected ? colors.accent : colors.border}`,
        borderRadius: 8, cursor: "grab", userSelect: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: node.selected
          ? `0 0 0 2px ${colors.accent}44, 0 4px 20px rgba(0,0,0,0.5)`
          : "0 2px 8px rgba(0,0,0,0.4)",
        transition: "border-color 0.15s, box-shadow 0.15s",
        zIndex: node.selected ? 20 : 10,
      }}
      onMouseDown={(e) => {
        const isMultiKey = e.metaKey || e.ctrlKey;
        if (!node.selected || isMultiKey)
          dispatch({ type: "SELECT_NODE", id: node.id, multi: isMultiKey });
        onDragStart(e, node.id, node.x, node.y);
      }}
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
    >
      {/* type badge */}
      <div style={{
        position: "absolute", top: -9, left: 10, fontSize: 9,
        fontFamily: "'JetBrains Mono', monospace", color: colors.accent,
        background: colors.bg, padding: "0 6px", letterSpacing: "0.12em",
        textTransform: "uppercase", borderRadius: 3,
        border: `1px solid ${colors.border}`, lineHeight: "16px",
      }}>
        {node.type}
      </div>

      {editing ? (
        <input
          ref={inputRef} value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") { setLabel(node.label); setEditing(false); }
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            background: "transparent", border: "none", outline: "none",
            color: colors.label, fontFamily: "'JetBrains Mono', monospace",
            fontSize: Math.max(9, 13 * viewport.zoom), fontWeight: 500,
            textAlign: "center", width: "80%",
          }}
        />
      ) : (
        <span style={{
          color: colors.label, fontFamily: "'JetBrains Mono', monospace",
          fontSize: Math.max(9, 13 * viewport.zoom), fontWeight: 500,
          letterSpacing: "0.02em", pointerEvents: "none", maxWidth: "85%",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {node.label}
        </span>
      )}

      {/* type switcher */}
      {node.selected && (
        <div style={{
          position: "absolute", bottom: -28, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 3, background: "#050d1a", border: "1px solid #1e2d3d",
          borderRadius: 6, padding: "3px 5px", zIndex: 50,
        }}>
          {NODE_TYPE_OPTIONS.map(({ type: t, color }) => (
            <button
              key={t}
              onMouseDown={(e) => { e.stopPropagation(); dispatch({ type: "CHANGE_NODE_TYPE", id: node.id, nodeType: t }); }}
              style={{
                height: 18, padding: "0 7px",
                background: node.type === t ? color + "33" : "transparent",
                border: `1px solid ${node.type === t ? color : "#1e2d3d"}`,
                borderRadius: 4, color: node.type === t ? color : "#4b6a8a",
                fontSize: 9, fontFamily: "monospace", letterSpacing: "0.08em",
                cursor: "pointer", textTransform: "uppercase", transition: "all 0.1s",
              }}
              onMouseEnter={(e) => { if (node.type !== t) { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; } }}
              onMouseLeave={(e) => { if (node.type !== t) { e.currentTarget.style.borderColor = "#1e2d3d"; e.currentTarget.style.color = "#4b6a8a"; } }}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {visibility.target && (
        <Handle
          nodeId={node.id} type="target" viewport={viewport}
          cx={node.x} cy={node.y + node.height / 2}
          onStartConnect={onStartConnect} onFinishConnect={onFinishConnect}
          saturated={targetSaturated}
        />
      )}
      {visibility.source && (
        <Handle
          nodeId={node.id} type="source" viewport={viewport}
          cx={node.x + node.width} cy={node.y + node.height / 2}
          onStartConnect={onStartConnect} onFinishConnect={onFinishConnect}
          saturated={sourceSaturated}
        />
      )}

      {node.selected && <NodeResizer node={node} viewport={viewport} dispatch={dispatch} />}
    </div>
  );
}
