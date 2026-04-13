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
};
