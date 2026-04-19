import { useEffect, useRef, useState } from "react";
import { getNodeMeta } from "../../config/nodeTypes";
import { utils } from "../../utils/utils";
import { Handle } from "../Handle/Handle";
import { NodeResizer } from "./NodeResizer";

const HANDLE_VISIBILITY = {
  initial: { target: false, source: true },
  transform: { target: true, source: true },
  branch: { target: true, source: true },
  join: { target: true, source: true },
  output: { target: true, source: false },
};

const NODE_TYPE_OPTIONS = ["initial", "transform", "join", "branch", "output"];

function NodeAction({ label, onMouseDown, danger = false, scale = 1 }) {
  return (
    <button
      type="button"
      className={`flow-node__action${danger ? " is-danger" : ""}`}
      style={{
        padding: `${7 * scale}px ${10 * scale}px`,
        borderRadius: 10 * scale,
        fontSize: 0.72 * scale + "rem",
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onMouseDown?.();
      }}
    >
      {label}
    </button>
  );
}

export function FlowNode({
  node,
  viewport,
  onStartConnect,
  onFinishConnect,
  onDragStart,
  dispatch,
  nodes,
  edges,
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(node.label);
  const inputRef = useRef(null);
  const meta = getNodeMeta(node.type);
  const visibility = HANDLE_VISIBILITY[node.type] ?? { target: true, source: true };
  const sourceSaturated = utils.isHandleSaturated(node.id, "source", nodes, edges);
  const targetSaturated = utils.isHandleSaturated(node.id, "target", nodes, edges);

  const sx = node.x * viewport.zoom + viewport.x;
  const sy = node.y * viewport.zoom + viewport.y;
  const sw = node.width * viewport.zoom;
  const sh = node.height * viewport.zoom;
  const uiScale = utils.clamp(viewport.zoom, 0.35, 1.8);
  const nodePaddingX = 14 * uiScale;
  const nodeGap = 12 * uiScale;
  const iconSize = 36 * uiScale;
  const iconRadius = 11 * uiScale;
  const iconFont = 18 * uiScale;
  const titleSize = 16 * uiScale;
  const metaSize = 12 * uiScale;
  const buttonSize = 28 * uiScale;
  const buttonFont = 13 * uiScale;
  const inputHeight = 34 * uiScale;
  const inputFont = 14 * uiScale;
  const switcherScale = utils.clamp(viewport.zoom, 0.5, 1.25);
  const showMeta = viewport.zoom >= 0.58;

  useEffect(() => {
    setLabel(node.label);
  }, [node.label]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitEdit = () => {
    setEditing(false);
    dispatch({ type: "RENAME_NODE", id: node.id, label: label.trim() || meta.label });
  };

  return (
    <div
      data-nid={node.id}
      className={`flow-node${node.selected ? " is-selected" : ""}`}
      style={{
        left: sx,
        top: sy,
        minWidth: sw,
        height: sh,
        padding: `0 ${nodePaddingX}px`,
        gap: nodeGap,
        borderRadius: 16 * uiScale,
        borderColor: node.selected ? meta.accent : "#d9dee7",
        boxShadow: node.selected
          ? "0 18px 40px rgba(15, 23, 42, 0.12)"
          : "0 10px 24px rgba(15, 23, 42, 0.06)",
      }}
      onMouseDown={(e) => {
        const isMultiKey = e.metaKey || e.ctrlKey;
        if (!node.selected || isMultiKey) {
          dispatch({ type: "SELECT_NODE", id: node.id, multi: isMultiKey });
        }
        onDragStart(e, node.id, node.x, node.y);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
    >
      <div
        className="flow-node__icon"
        style={{
          color: meta.accent,
          background: meta.tint,
          borderColor: meta.border,
          width: iconSize,
          height: iconSize,
          minWidth: iconSize,
          borderRadius: iconRadius,
          fontSize: iconFont,
        }}
      >
        {meta.glyph}
      </div>

      <div className="flow-node__body">
        {editing ? (
          <input
            ref={inputRef}
            value={label}
            className="flow-node__input"
            style={{ height: inputHeight, fontSize: inputFont, borderRadius: 10 * uiScale, padding: `0 ${10 * uiScale}px` }}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") {
                setLabel(node.label);
                setEditing(false);
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            <div className="flow-node__label" style={{ fontSize: titleSize }}>{node.label}</div>
            {showMeta && (
              <div className="flow-node__meta" style={{ fontSize: metaSize }}>
                {meta.description}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flow-node__right" style={{ gap: 8 * uiScale }}>
        <button
          type="button"
          className="flow-node__play"
          title="Highlight node"
          style={{ width: buttonSize, height: buttonSize, borderRadius: 9 * uiScale, fontSize: buttonFont }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            dispatch({ type: "SELECT_NODE", id: node.id, multi: false });
          }}
        >
          ▷
        </button>
        <button
          type="button"
          className="flow-node__delete"
          title="Delete node"
          style={{ width: buttonSize, height: buttonSize, borderRadius: 9 * uiScale, fontSize: buttonFont }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            dispatch({ type: "SELECT_NODE", id: node.id, multi: false });
            dispatch({ type: "DELETE_SELECTED" });
          }}
        >
          ⌫
        </button>
      </div>

      {node.selected && (
        <div
          className="flow-node__type-switcher"
          style={{
            bottom: -44 * switcherScale,
            gap: 6 * switcherScale,
            padding: 8 * switcherScale,
            borderRadius: 16 * switcherScale,
          }}
        >
          {NODE_TYPE_OPTIONS.map((nodeType) => {
            const option = getNodeMeta(nodeType);
            return (
              <NodeAction
                key={nodeType}
                label={option.shortLabel}
                onMouseDown={() => dispatch({ type: "CHANGE_NODE_TYPE", id: node.id, nodeType })}
                danger={nodeType === "output" && node.type !== "output"}
                scale={switcherScale}
              />
            );
          })}
        </div>
      )}

      {visibility.target && (
        <Handle
          nodeId={node.id}
          type="target"
          viewport={viewport}
          cx={node.x + node.width / 2}
          cy={node.y}
          onStartConnect={onStartConnect}
          onFinishConnect={onFinishConnect}
          saturated={targetSaturated}
          accent={meta.accent}
        />
      )}

      {visibility.source && (
        <Handle
          nodeId={node.id}
          type="source"
          viewport={viewport}
          cx={node.x + node.width / 2}
          cy={node.y + node.height}
          onStartConnect={onStartConnect}
          onFinishConnect={onFinishConnect}
          saturated={sourceSaturated}
          accent={meta.accent}
        />
      )}

      {node.selected && <NodeResizer node={node} viewport={viewport} dispatch={dispatch} />}
    </div>
  );
}
