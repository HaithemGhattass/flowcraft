import { useFlowStore } from "../../store/flowStore";
import { utils } from "../../utils/utils";

export function Toolbar({ dispatch, canvasRef }) {
  const { state } = useFlowStore();
  const hasSelected = state.nodes.some((n) => n.selected) || state.selectedEdge;

  const addNode = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 400;
    const cy = rect ? rect.height / 2 : 300;
    const pos = utils.screenToCanvas(cx, cy, state.viewport);
    dispatch({ type: "ADD_NODE", x: pos.x - 85, y: pos.y - 30, label: "New Node" });
  };

  const btnBase = {
    height: 30,
    padding: "0 12px",
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 6,
    color: "#9ca3af",
    fontSize: 11,
    fontFamily: "'JetBrains Mono', monospace",
    cursor: "pointer",
    letterSpacing: "0.05em",
    userSelect: "none",
    transition: "all 0.12s",
    display: "flex",
    alignItems: "center",
    gap: 5,
  };

  const hoverIn = (e) => {
    e.currentTarget.style.background = "#1f2937";
    e.currentTarget.style.color = "#e5e7eb";
    e.currentTarget.style.borderColor = "#374151";
  };

  const hoverOut = (e) => {
    e.currentTarget.style.background = "#111827";
    e.currentTarget.style.color = "#9ca3af";
    e.currentTarget.style.borderColor = "#1f2937";
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 6,
        background: "#050d1a",
        border: "1px solid #1e2d3d",
        borderRadius: 10,
        padding: "6px 8px",
        zIndex: 100,
        backdropFilter: "blur(10px)",
      }}
    >
      <button
        style={btnBase}
        onMouseDown={(e) => {
          e.stopPropagation();
          addNode();
        }}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> node
      </button>
      <button
        style={btnBase}
        onMouseDown={(e) => {
          e.stopPropagation();
          dispatch({ type: "COPY_SELECTED" });
        }}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        title="Copy selected (Ctrl+C)"
        // dim if nothing selected
        disabled={!state.nodes.some((n) => n.selected)}
      >
        ⎘ copy
      </button>
      {state.clipboard && (
        <button
          style={btnBase}
          onMouseDown={(e) => {
            e.stopPropagation();
            dispatch({ type: "PASTE" });
          }}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
          title="Paste (Ctrl+V)"
        >
          ⎗ paste
        </button>
      )}

      {hasSelected && (
        <button
          style={{ ...btnBase, color: "#f87171", borderColor: "#2d1515" }}
          onMouseDown={(e) => {
            e.stopPropagation();
            dispatch({ type: "DELETE_SELECTED" });
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1f0505";
            e.currentTarget.style.borderColor = "#7f1d1d";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#111827";
            e.currentTarget.style.borderColor = "#2d1515";
          }}
        >
          ✕ delete
        </button>
      )}
    </div>
  );
}
