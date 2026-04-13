import { useFlowStore } from "../../store/flowStore";
import { utils } from "../../utils/utils";

export function Controls({ dispatch, canvasRef }) {
  const { state } = useFlowStore();
  const { viewport } = state;

  const zoom = (factor) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const newZoom = utils.clamp(viewport.zoom * factor, 0.1, 4);
    const scale = newZoom / viewport.zoom;
    dispatch({
      type: "SET_VIEWPORT",
      viewport: {
        zoom: newZoom,
        x: cx - (cx - viewport.x) * scale,
        y: cy - (cy - viewport.y) * scale,
      },
    });
  };

  const btnStyle = () => ({
    width: 32,
    height: 32,
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 6,
    color: "#9ca3af",
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.12s",
    fontFamily: "monospace",
    userSelect: "none",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 16,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        zIndex: 100,
      }}
    >
      {[
        { label: "+", action: () => zoom(1.2), title: "Zoom in" },
        { label: "−", action: () => zoom(1 / 1.2), title: "Zoom out" },
        {
          label: "⊡",
          action: () =>
            dispatch({
              type: "FIT_VIEW",
              w: canvasRef.current?.offsetWidth ?? 800,
              h: canvasRef.current?.offsetHeight ?? 600,
            }),
          title: "Fit view",
        },
        { label: "1", action: () => dispatch({ type: "SET_VIEWPORT", viewport: { ...viewport, zoom: 1 } }), title: "Reset zoom" },
      ].map(({ label, action, title }) => (
        <button
          key={label}
          title={title}
          onMouseDown={(e) => {
            e.stopPropagation();
            action();
          }}
          style={btnStyle()}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1f2937";
            e.currentTarget.style.color = "#e5e7eb";
            e.currentTarget.style.borderColor = "#374151";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#111827";
            e.currentTarget.style.color = "#9ca3af";
            e.currentTarget.style.borderColor = "#1f2937";
          }}
        >
          {label}
        </button>
      ))}
      <div
        style={{
          marginTop: 4,
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: 6,
          padding: "4px 6px",
          color: "#4b5563",
          fontSize: 10,
          fontFamily: "monospace",
          textAlign: "center",
        }}
      >
        {Math.round(viewport.zoom * 100)}%
      </div>
    </div>
  );
}
