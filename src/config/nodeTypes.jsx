export const NODE_TYPE_DEFS = {
  initial: {
    type: "initial",
    label: "Initial Node",
    shortLabel: "Initial",
    description: "Entry point for a workflow",
    glyph: "◌",
    accent: "#4f7cff",
    tint: "#edf3ff",
    border: "#d8e4ff",
    maxInputs: 0,
    maxOutputs: Infinity,
    defaultWidth: 196,
    defaultHeight: 52,
  },
  transform: {
    type: "transform",
    label: "Transform Node",
    shortLabel: "Transform",
    description: "Modify or enrich data",
    glyph: "↗",
    accent: "#7c6cff",
    tint: "#f2efff",
    border: "#e0d9ff",
    maxInputs: 1,
    maxOutputs: 1,
    defaultWidth: 206,
    defaultHeight: 52,
  },
  join: {
    type: "join",
    label: "Join Node",
    shortLabel: "Join",
    description: "Merge multiple branches",
    glyph: "⋈",
    accent: "#22a67a",
    tint: "#ebfbf5",
    border: "#cceee2",
    maxInputs: Infinity,
    maxOutputs: 1,
    defaultWidth: 186,
    defaultHeight: 52,
  },
  branch: {
    type: "branch",
    label: "Branch Node",
    shortLabel: "Branch",
    description: "Split flow into paths",
    glyph: "⑂",
    accent: "#d9901a",
    tint: "#fff6e7",
    border: "#f0dfba",
    maxInputs: 1,
    maxOutputs: Infinity,
    defaultWidth: 186,
    defaultHeight: 52,
  },
  output: {
    type: "output",
    label: "Output Node",
    shortLabel: "Output",
    description: "Finalize or export results",
    glyph: "✓",
    accent: "#1f9d6b",
    tint: "#ebfbf4",
    border: "#c9ecdd",
    maxInputs: Infinity,
    maxOutputs: 0,
    defaultWidth: 190,
    defaultHeight: 52,
  },
};

export const PALETTE_NODE_TYPES = ["initial", "transform", "join", "branch", "output"];

export function getNodeMeta(type) {
  return NODE_TYPE_DEFS[type] ?? NODE_TYPE_DEFS.transform;
}

export function createNodeRecord({
  id,
  x,
  y,
  type = "transform",
  label,
  selected = false,
  data = {},
}) {
  const meta = getNodeMeta(type);

  return {
    id,
    x,
    y,
    width: meta.defaultWidth,
    height: meta.defaultHeight,
    label: label ?? meta.label,
    type,
    selected,
    data: {
      iconKey: type,
      displayTitle: meta.label,
      ...data,
    },
  };
}
