import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export const EdgeToolbar = forwardRef(function EdgeToolbar({ edge, mid, viewport, dispatch }, ref) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(edge.label ?? "");
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    triggerEdit: () => setEditing(true),
  }));

  useEffect(() => {
    setLabel(edge.label ?? "");
  }, [edge.label]);

  useEffect(() => {
    if (!editing) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [editing]);

  const commitEdit = () => {
    setEditing(false);
    dispatch({ type: "RENAME_EDGE", id: edge.id, label });
  };

  const sx = mid.x * viewport.zoom + viewport.x;
  const sy = mid.y * viewport.zoom + viewport.y;
  const uiScale = Math.max(0.72, Math.min(viewport.zoom, 1.3));

  return (
    <div
      className="edge-toolbar"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        left: sx,
        top: sy + 18,
        transform: `translateX(-50%) scale(${uiScale})`,
      }}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={label}
          className="edge-toolbar__input"
          onChange={(e) => setLabel(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") {
              setLabel(edge.label ?? "");
              setEditing(false);
            }
          }}
        />
      ) : (
        <>
          <button type="button" className="edge-toolbar__button" onMouseDown={() => setEditing(true)}>
            {edge.label ? "Rename" : "Add Label"}
          </button>
          {edge.label && (
            <button
              type="button"
              className="edge-toolbar__button"
              onMouseDown={() => dispatch({ type: "RENAME_EDGE", id: edge.id, label: "" })}
            >
              Clear
            </button>
          )}
          <button
            type="button"
            className="edge-toolbar__button"
            onMouseDown={() => dispatch({ type: "TOGGLE_EDGE_ANIMATED", id: edge.id })}
          >
            {edge.animated ? "Static" : "Animate"}
          </button>
          <button
            type="button"
            className="edge-toolbar__button is-danger"
            onMouseDown={() => dispatch({ type: "DELETE_EDGE", id: edge.id })}
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
});
