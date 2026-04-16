import { utils } from "../../utils/utils";
import { EdgeInsertMenu } from "./EdgeInsertMenu";

export function FlowEdge({ edge, nodes, viewport, selectedEdge, dispatch, onEditRequest }) {
  const source = nodes.find((n) => n.id === edge.source);
  const target = nodes.find((n) => n.id === edge.target);
  if (!source || !target) return null;

  const sx = source.x + source.width;
  const sy = source.y + source.height / 2;
  const tx = target.x;
  const ty = target.y + target.height / 2;
  const d  = utils.bezierPath(sx, sy, tx, ty);

  const isSelected  = selectedEdge === edge.id;
  const strokeColor = isSelected ? "#60a5fa" : "#374151";
  const strokeW     = isSelected ? 2 : 1.5;
  const mid = { x: (sx + tx) / 2, y: (sy + ty) / 2 };

  return (
    <g style={{ cursor: "pointer" }} onDoubleClick={(e) => e.stopPropagation()}>
      <path d={d} fill="none" stroke="transparent" strokeWidth={12} style={{ cursor: "pointer" }}
        onClick={(e) => { e.stopPropagation(); dispatch({ type: "SELECT_EDGE", id: edge.id }); }} />
      <path d={d} fill="none" stroke={strokeColor} strokeWidth={strokeW}
        strokeDasharray={edge.animated ? "6 3" : undefined}
        style={{ cursor: "pointer", ...(edge.animated && { animation: "dashFlow 1s linear infinite" }) }}
        onClick={(e) => { e.stopPropagation(); dispatch({ type: "SELECT_EDGE", id: edge.id }); }} />
      <path
        d={`M${tx - 8},${ty - 5} L${tx},${ty} L${tx - 8},${ty + 5}`}
        fill="none" stroke={strokeColor} strokeWidth={strokeW}
        strokeLinecap="round" strokeLinejoin="round"
      />
      {edge.label && (
        <g onDoubleClick={(e) => { e.stopPropagation(); onEditRequest?.(); }}>
          <rect
            x={mid.x - (edge.label.length * 4.5 + 8)} y={mid.y - 20}
            width={edge.label.length * 9 + 16} height={18}
            rx={4} fill="#0f172a" stroke="#1e3a5f" strokeWidth={1}
          />
          <text x={mid.x} y={mid.y - 6} textAnchor="middle" fill="#60a5fa"
            fontSize={10} fontFamily="'JetBrains Mono', monospace"
            style={{ userSelect: "none" }}>
            {edge.label}
          </text>
        </g>
      )}
      <EdgeInsertMenu
        mid={edge.label ? { x: mid.x, y: mid.y + 10 } : mid}
        edgeId={edge.id}
        dispatch={dispatch}
      />
    </g>
  );
}