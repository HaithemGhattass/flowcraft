import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlowEdge } from "../Edge/FlowEdge";
import { EdgeToolbar } from "../Edge/EdgeToolbar";
import { Controls } from "../Controls/Controls";
import { Toolbar } from "../Controls/Toolbar";
import { FlowNode } from "../Node/FlowNode";
import { useConnect } from "../../hooks/useConnect";
import { useDrag } from "../../hooks/useDrag";
import { useViewport } from "../../hooks/useViewport";
import { getNodeMeta } from "../../config/nodeTypes";
import { useFlowStore } from "../../store/flowStore";
import { utils } from "../../utils/utils";

function ConnectionLine({ connecting, nodes, viewport }) {
  if (!connecting || connecting.mx === undefined) return null;

  const srcNode = nodes.find((node) => node.id === connecting.nodeId);
  if (!srcNode) return null;

  const sourceAnchor = utils.getNodeAnchor(srcNode, connecting.handleType);
  const tx = (connecting.mx - viewport.x) / viewport.zoom;
  const ty = (connecting.my - viewport.y) / viewport.zoom;
  const d = utils.bezierPath(sourceAnchor.x, sourceAnchor.y, tx, ty);

  return (
    <path
      d={d}
      fill="none"
      stroke="#7f98ff"
      strokeWidth={2}
      strokeDasharray="6 5"
      strokeLinecap="round"
      style={{ pointerEvents: "none", animation: "dashFlow 0.9s linear infinite" }}
    />
  );
}

function ProximityLine({ proximityTarget, nodes }) {
  if (!proximityTarget) return null;

  const src = nodes.find((node) => node.id === proximityTarget.sourceId);
  const tgt = nodes.find((node) => node.id === proximityTarget.targetId);
  if (!src || !tgt) return null;

  const { source, target } = utils.getEdgeEndpoints(src, tgt);
  const d = utils.bezierPath(source.x, source.y, target.x, target.y);

  return (
    <path
      d={d}
      fill="none"
      stroke="#c7d6ff"
      strokeWidth={2}
      strokeDasharray="5 5"
      strokeLinecap="round"
      style={{ pointerEvents: "none", animation: "dashFlow 0.7s linear infinite" }}
    />
  );
}

