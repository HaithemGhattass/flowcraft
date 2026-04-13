export function StatusBar({ state }) {
  const sel = state.nodes.filter((n) => n.selected);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 16,
        background: "#050d1a",
        border: "1px solid #1e2d3d",
        borderRadius: 8,
        padding: "5px 14px",
        zIndex: 100,
        fontSize: 10,
        fontFamily: "'JetBrains Mono', monospace",
        color: "#374151",
        userSelect: "none",
      }}
    >
      <span>
        <span style={{ color: "#1d4ed8" }}>nodes</span> {state.nodes.length}
      </span>
      <span>
        <span style={{ color: "#0f766e" }}>edges</span> {state.edges.length}
      </span>
      {sel.length > 0 && (
        <span>
          <span style={{ color: "#60a5fa" }}>selected</span> {sel.length}
        </span>
      )}
      <span>
        <span style={{ color: "#374151" }}>zoom</span> {Math.round(state.viewport.zoom * 100)}%
      </span>
    </div>
  );
}
