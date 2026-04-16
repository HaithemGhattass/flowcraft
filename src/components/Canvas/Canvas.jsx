import { useEffect, useRef, useState, useCallback } from "react";
import { useFlowStore } from "../../store/flowStore";
import { useViewport } from "../../hooks/useViewport";
import { useDrag } from "../../hooks/useDrag";
import { useConnect } from "../../hooks/useConnect";
import { FlowEdge } from "../Edge/FlowEdge";
import { FlowNode } from "../Node/FlowNode";
import { Controls } from "../Controls/Controls";
import { Toolbar } from "../Controls/Toolbar";
import { MiniMap } from "../MiniMap/MiniMap";
import { StatusBar } from "../Controls/StatusBar";
import { utils } from "../../utils/utils";
import { EdgeToolbar } from "../Edge/EdgeToolbar";

function ConnectionLine({ connecting, nodes, viewport }) {
  if (!connecting || connecting.mx === undefined) return null;
  const srcNode = nodes.find((n) => n.id === connecting.nodeId);
  if (!srcNode) return null;

  const sx = srcNode.x + srcNode.width;
  const sy = srcNode.y + srcNode.height / 2;
  const tx = (connecting.mx - viewport.x) / viewport.zoom;
  const ty = (connecting.my - viewport.y) / viewport.zoom;
  const d = utils.bezierPath(sx, sy, tx, ty);

  return (
    <path
      d={d}
      fill="none"
      stroke="#60a5fa"
      strokeWidth={1.5}
      strokeDasharray="5 3"
      strokeLinecap="round"
      style={{ pointerEvents: "none", animation: "dashFlow 0.8s linear infinite" }}
    />
  );
}
function ProximityLine({ proximityTarget, nodes }) {
  if (!proximityTarget) return null;
  const src = nodes.find((n) => n.id === proximityTarget.sourceId);
  const tgt = nodes.find((n) => n.id === proximityTarget.targetId);
  if (!src || !tgt) return null;

  // always source right handle → target left handle
  const x1 = src.x + src.width;
  const y1 = src.y + src.height / 2;
  const x2 = tgt.x;
  const y2 = tgt.y + tgt.height / 2;
  const d = utils.bezierPath(x1, y1, x2, y2);

  return (
    <path
      d={d}
      fill="none"
      stroke="#60a5fa"
      strokeWidth={1.5}
      strokeDasharray="5 3"
      strokeLinecap="round"
      style={{ pointerEvents: "none", animation: "dashFlow 0.6s linear infinite" }}
    />
  );
}


