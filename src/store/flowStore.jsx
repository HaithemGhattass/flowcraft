import { createContext, useReducer, useContext } from "react";
import { utils } from "../utils/utils";

const FlowContext = createContext(null);

const initialState = {
  nodes: [
    { id: "node_1", x: 80,  y: 150, width: 170, height: 60, label: "Start",     type: "initial",   selected: false, data: {} },
    { id: "node_2", x: 320, y: 80,  width: 170, height: 60, label: "Transform", type: "transform", selected: false, data: {} },
    { id: "node_3", x: 320, y: 220, width: 170, height: 60, label: "Branch",    type: "branch",    selected: false, data: {} },
    { id: "node_4", x: 560, y: 150, width: 170, height: 60, label: "End",       type: "output",    selected: false, data: {} },
  ],
  edges: [
    { id: "e1", source: "node_1", target: "node_2", label: "", animated: false },
    { id: "e2", source: "node_1", target: "node_3", label: "", animated: false },
    { id: "e3", source: "node_2", target: "node_4", label: "", animated: false },
    { id: "e4", source: "node_3", target: "node_4", label: "", animated: false },
  ],
  viewport: { x: 60, y: 40, zoom: 1 },
  selectedEdge: null,
  connecting: null,
  proximityTarget: null,
  clipboard: null,
};

