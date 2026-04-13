import { utils } from "../../utils/utils";
import { EdgeLabel } from "./EdgeLabel";

export function FlowEdge({ edge, nodes, viewport, selectedEdge, dispatch, onEditRequest }) {
  const source = nodes.find((n) => n.id === edge.source);
  const target = nodes.find((n) => n.id === edge.target);
  if (!source || !target) return null;

  const sx = source.x + source.width;
  const sy = source.y + source.height / 2;
  const tx = target.x;
  const ty = target.y + target.height / 2;
  const d = utils.bezierPath(sx, sy, tx, ty);

  const isSelected = selectedEdge === edge.id;
  const strokeColor = isSelected ? "#60a5fa" : "#374151";
  const strokeW = isSelected ? 2 : 1.5;
  const mid = { x: (sx + tx) / 2, y: (sy + ty) / 2 };

  return (
    <g
      style={{ cursor: "pointer" }}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {/* edge path — click to select */}
      <path
        d={d}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        style={{ cursor: "pointer" }} // ← add

        onClick={(e) => { e.stopPropagation(); dispatch({ type: "SELECT_EDGE", id: edge.id }); }}
      />
      <path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeDasharray={edge.animated ? "6 3" : undefined}
        style={{ cursor: "pointer", ...(edge.animated && { animation: "dashFlow 1s linear infinite" }) }} // ← add cursor

        onClick={(e) => { e.stopPropagation(); dispatch({ type: "SELECT_EDGE", id: edge.id }); }}
      />
      <path
        d={`M${tx - 8},${ty - 5} L${tx},${ty} L${tx - 8},${ty + 5}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* label — always shown, interactive */}
      <EdgeLabel
        edge={edge}
        mid={mid}
        onEditRequest={onEditRequest}
      />

    </g>
  );
}