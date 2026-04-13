import { useRef, useCallback } from "react";

export function useDrag(dispatch, viewport) {
  const dragging = useRef(null);

  const startDrag = useCallback((e, nodeId, nx, ny) => {
    e.stopPropagation();
    dragging.current = {
      nodeId,
      startMX: e.clientX,
      startMY: e.clientY,
      startNX: nx,
      startNY: ny,
    };
  }, []);

  const moveDrag = useCallback(
    (e) => {
      if (!dragging.current) return false;
      const dx = (e.clientX - dragging.current.startMX) / viewport.zoom;
      const dy = (e.clientY - dragging.current.startMY) / viewport.zoom;
      dispatch({
        type: "MOVE_NODE",
        id: dragging.current.nodeId,
        x: dragging.current.startNX + dx,
        y: dragging.current.startNY + dy,
      });
      return true;
    },
    [dispatch, viewport.zoom]
  );

  const endDrag = useCallback(() => {
    dragging.current = null;
  }, []);

  return { startDrag, moveDrag, endDrag, isDragging: () => !!dragging.current };
}
