import { getNodeMeta } from "../config/nodeTypes";

export const utils = {
  MIN_ZOOM: 0.35,
  MAX_ZOOM: 1.8,

  id: (() => {
    let n = 1;
    return (prefix = "id") => `${prefix}_${n++}_${Math.random().toString(36).slice(2, 6)}`;
  })(),

  clamp: (v, min, max) => Math.max(min, Math.min(max, v)),

  getRules(type) {
    const meta = getNodeMeta(type);
    return {
      maxInputs: meta.maxInputs ?? Infinity,
      maxOutputs: meta.maxOutputs ?? Infinity,
    };
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

  getNodeAnchor(node, handleType = "source") {
    if (!node) return { x: 0, y: 0 };
    return {
      x: node.x + node.width / 2,
      y: handleType === "source" ? node.y + node.height : node.y,
    };
  },

  getEdgeEndpoints(sourceNode, targetNode) {
    return {
      source: this.getNodeAnchor(sourceNode, "source"),
      target: this.getNodeAnchor(targetNode, "target"),
    };
  },

  getEdgeMidpoint(sourceNode, targetNode) {
    const { source, target } = this.getEdgeEndpoints(sourceNode, targetNode);
    return {
      x: (source.x + target.x) / 2,
      y: (source.y + target.y) / 2,
    };
  },

  bezierPath(x1, y1, x2, y2) {
    const direction = y2 >= y1 ? 1 : -1;
    const dy = Math.abs(y2 - y1);
    const bend = Math.max(36, dy * 0.55);
    return `M${x1},${y1} C${x1},${y1 + bend * direction} ${x2},${y2 - bend * direction} ${x2},${y2}`;
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

    const sourceAnchor = this.getNodeAnchor(draggingNode, "source");
    const targetAnchor = this.getNodeAnchor(draggingNode, "target");

    nodes.forEach((n) => {
      if (n.id === draggingNode.id) return;

      const alreadyConnected = edges.some(
        (e) =>
          (e.source === draggingNode.id && e.target === n.id) ||
          (e.source === n.id && e.target === draggingNode.id)
      );
      if (alreadyConnected) return;

      const nodeTargetAnchor = this.getNodeAnchor(n, "target");
      const nodeSourceAnchor = this.getNodeAnchor(n, "source");

      const distAsSource = Math.hypot(
        sourceAnchor.x - nodeTargetAnchor.x,
        sourceAnchor.y - nodeTargetAnchor.y
      );
      if (distAsSource < threshold && distAsSource < closestDist) {
        const { allowed } = this.canConnect(draggingNode.id, n.id, nodes, edges);
        if (allowed) {
          closestDist = distAsSource;
          closest = { id: n.id, sourceId: draggingNode.id, targetId: n.id };
        }
      }

      const distAsTarget = Math.hypot(
        targetAnchor.x - nodeSourceAnchor.x,
        targetAnchor.y - nodeSourceAnchor.y
      );
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
