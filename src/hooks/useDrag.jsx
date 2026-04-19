import { useRef, useCallback } from "react";
import { utils } from "../utils/utils";

export function useDrag(dispatch, viewport, nodes, edges) {
  const dragging = useRef(null);

  const startDrag = useCallback((e, nodeId, nx, ny) => {
    e.stopPropagation();

    const selectedNodes = nodes.filter((n) => n.selected);
    const isMulti = selectedNodes.length > 1 && selectedNodes.some((n) => n.id === nodeId);

    dragging.current = {
      nodeId,
      startMX: e.clientX,
      startMY: e.clientY,
      startNX: nx,
      startNY: ny,
      isMulti,
      // snapshot starting positions of all selected nodes for multi-drag
      multiStartPositions: isMulti
        ? Object.fromEntries(selectedNodes.map((n) => [n.id, { x: n.x, y: n.y }]))
        : null,
    };
  }, [nodes]);

  const moveDrag = useCallback((e) => {
    if (!dragging.current) return false;

    const dx = (e.clientX - dragging.current.startMX) / viewport.zoom;
    const dy = (e.clientY - dragging.current.startMY) / viewport.zoom;

    if (dragging.current.isMulti) {
      // move all selected nodes by dispatching absolute positions
      // derived from their snapshotted start positions
      dispatch({ type: "MOVE_SELECTED_NODES_ABSOLUTE", positions: dragging.current.multiStartPositions, dx, dy });
    } else {
      const newX = dragging.current.startNX + dx;
      const newY = dragging.current.startNY + dy;
      dispatch({ type: "MOVE_NODE", id: dragging.current.nodeId, x: newX, y: newY });

      // proximity check only for single node drag
      const draggingNode = nodes.find((n) => n.id === dragging.current.nodeId);
      if (draggingNode) {
        const updated = { ...draggingNode, x: newX, y: newY };
        const target = utils.findProximityTarget(updated, nodes, edges);
        dispatch({
          type: "SET_PROXIMITY_TARGET",
          target: target ? { sourceId: target.sourceId, targetId: target.targetId } : null,
        });
      }
    }

    return true;
  }, [dispatch, viewport.zoom, nodes, edges]);

  const endDrag = useCallback(() => {
    dragging.current = null;
  }, []);

  return { startDrag, moveDrag, endDrag, isDragging: () => !!dragging.current };
}
