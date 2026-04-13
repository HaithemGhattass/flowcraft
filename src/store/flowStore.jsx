import { createContext, useReducer, useContext } from "react";
import { utils } from "../utils/utils";

const FlowContext = createContext(null);

const initialState = {
  nodes: [
    { id: "node_1", x: 80, y: 120, width: 170, height: 60, label: "Input", type: "input", selected: false, data: {} },
    { id: "node_2", x: 340, y: 80, width: 170, height: 60, label: "Process A", type: "default", selected: false, data: {} },
    { id: "node_3", x: 340, y: 200, width: 170, height: 60, label: "Process B", type: "default", selected: false, data: {} },
    { id: "node_4", x: 600, y: 140, width: 170, height: 60, label: "Output", type: "output", selected: false, data: {} },
  ],
  edges: [
    { id: "e1", source: "node_1", target: "node_2", label: "data", animated: false },
    { id: "e2", source: "node_1", target: "node_3", label: "", animated: true },
    { id: "e3", source: "node_2", target: "node_4", label: "result", animated: false },
    { id: "e4", source: "node_3", target: "node_4", label: "", animated: false },
  ],
  viewport: { x: 60, y: 40, zoom: 1 },
  selectedEdge: null,
  connecting: null,
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

    case "SELECT_NODE": {
      const nodes = state.nodes.map((n) => ({
        ...n,
        selected: action.multi ? (n.id === action.id ? !n.selected : n.selected) : n.id === action.id,
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
          { id, x: action.x, y: action.y, width: 170, height: 60, label: action.label ?? "New Node", type: "default", selected: true, data: {} },
        ],
      };
    }

    case "DELETE_SELECTED": {
      const selectedIds = new Set(state.nodes.filter((n) => n.selected).map((n) => n.id));
      const nodes = state.nodes.filter((n) => !n.selected);
      const edges = state.edges.filter(
        (e) => !selectedIds.has(e.source) && !selectedIds.has(e.target) && e.id !== state.selectedEdge
      );
      return { ...state, nodes, edges, selectedEdge: null };
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
      if (sourceId === targetId) return { ...state, connecting: null };
      const exists = state.edges.some((e) => e.source === sourceId && e.target === targetId);
      if (exists) return { ...state, connecting: null };
      const edge = { id: utils.id("edge"), source: sourceId, target: targetId, label: "", animated: false };
      return { ...state, edges: [...state.edges, edge], connecting: null };
    }

    case "CANCEL_CONNECT":
      return { ...state, connecting: null };

    case "RENAME_NODE": {
      const nodes = state.nodes.map((n) => (n.id === action.id ? { ...n, label: action.label } : n));
      return { ...state, nodes };
    }

    case "TOGGLE_EDGE_ANIMATED": {
      const edges = state.edges.map((e) => (e.id === action.id ? { ...e, animated: !e.animated } : e));
      return { ...state, edges };
    }

    case "FIT_VIEW": {
      if (state.nodes.length === 0) return state;
      const pad = 60;
      const minX = Math.min(...state.nodes.map((n) => n.x));
      const minY = Math.min(...state.nodes.map((n) => n.y));
      const maxX = Math.max(...state.nodes.map((n) => n.x + (n.width ?? 170)));
      const maxY = Math.max(...state.nodes.map((n) => n.y + (n.height ?? 60)));
      const gw = action.w - pad * 2;
      const gh = action.h - pad * 2;
      const zoom = utils.clamp(Math.min(gw / (maxX - minX), gh / (maxY - minY)), 0.1, 2);
      const cx = (maxX + minX) / 2;
      const cy = (maxY + minY) / 2;
      return {
        ...state,
        viewport: { zoom, x: action.w / 2 - cx * zoom, y: action.h / 2 - cy * zoom },
      };
    }

    case "CHANGE_NODE_TYPE": {
      const nodes = state.nodes.map((n) =>
        n.id === action.id ? { ...n, type: action.nodeType } : n
      );
      // remove edges that no longer have a valid handle
      const edges = state.edges.filter((e) => {
        if (e.source === action.id && action.nodeType === "output") return false;
        if (e.target === action.id && action.nodeType === "input") return false;
        return true;
      });
      return { ...state, nodes, edges };
    }
    case "RESIZE_NODE": {
      const nodes = state.nodes.map((n) =>
        n.id === action.id
          ? {
            ...n,
            x: action.x ?? n.x,
            y: action.y ?? n.y,
            width: Math.max(120, action.width),
            height: Math.max(40, action.height),
          }
          : n
      );
      return { ...state, nodes };
    }
    case "DROP_CONNECT_ON_PANE": {
      if (!state.connecting) return state;
      const { nodeId: sourceId } = state.connecting;
      const newId = utils.id("node");
      const newNode = {
        id: newId,
        x: action.x,
        y: action.y,
        width: 170,
        height: 60,
        label: "New Node",
        type: "default",
        selected: true,
        data: {},
      };
      const newEdge = {
        id: utils.id("edge"),
        source: sourceId,
        target: newId,
        label: "",
        animated: false,
      };
      const nodes = state.nodes.map((n) => ({ ...n, selected: false }));
      return {
        ...state,
        nodes: [...nodes, newNode],
        edges: [...state.edges, newEdge],
        connecting: null,
      };
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
