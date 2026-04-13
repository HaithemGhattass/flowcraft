export const utils = {
  /** Generate a unique ID */
  id: (() => {
    let n = 1;
    return (prefix = "id") => `${prefix}_${n++}_${Math.random().toString(36).slice(2, 6)}`;
  })(),

  /** Clamp a value between min and max */
  clamp: (v, min, max) => Math.max(min, Math.min(max, v)),

  /** Get absolute position of a handle on screen */
  getHandlePos(node, handleType, handleId) {
    const hw = node.width ?? 160;
    const hh = node.height ?? 60;
    const isSource = handleType === "source";
    return {
      x: node.x + (isSource ? hw : 0),
      y: node.y + hh / 2,
    };
  },

  /** Cubic bezier path between two points */
  bezierPath(x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1) * 0.6;
    return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
  },

  /** Check if a point is inside a rect */
  pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  },

  /** Screen → canvas coords */
  screenToCanvas(sx, sy, viewport) {
    return {
      x: (sx - viewport.x) / viewport.zoom,
      y: (sy - viewport.y) / viewport.zoom,
    };
  },

  /** Canvas → screen coords */
  canvasToScreen(cx, cy, viewport) {
    return {
      x: cx * viewport.zoom + viewport.x,
      y: cy * viewport.zoom + viewport.y,
    };
  },
  /** Find the closest node to a dragging node within a snap distance */
  findProximityTarget(draggingNode, nodes, edges, threshold = 80) {
    let closest = null;
    let closestDist = Infinity;

    const srcX = draggingNode.x + draggingNode.width;
    const srcY = draggingNode.y + draggingNode.height / 2;
    const tgtX = draggingNode.x;
    const tgtY = draggingNode.y + draggingNode.height / 2;

    nodes.forEach((n) => {
      if (n.id === draggingNode.id) return;

      const alreadyConnected = edges.some(
        (e) =>
          (e.source === draggingNode.id && e.target === n.id) ||
          (e.source === n.id && e.target === draggingNode.id)
      );
      if (alreadyConnected) return;

      const nTgtX = n.x;
      const nTgtY = n.y + n.height / 2;
      const nSrcX = n.x + n.width;
      const nSrcY = n.y + n.height / 2;

      const distAsSource = Math.hypot(srcX - nTgtX, srcY - nTgtY);
      if (distAsSource < threshold && distAsSource < closestDist) {
        closestDist = distAsSource;
        closest = { id: n.id, sourceId: draggingNode.id, targetId: n.id };
      }

      const distAsTarget = Math.hypot(tgtX - nSrcX, tgtY - nSrcY);
      if (distAsTarget < threshold && distAsTarget < closestDist) {
        closestDist = distAsTarget;
        closest = { id: n.id, sourceId: n.id, targetId: draggingNode.id };
      }
    });

    return closest;
  },
};