export function Canvas() {
  const { state, dispatch } = useFlowStore();
  const { nodes, edges, viewport, connecting, selectedEdge, proximityTarget } = state;
  const canvasRef = useRef(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const update = () => {
      if (canvasRef.current) {
        setSize({ w: canvasRef.current.offsetWidth, h: canvasRef.current.offsetHeight });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

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
    if (canvasRef.current) {
      dispatch({ type: "FIT_VIEW", w: canvasRef.current.offsetWidth, h: canvasRef.current.offsetHeight });
    }
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

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

      // always attempt to commit a proximity edge on any drag end
      dispatch({ type: "COMMIT_PROXIMITY_EDGE" }); // commits if target exists, clears it
      dispatch({ type: "CLEAR_PROXIMITY_TARGET" }); // ensures it's cleared regardless

      if (connecting) {
        const droppedOnPane =
          e.target === canvasRef.current ||
          e.target.closest("[data-canvas-bg]") ||
          (!e.target.closest("[data-nid]") && !e.target.closest("[data-handle]"));

        if (droppedOnPane) {
          const rect = canvasRef.current.getBoundingClientRect();
          const pos = utils.screenToCanvas(
            e.clientX - rect.left,
            e.clientY - rect.top,
            viewport
          );
          dispatch({ type: "DROP_CONNECT_ON_PANE", x: pos.x - 85, y: pos.y - 30 });
        } else {
          cancelConnect();
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [moveDrag, isPanning, movePan, viewport, connecting, dispatch, endDrag, endPan, cancelConnect]);

  // remove onMouseMove and onMouseUp from the canvas <div>

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target === canvasRef.current || e.target.closest("[data-canvas-bg]")) {
      dispatch({ type: "DESELECT_ALL" });
      startPan(e, viewport);
    }
  };
  const selectedEdgeData = useMemo(() => {
    if (!selectedEdge) return null;
    const edge = edges.find((e) => e.id === selectedEdge);
    if (!edge) return null;
    const src = nodes.find((n) => n.id === edge.source);
    const tgt = nodes.find((n) => n.id === edge.target);
    if (!src || !tgt) return null;
    return {
      edge,
      mid: {
        x: (src.x + src.width + tgt.x) / 2,
        y: (src.y + src.height / 2 + tgt.y + tgt.height / 2) / 2,
      },
    };
  }, [selectedEdge, edges, nodes]);

  const onDoubleClick = (e) => {
    if (e.target === canvasRef.current || e.target.closest("[data-canvas-bg]")) {
      const rect = canvasRef.current.getBoundingClientRect();
      const pos = utils.screenToCanvas(e.clientX - rect.left, e.clientY - rect.top, viewport);
      dispatch({ type: "ADD_NODE", x: pos.x - 85, y: pos.y - 30 });
    }
  };

  const gridSize = 24 * viewport.zoom;
  const edgeToolbarRef = useRef(null);

  return (
    <div
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#020810",
        overflow: "hidden",
        cursor: isPanning.current ? "grabbing" : "default",
        userSelect: "none",
      }}
      onMouseDown={onMouseDown}
      // onMouseMove={onMouseMove}
      // onMouseUp={onMouseUp}
      onDoubleClick={onDoubleClick}
    >
      <svg
        data-canvas-bg="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <defs>
          <pattern
            id="grid-minor"
            x={viewport.x % gridSize}
            y={viewport.y % gridSize}
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#0d1a2e" strokeWidth={0.5} />
          </pattern>
          <pattern
            id="grid-major"
            x={viewport.x % (gridSize * 5)}
            y={viewport.y % (gridSize * 5)}
            width={gridSize * 5}
            height={gridSize * 5}
            patternUnits="userSpaceOnUse"
          >
            <path d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`} fill="none" stroke="#111f35" strokeWidth={1} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-minor)" />
        <rect width="100%" height="100%" fill="url(#grid-major)" />

        <g transform={`translate(${viewport.x},${viewport.y}) scale(${viewport.zoom})`}
          style={{ pointerEvents: "all" }} // ← add this, opts the edge layer back in

        >
          <style>{`@keyframes dashFlow { to { stroke-dashoffset: -18; } }`}</style>
          {edges.map((edge) => (
            <FlowEdge
              key={edge.id}
              edge={edge}
              nodes={nodes}
              viewport={viewport}
              selectedEdge={selectedEdge}
              dispatch={dispatch}
              onEditRequest={() => {
                // first select the edge, then trigger edit on next tick after toolbar mounts
                dispatch({ type: "SELECT_EDGE", id: edge.id });
                setTimeout(() => edgeToolbarRef.current?.triggerEdit(), 0);
              }}
            />
          ))}

          <ProximityLine proximityTarget={proximityTarget} nodes={nodes} />
          <ConnectionLine connecting={connecting} nodes={nodes} viewport={viewport} />

          <ConnectionLine connecting={connecting} nodes={nodes} viewport={viewport} />
        </g>
      </svg>

      {nodes.map((node) => (
        <FlowNode
          key={node.id}
          node={node}
          nodes={nodes}    // ← add
          edges={edges}    // ← add
          viewport={viewport}
          onDragStart={startDrag}
          onStartConnect={(e, nid, ht, ax, ay) => startConnect(e, nid, ht, ax, ay)}
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



      <Toolbar dispatch={dispatch} canvasRef={canvasRef} />
      <Controls dispatch={dispatch} canvasRef={canvasRef} />
      <MiniMap nodes={nodes} viewport={viewport} canvasW={size.w} canvasH={size.h} />
      <StatusBar state={state} />

      <div
        style={{
          position: "absolute",
          top: 12,
          right: 16,
          fontSize: 9,
          fontFamily: "monospace",
          color: "#1e3a5f",
          lineHeight: 1.8,
          userSelect: "none",
          zIndex: 100,
          textAlign: "right",
        }}
      >
        <div>double-click canvas → add node</div>
        <div>double-click node → rename</div>
        <div>drag handle → connect</div>
        <div>scroll → zoom · drag → pan</div>
        <div>del · backspace → delete</div>
      </div>
    </div>
  );
}
