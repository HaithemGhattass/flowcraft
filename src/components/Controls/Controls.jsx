import { useFlowStore } from "../../store/flowStore";
import { utils } from "../../utils/utils";
import { StatusBar } from "./StatusBar";

function DockButton({ label, title, onMouseDown }) {
  return (
    <button
      className="control-dock__button"
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onMouseDown?.();
      }}
    >
      {label}
    </button>
  );
}

export function Controls({ dispatch, canvasRef }) {
  const { state } = useFlowStore();
  const { viewport } = state;

  const setZoom = (newZoom) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clampedZoom = utils.clamp(newZoom, utils.MIN_ZOOM, utils.MAX_ZOOM);

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const scale = clampedZoom / viewport.zoom;

    dispatch({
      type: "SET_VIEWPORT",
      viewport: {
        zoom: clampedZoom,
        x: cx - (cx - viewport.x) * scale,
        y: cy - (cy - viewport.y) * scale,
      },
    });
  };

  const zoom = (factor) => {
    setZoom(utils.clamp(viewport.zoom * factor, utils.MIN_ZOOM, utils.MAX_ZOOM));
  };

  return (
    <div className="control-dock">
      <div className="control-dock__zoom">
        <DockButton label="−" title="Zoom out" onMouseDown={() => zoom(1 / 1.15)} />
        <input
          className="control-dock__slider"
          type="range"
          min={utils.MIN_ZOOM * 100}
          max={utils.MAX_ZOOM * 100}
          step="1"
          value={viewport.zoom * 100}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => setZoom(Number(e.target.value) / 100)}
        />
        <DockButton label="+" title="Zoom in" onMouseDown={() => zoom(1.15)} />
        <div className="control-dock__percent">{Math.round(viewport.zoom * 100)}%</div>
        <DockButton
          label="Fit"
          title="Fit workflow"
          onMouseDown={() =>
            dispatch({
              type: "FIT_VIEW",
              w: canvasRef.current?.offsetWidth ?? 800,
              h: canvasRef.current?.offsetHeight ?? 600,
            })
          }
        />
      </div>
      <StatusBar state={state} />
    </div>
  );
}