export function Canvas({ canvasRef }) {
  const { state, dispatch } = useFlowStore();
  const { nodes, edges, viewport, connecting, selectedEdge, proximityTarget } = state;
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [paletteDragActive, setPaletteDragActive] = useState(false);
  const edgeToolbarRef = useRef(null);
  const hasFitViewRun = useRef(false);

  useEffect(() => {
    const update = () => {
      if (!canvasRef.current) return;
      setSize({
        w: canvasRef.current.offsetWidth,
        h: canvasRef.current.offsetHeight,
      });
    };

    update();
    const observer = new ResizeObserver(update);
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [canvasRef]);

  const dispatchFn = useCallback(
    (action) => {
      if (typeof action === "function") {
        dispatch(action(state));
      } else {
        dispatch(action);
      }
    },
    [dispatch, state]
  );

  const { onWheel, startPan, movePan, endPan, isPanning } = useViewport(canvasRef, dispatchFn);
  const { startDrag, moveDrag, endDrag } = useDrag(dispatch, viewport, nodes, edges);
  const { startConnect, finishConnect, cancelConnect } = useConnect(dispatch);

  useEffect(() => {
    if (!canvasRef.current || hasFitViewRun.current) return;
    dispatch({
      type: "FIT_VIEW",
      w: canvasRef.current.offsetWidth,
      h: canvasRef.current.offsetHeight,
    });
    hasFitViewRun.current = true;
  }, [dispatch, canvasRef]);

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [canvasRef, onWheel]);

  useEffect(() => {
    const clearPaletteDrag = () => setPaletteDragActive(false);
    window.addEventListener("dragend", clearPaletteDrag);
    window.addEventListener("drop", clearPaletteDrag);
    return () => {
      window.removeEventListener("dragend", clearPaletteDrag);
      window.removeEventListener("drop", clearPaletteDrag);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (moveDrag(e)) return;
      if (isPanning.current) movePan(e, viewport);

      if (connecting) {
        const rect = canvasRef.current?.getBoundingClientRect();
        dispatch({
          type: "UPDATE_CONNECT",
          x: e.clientX - (rect?.left ?? 0),
          y: e.clientY - (rect?.top ?? 0),
        });
      }
    };

    const handleMouseUp = (e) => {
      endDrag();
      endPan();
      dispatch({ type: "COMMIT_PROXIMITY_EDGE" });
      dispatch({ type: "CLEAR_PROXIMITY_TARGET" });

      if (!connecting) return;

      const droppedOnPane =
        e.target === canvasRef.current ||
        e.target.closest("[data-canvas-bg]") ||
        (!e.target.closest("[data-nid]") && !e.target.closest("[data-handle]"));

      if (droppedOnPane) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const pos = utils.screenToCanvas(e.clientX - rect.left, e.clientY - rect.top, viewport);
        dispatch({ type: "DROP_CONNECT_ON_PANE", x: pos.x - 98, y: pos.y - 26 });
      } else {
        cancelConnect();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    moveDrag,
    isPanning,
    movePan,
    viewport,
    connecting,
    dispatch,
    endDrag,
    endPan,
    cancelConnect,
    canvasRef,
  ]);

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target === canvasRef.current || e.target.closest("[data-canvas-bg]")) {
      dispatch({ type: "DESELECT_ALL" });
      startPan(e, viewport);
    }
  };

  const onDoubleClick = (e) => {
    if (e.target !== canvasRef.current && !e.target.closest("[data-canvas-bg]")) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pos = utils.screenToCanvas(e.clientX - rect.left, e.clientY - rect.top, viewport);
    dispatch({ type: "ADD_NODE", x: pos.x - 103, y: pos.y - 26, nodeType: "transform" });
  };

  const onDragOver = (e) => {
    if (!e.dataTransfer.types.includes("application/flowcraft-node")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setPaletteDragActive(true);
  };

  const onDragLeave = (e) => {
    if (!canvasRef.current?.contains(e.relatedTarget)) {
      setPaletteDragActive(false);
    }
  };

  const onDrop = (e) => {
    const nodeType = e.dataTransfer.getData("application/flowcraft-node");
    if (!nodeType) return;
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pos = utils.screenToCanvas(e.clientX - rect.left, e.clientY - rect.top, viewport);
    const nodeMeta = getNodeMeta(nodeType);
    dispatch({
      type: "ADD_NODE_FROM_PALETTE",
      nodeType,
      label: nodeMeta.label,
      x: pos.x - nodeMeta.defaultWidth / 2,
      y: pos.y - nodeMeta.defaultHeight / 2,
    });
    setPaletteDragActive(false);
  };

  const selectedEdgeData = useMemo(() => {
    if (!selectedEdge) return null;
    const edge = edges.find((item) => item.id === selectedEdge);
    if (!edge) return null;
    const src = nodes.find((node) => node.id === edge.source);
    const tgt = nodes.find((node) => node.id === edge.target);
    if (!src || !tgt) return null;

    return {
      edge,
      mid: utils.getEdgeMidpoint(src, tgt),
    };
  }, [selectedEdge, edges, nodes]);

  return (
    <section className="editor-stage">
      <div
        ref={canvasRef}
        className={`workflow-canvas${isPanning.current ? " is-panning" : ""}${paletteDragActive ? " is-drop-target" : ""}`}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div data-canvas-bg="true" className="workflow-canvas__dots" />

        <svg className="workflow-canvas__edges" style={{ width: size.w, height: size.h }}>
          <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
            <style>{`@keyframes dashFlow { to { stroke-dashoffset: -20; } }`}</style>
            {edges.map((edge) => (
              <FlowEdge
                key={edge.id}
                edge={edge}
                nodes={nodes}
                selectedEdge={selectedEdge}
                dispatch={dispatch}
                onEditRequest={() => {
                  dispatch({ type: "SELECT_EDGE", id: edge.id });
                  setTimeout(() => edgeToolbarRef.current?.triggerEdit(), 0);
                }}
              />
            ))}
            <ProximityLine proximityTarget={proximityTarget} nodes={nodes} />
            <ConnectionLine connecting={connecting} nodes={nodes} viewport={viewport} />
          </g>
        </svg>

        {nodes.map((node) => (
          <FlowNode
            key={node.id}
            node={node}
            nodes={nodes}
            edges={edges}
            viewport={viewport}
            onDragStart={startDrag}
            onStartConnect={(e, nid, handleType, ax, ay) => startConnect(e, nid, handleType, ax, ay)}
            onFinishConnect={finishConnect}
            dispatch={dispatch}
          />
        ))}

        {selectedEdgeData && (
          <EdgeToolbar
            ref={edgeToolbarRef}
            edge={selectedEdgeData.edge}
            mid={selectedEdgeData.mid}
            viewport={viewport}
            dispatch={dispatch}
          />
        )}

        <Toolbar dispatch={dispatch} />
        <Controls dispatch={dispatch} canvasRef={canvasRef} />
      </div>
    </section>
  );
}