function flowReducer(state, action) {
  switch (action.type) {

    case "SET_VIEWPORT":
      return { ...state, viewport: action.viewport };

    case "MOVE_NODE": {
      const nodes = state.nodes.map((n) =>
        n.id === action.id ? { ...n, x: action.x, y: action.y } : n
      );
      return { ...state, nodes };
    }

    case "MOVE_SELECTED_NODES_ABSOLUTE": {
      const nodes = state.nodes.map((n) => {
        if (!n.selected) return n;
        const start = action.positions[n.id];
        if (!start) return n;
        return { ...n, x: start.x + action.dx, y: start.y + action.dy };
      });
      return { ...state, nodes };
    }

    case "SELECT_NODE": {
      const nodes = state.nodes.map((n) => ({
        ...n,
        selected: action.multi
          ? n.id === action.id ? !n.selected : n.selected
          : n.id === action.id,
      }));
      return { ...state, nodes, selectedEdge: null };
    }

    case "DESELECT_ALL":
      return {
        ...state,
        nodes: state.nodes.map((n) => ({ ...n, selected: false })),
        selectedEdge: null,
      };

    case "SELECT_EDGE":
      return {
        ...state,
        selectedEdge: action.id,
        nodes: state.nodes.map((n) => ({ ...n, selected: false })),
      };

    case "ADD_NODE": {
      const id = utils.id("node");
      return {
        ...state,
        nodes: [
          ...state.nodes,
          {
            id, x: action.x, y: action.y,
            width: 170, height: 60,
            label: action.label ?? "New Node",
            type: action.nodeType ?? "transform",
            selected: true, data: {},
          },
        ],
      };
    }

    case "DELETE_SELECTED": {
      const selectedIds = new Set(state.nodes.filter((n) => n.selected).map((n) => n.id));

      const incomingMap = {};
      const outgoingMap = {};
      state.edges.forEach((e) => {
        if (selectedIds.has(e.target)) {
          if (!incomingMap[e.target]) incomingMap[e.target] = [];
          incomingMap[e.target].push(e.source);
        }
        if (selectedIds.has(e.source)) {
          if (!outgoingMap[e.source]) outgoingMap[e.source] = [];
          outgoingMap[e.source].push(e.target);
        }
      });

      const survivingEdges = state.edges.filter(
        (e) => !selectedIds.has(e.source) && !selectedIds.has(e.target) && e.id !== state.selectedEdge
      );

      const bridgingEdges = [];
      selectedIds.forEach((deletedId) => {
        const sources = incomingMap[deletedId] ?? [];
        const targets = outgoingMap[deletedId] ?? [];
        sources.forEach((src) => {
          targets.forEach((tgt) => {
            const alreadyExists =
              survivingEdges.some((e) => e.source === src && e.target === tgt) ||
              bridgingEdges.some((e) => e.source === src && e.target === tgt);
            if (!alreadyExists) {
              const { allowed } = utils.canConnect(src, tgt, state.nodes.filter((n) => !selectedIds.has(n.id)), survivingEdges);
              if (allowed) bridgingEdges.push({ id: utils.id("edge"), source: src, target: tgt, label: "", animated: false });
            }
          });
        });
      });

      return {
        ...state,
        nodes: state.nodes.filter((n) => !n.selected),
        edges: [...survivingEdges, ...bridgingEdges],
        selectedEdge: null,
      };
    }

    case "CHANGE_NODE_TYPE": {
      const nodes = state.nodes.map((n) =>
        n.id === action.id ? { ...n, type: action.nodeType } : n
      );
      const edges = state.edges.filter((e) => {
        if (e.source === action.id && action.nodeType === "output") return false;
        if (e.target === action.id && action.nodeType === "initial") return false;
        return true;
      });
      return { ...state, nodes, edges };
    }

    case "RESIZE_NODE": {
      const nodes = state.nodes.map((n) =>
        n.id === action.id
          ? { ...n, x: action.x ?? n.x, y: action.y ?? n.y, width: Math.max(120, action.width), height: Math.max(40, action.height) }
          : n
      );
      return { ...state, nodes };
    }

    case "START_CONNECT":
      return { ...state, connecting: action.connecting };

    case "UPDATE_CONNECT":
      return {
        ...state,
        connecting: state.connecting ? { ...state.connecting, mx: action.x, my: action.y } : null,
      };

    case "FINISH_CONNECT": {
      if (!state.connecting) return state;
      const { nodeId: sourceId } = state.connecting;
      const { nodeId: targetId } = action;
      const { allowed } = utils.canConnect(sourceId, targetId, state.nodes, state.edges);
      if (!allowed) return { ...state, connecting: null };
      const edge = { id: utils.id("edge"), source: sourceId, target: targetId, label: "", animated: false };
      return { ...state, edges: [...state.edges, edge], connecting: null };
    }

    case "CANCEL_CONNECT":
      return { ...state, connecting: null };

    case "DROP_CONNECT_ON_PANE": {
      if (!state.connecting) return state;
      const { nodeId: sourceId } = state.connecting;
      const sourceNode = state.nodes.find((n) => n.id === sourceId);
      const rule = utils.getRules(sourceNode?.type);
      const currentOutputs = state.edges.filter((e) => e.source === sourceId).length;
      if (currentOutputs >= rule.maxOutputs) return { ...state, connecting: null };

      const newId = utils.id("node");
      const newNode = { id: newId, x: action.x, y: action.y, width: 170, height: 60, label: "Transform", type: "transform", selected: true, data: {} };
      const newEdge = { id: utils.id("edge"), source: sourceId, target: newId, label: "", animated: false };
      const nodes = state.nodes.map((n) => ({ ...n, selected: false }));
      return { ...state, nodes: [...nodes, newNode], edges: [...state.edges, newEdge], connecting: null };
    }

    case "RENAME_NODE": {
      const nodes = state.nodes.map((n) => (n.id === action.id ? { ...n, label: action.label } : n));
      return { ...state, nodes };
    }

    case "RENAME_EDGE": {
      const edges = state.edges.map((e) => (e.id === action.id ? { ...e, label: action.label } : e));
      return { ...state, edges };
    }

    case "DELETE_EDGE":
      return {
        ...state,
        edges: state.edges.filter((e) => e.id !== action.id),
        selectedEdge: state.selectedEdge === action.id ? null : state.selectedEdge,
      };

    case "TOGGLE_EDGE_ANIMATED": {
      const edges = state.edges.map((e) => (e.id === action.id ? { ...e, animated: !e.animated } : e));
      return { ...state, edges };
    }

    case "INSERT_NODE_ON_EDGE": {
      const edge = state.edges.find((e) => e.id === action.edgeId);
      if (!edge) return state;
      const source = state.nodes.find((n) => n.id === edge.source);
      const target = state.nodes.find((n) => n.id === edge.target);
      if (!source || !target) return state;

      const newId = utils.id("node");
      const x = (source.x + source.width + target.x) / 2 - 85;
      const y = (source.y + source.height / 2 + target.y + target.height / 2) / 2 - 30;
      const newNode = { id: newId, x, y, width: 170, height: 60, label: action.label, type: action.nodeType, selected: false, data: {} };

      const edges = state.edges
        .filter((e) => e.id !== action.edgeId)
        .concat([
          { id: utils.id("edge"), source: edge.source, target: newId, label: "", animated: edge.animated },
          { id: utils.id("edge"), source: newId, target: edge.target, label: "", animated: edge.animated },
        ]);
      return { ...state, nodes: [...state.nodes, newNode], edges };
    }

    case "SET_PROXIMITY_TARGET":
      return { ...state, proximityTarget: action.target };

    case "COMMIT_PROXIMITY_EDGE": {
      if (!state.proximityTarget) return state;
      const { sourceId, targetId } = state.proximityTarget;
      const { allowed } = utils.canConnect(sourceId, targetId, state.nodes, state.edges);
      if (!allowed) return { ...state, proximityTarget: null };
      const newEdge = { id: utils.id("edge"), source: sourceId, target: targetId, label: "", animated: false };
      return { ...state, edges: [...state.edges, newEdge], proximityTarget: null };
    }

    case "CLEAR_PROXIMITY_TARGET":
      return { ...state, proximityTarget: null };

    case "COPY_SELECTED": {
      const selectedNodes = state.nodes.filter((n) => n.selected);
      if (selectedNodes.length === 0) return state;
      const selectedIds = new Set(selectedNodes.map((n) => n.id));
      const selectedEdges = state.edges.filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target));
      return { ...state, clipboard: { nodes: selectedNodes, edges: selectedEdges } };
    }

    case "PASTE": {
      if (!state.clipboard || state.clipboard.nodes.length === 0) return state;
      const OFFSET = 30;
      const idMap = {};
      state.clipboard.nodes.forEach((n) => { idMap[n.id] = utils.id("node"); });
      const newNodes = state.clipboard.nodes.map((n) => ({ ...n, id: idMap[n.id], x: n.x + OFFSET, y: n.y + OFFSET, selected: true }));
      const newEdges = state.clipboard.edges.map((e) => ({ ...e, id: utils.id("edge"), source: idMap[e.source], target: idMap[e.target] }));
      const existingNodes = state.nodes.map((n) => ({ ...n, selected: false }));
      return { ...state, nodes: [...existingNodes, ...newNodes], edges: [...state.edges, ...newEdges], selectedEdge: null };
    }

    case "FIT_VIEW": {
      if (state.nodes.length === 0) return state;
      const pad = 60;
      const minX = Math.min(...state.nodes.map((n) => n.x));
      const minY = Math.min(...state.nodes.map((n) => n.y));
      const maxX = Math.max(...state.nodes.map((n) => n.x + (n.width ?? 170)));
      const maxY = Math.max(...state.nodes.map((n) => n.y + (n.height ?? 60)));
      const zoom = utils.clamp(Math.min((action.w - pad * 2) / (maxX - minX), (action.h - pad * 2) / (maxY - minY)), 0.1, 2);
      const cx = (maxX + minX) / 2, cy = (maxY + minY) / 2;
      return { ...state, viewport: { zoom, x: action.w / 2 - cx * zoom, y: action.h / 2 - cy * zoom } };
    }

    default:
      return state;
  }
}

export function FlowProvider({ children, initialNodes, initialEdges }) {
  const [state, dispatch] = useReducer(flowReducer, {
    ...initialState,
    nodes: initialNodes ?? initialState.nodes,
    edges: initialEdges ?? initialState.edges,
  });
  return <FlowContext.Provider value={{ state, dispatch }}>{children}</FlowContext.Provider>;
}

export function useFlowStore() {
  return useContext(FlowContext);
}
