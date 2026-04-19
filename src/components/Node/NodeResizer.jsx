import { useRef, useCallback } from "react";

const HANDLES = [
  { id: "se", cursor: "se-resize", bottom: -4, right: -4 },
  { id: "sw", cursor: "sw-resize", bottom: -4, left: -4 },
  { id: "ne", cursor: "ne-resize", top: -4, right: -4 },
  { id: "nw", cursor: "nw-resize", top: -4, left: -4 },
];
export function NodeResizer({ node, viewport, dispatch }) {
  const resizing = useRef(null);
  const uiScale = Math.max(0.75, Math.min(viewport.zoom, 1.8));

  const onMouseDown = useCallback((e, handleId) => {
    e.stopPropagation();
    e.preventDefault();
    resizing.current = {
      handleId,
      startMX: e.clientX,
      startMY: e.clientY,
      startX: node.x,
      startY: node.y,
      startW: node.width,
      startH: node.height,
    };

    const onMouseMove = (e) => {
      if (!resizing.current) return;
      const { handleId, startMX, startMY, startX, startY, startW, startH } = resizing.current;

      // delta in canvas space
      const dx = (e.clientX - startMX) / viewport.zoom;
      const dy = (e.clientY - startMY) / viewport.zoom;

      let x = startX, y = startY, w = startW, h = startH;

      // horizontal
      if (handleId.includes("e")) w = Math.max(120, startW + dx);
      if (handleId.includes("w")) { w = Math.max(120, startW - dx); x = startX + (startW - w); }

      // vertical
      if (handleId.includes("s")) h = Math.max(40, startH + dy);
      if (handleId.includes("n")) { h = Math.max(40, startH - dy); y = startY + (startH - h); }

      dispatch({ type: "RESIZE_NODE", id: node.id, x, y, width: w, height: h });
    };

    const onMouseUp = () => {
      resizing.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [node, viewport.zoom, dispatch]);

  return (
    <>
      {HANDLES.map((h) => (
        <div
          key={h.id}
          onMouseDown={(e) => onMouseDown(e, h.id)}
          style={{
            position: "absolute",
            width: 9 * uiScale,
            height: 9 * uiScale,
            borderRadius: 999,
            background: "#ffffff",
            border: `${1.5 * uiScale}px solid #4f7cff`,
            cursor: h.cursor,
            zIndex: 30,
            ...(h.top    !== undefined && { top:    h.top    }),
            ...(h.bottom !== undefined && { bottom: h.bottom }),
            ...(h.left   !== undefined && { left:   h.left   }),
            ...(h.right  !== undefined && { right:  h.right  }),
            ...(h.transform            && { transform: h.transform }),
            boxShadow: `0 ${8 * uiScale}px ${18 * uiScale}px rgba(79, 124, 255, 0.16)`,
          }}
        />
      ))}
    </>
  );
}
