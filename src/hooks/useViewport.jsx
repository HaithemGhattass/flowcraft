import { useRef, useCallback } from "react";
import { utils } from "../utils/utils";

export function useViewport(canvasRef, dispatch) {
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  const onWheel = useCallback(
    (e) => {
      e.preventDefault();
      const rect = canvasRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const delta = e.ctrlKey ? e.deltaY * 0.01 : e.deltaY * 0.001;
      dispatch((state) => {
        const newZoom = utils.clamp(state.viewport.zoom * (1 - delta), 0.1, 4);
        const scale = newZoom / state.viewport.zoom;
        return {
          type: "SET_VIEWPORT",
          viewport: {
            zoom: newZoom,
            x: mx - (mx - state.viewport.x) * scale,
            y: my - (my - state.viewport.y) * scale,
          },
        };
      });
    },
    [canvasRef, dispatch]
  );

  const startPan = useCallback((e, viewport) => {
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY, vx: viewport.x, vy: viewport.y };
  }, []);

  const movePan = useCallback(
    (e, viewport) => {
      if (!isPanning.current) return false;
      dispatch({
        type: "SET_VIEWPORT",
        viewport: {
          ...viewport,
          x: panStart.current.vx + (e.clientX - panStart.current.x),
          y: panStart.current.vy + (e.clientY - panStart.current.y),
        },
      });
      return true;
    },
    [dispatch]
  );

  const endPan = useCallback(() => {
    isPanning.current = false;
  }, []);

  return { onWheel, startPan, movePan, endPan, isPanning };
}
