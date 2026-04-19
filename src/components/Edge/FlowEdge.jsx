import { utils } from "../../utils/utils";
import { EdgeInsertMenu } from "./EdgeInsertMenu";

export function FlowEdge({ edge, nodes, selectedEdge, dispatch, onEditRequest }) {
  const source = nodes.find((n) => n.id === edge.source);
  const target = nodes.find((n) => n.id === edge.target);
  if (!source || !target) return null;

  const { source: sourceAnchor, target: targetAnchor } = utils.getEdgeEndpoints(source, target);
  const sx = sourceAnchor.x;
  const sy = sourceAnchor.y;
  const tx = targetAnchor.x;
  const ty = targetAnchor.y;
  const d = utils.bezierPath(sx, sy, tx, ty);

  const isSelected = selectedEdge === edge.id;
  const strokeColor = isSelected ? "#4f7cff" : edge.animated ? "#96a7ff" : "#d4dbe6";
  const strokeWidth = isSelected ? 2.25 : 1.8;
  const mid = utils.getEdgeMidpoint(source, target);
  const arrowDirection = ty >= sy ? 1 : -1;

  return (
    <g style={{ cursor: "pointer" }} onDoubleClick={(e) => e.stopPropagation()}>
      <path
        d={d}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: "SELECT_EDGE", id: edge.id });
        }}
      />
      <path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={edge.animated ? "6 4" : undefined}
        strokeLinecap="round"
        style={edge.animated ? { animation: "dashFlow 0.9s linear infinite" } : undefined}
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: "SELECT_EDGE", id: edge.id });
        }}
      />
      <path
        d={`M${tx - 5},${ty - 8 * arrowDirection} L${tx},${ty} L${tx + 5},${ty - 8 * arrowDirection}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {edge.label && (
        <g
          onDoubleClick={(e) => {
            e.stopPropagation();
            onEditRequest?.();
          }}
        >
          <rect
            x={mid.x - (edge.label.length * 4.3 + 12)}
            y={mid.y - 23}
            width={edge.label.length * 8.6 + 24}
            height={22}
            rx={11}
            fill="#ffffff"
            stroke="#dce2eb"
            strokeWidth={1}
          />
          <text
            x={mid.x}
            y={mid.y - 8}
            textAnchor="middle"
            fill="#607086"
            fontSize={10}
            fontFamily="system-ui, sans-serif"
            style={{ userSelect: "none", fontWeight: 600 }}
          >
            {edge.label}
          </text>
        </g>
      )}

      <EdgeInsertMenu mid={edge.label ? { x: mid.x, y: mid.y + 12 } : mid} edgeId={edge.id} dispatch={dispatch} />
    </g>
  );
}
