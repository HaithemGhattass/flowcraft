import { useRef, useCallback } from "react";
import { utils } from "../utils/utils";

export function useDrag(dispatch, viewport, nodes, edges) {
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

      const newX = dragging.current.startNX + dx;
      const newY = dragging.current.startNY + dy;

      dispatch({ type: "MOVE_NODE", id: dragging.current.nodeId, x: newX, y: newY });

      // find the current dragging node with updated position for proximity check
      const draggingNode = nodes.find((n) => n.id === dragging.current.nodeId);
      if (draggingNode) {
        const updated = { ...draggingNode, x: newX, y: newY };
        const target = utils.findProximityTarget(updated, nodes, edges);
        dispatch({
          type: "SET_PROXIMITY_TARGET",
          target: target ? { sourceId: target.sourceId, targetId: target.targetId } : null,
        });
      }

      return true;
    },
    [dispatch, viewport.zoom, nodes]
  );

  const endDrag = useCallback(() => {
    dragging.current = null;
  }, []);

  return { startDrag, moveDrag, endDrag, isDragging: () => !!dragging.current };
}
