export const utils = {
  id: (() => {
    let n = 1;
    return (prefix = "id") => `${prefix}_${n++}_${Math.random().toString(36).slice(2, 6)}`;
  })(),

  clamp: (v, min, max) => Math.max(min, Math.min(max, v)),

  NODE_RULES: {
    initial:   { maxInputs: 0, maxOutputs: Infinity },
    transform: { maxInputs: 1, maxOutputs: 1        },
    branch:    { maxInputs: 1, maxOutputs: Infinity  },
    join:      { maxInputs: Infinity, maxOutputs: 1  },
    output:    { maxInputs: Infinity, maxOutputs: 0  },
  },

  getRules(type) {
    return this.NODE_RULES[type] ?? { maxInputs: Infinity, maxOutputs: Infinity };
  },

  canConnect(sourceId, targetId, nodes, edges) {
    const source = nodes.find((n) => n.id === sourceId);
    const target = nodes.find((n) => n.id === targetId);
    if (!source || !target) return { allowed: false, reason: "Node not found" };
    if (sourceId === targetId) return { allowed: false, reason: "Cannot connect to self" };

    const sourceRule = this.getRules(source.type);
    const targetRule = this.getRules(target.type);

    const currentOutputs = edges.filter((e) => e.source === sourceId).length;
    if (currentOutputs >= sourceRule.maxOutputs)
      return { allowed: false, reason: `${source.type} only allows ${sourceRule.maxOutputs} output(s)` };

    const currentInputs = edges.filter((e) => e.target === targetId).length;
    if (currentInputs >= targetRule.maxInputs)
      return { allowed: false, reason: `${target.type} only allows ${targetRule.maxInputs} input(s)` };

    if (edges.some((e) => e.source === sourceId && e.target === targetId))
      return { allowed: false, reason: "Already connected" };

    return { allowed: true, reason: null };
  },

  isHandleSaturated(nodeId, handleType, nodes, edges) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return true;
    const rule = this.getRules(node.type);
    if (handleType === "source")
      return edges.filter((e) => e.source === nodeId).length >= rule.maxOutputs;
    return edges.filter((e) => e.target === nodeId).length >= rule.maxInputs;
  },

  bezierPath(x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1) * 0.6;
    return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
  },

  pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  },

  screenToCanvas(sx, sy, viewport) {
    return {
      x: (sx - viewport.x) / viewport.zoom,
      y: (sy - viewport.y) / viewport.zoom,
    };
  },

  canvasToScreen(cx, cy, viewport) {
    return {
      x: cx * viewport.zoom + viewport.x,
      y: cy * viewport.zoom + viewport.y,
    };
  },

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

      const nTgtX = n.x, nTgtY = n.y + n.height / 2;
      const nSrcX = n.x + n.width, nSrcY = n.y + n.height / 2;

      const distAsSource = Math.hypot(srcX - nTgtX, srcY - nTgtY);
      if (distAsSource < threshold && distAsSource < closestDist) {
        const { allowed } = this.canConnect(draggingNode.id, n.id, nodes, edges);
        if (allowed) {
          closestDist = distAsSource;
          closest = { id: n.id, sourceId: draggingNode.id, targetId: n.id };
        }
      }

      const distAsTarget = Math.hypot(tgtX - nSrcX, tgtY - nSrcY);
      if (distAsTarget < threshold && distAsTarget < closestDist) {
        const { allowed } = this.canConnect(n.id, draggingNode.id, nodes, edges);
        if (allowed) {
          closestDist = distAsTarget;
          closest = { id: n.id, sourceId: n.id, targetId: draggingNode.id };
        }
      }
    });

    return closest;
  },
};
