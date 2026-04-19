import { getNodeMeta } from "../../config/nodeTypes";

export function MiniMap({ nodes, viewport, canvasW, canvasH }) {
  const mapW = 100;
  const mapH = 70;

  if (nodes.length === 0) return null;

  const allX = nodes.flatMap((n) => [n.x, n.x + n.width]);
  const allY = nodes.flatMap((n) => [n.y, n.y + n.height]);
  const minX = Math.min(...allX) - 40;
  const minY = Math.min(...allY) - 40;
  const maxX = Math.max(...allX) + 40;
  const maxY = Math.max(...allY) + 40;
  const bw = maxX - minX;
  const bh = maxY - minY;

  const toMap = (cx, cy) => ({
    x: ((cx - minX) / bw) * mapW,
    y: ((cy - minY) / bh) * mapH,
  });

  const vpX = -viewport.x / viewport.zoom;
  const vpY = -viewport.y / viewport.zoom;
  const vpW = canvasW / viewport.zoom;
  const vpH = canvasH / viewport.zoom;
  const vp = toMap(vpX, vpY);
  const vpWm = (vpW / bw) * mapW;
  const vpHm = (vpH / bh) * mapH;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        right: 16,
        width: mapW,
        height: mapH,
        background: "#fffffffa",
        border: "1px solid #e0e5ee",
        borderRadius: 8,
        overflow: "hidden",
        zIndex: 100,
      }}
    >
      <svg width={mapW} height={mapH}>
        {nodes.map((n) => {
          const p = toMap(n.x, n.y);
          const w = (n.width / bw) * mapW;
          const h = (n.height / bh) * mapH;
          const meta = getNodeMeta(n.type);
          
          return (
            <rect
              key={n.id}
              x={p.x}
              y={p.y}
              width={Math.max(w, 4)}
              height={Math.max(h, 3)}
              rx={1.5}
              fill={meta.border}
              opacity={n.selected ? 1 : 0.6}
            />
          );
        })}
        <rect
          x={vp.x}
          y={vp.y}
          width={Math.max(vpWm, 4)}
          height={Math.max(vpHm, 4)}
          fill="none"
          stroke="#60a5fa"
          strokeWidth={1}
          rx={1}
          opacity={0.7}
        />
      </svg>
     
    </div>
  );
}
