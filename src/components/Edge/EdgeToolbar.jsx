import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";


export const EdgeToolbar = forwardRef(function EdgeToolbar({ edge, mid, viewport, dispatch }, ref) {
    const [editing, setEditing] = useState(false);
    const [label, setLabel] = useState(edge.label ?? "");
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => ({
        triggerEdit: () => setEditing(true),
    }));

    useEffect(() => { setLabel(edge.label ?? ""); }, [edge.label]);


    // focus input whenever editing becomes true
    useEffect(() => {
        if (editing) {
            const t = setTimeout(() => inputRef.current?.focus(), 0);
            return () => clearTimeout(t);
        }
    }, [editing]);

    const commitEdit = () => {
        setEditing(false);
        dispatch({ type: "RENAME_EDGE", id: edge.id, label });
    };

    const sx = mid.x * viewport.zoom + viewport.x;
    const sy = mid.y * viewport.zoom + viewport.y;

    const btnBase = {
        height: 24,
        padding: "0 10px",
        background: "#0a1628",
        border: "1px solid #1e3a5f",
        borderRadius: 5,
        fontSize: 10,
        fontFamily: "'JetBrains Mono', monospace",
        cursor: "pointer",
        letterSpacing: "0.04em",
        transition: "all 0.1s",
        display: "flex",
        alignItems: "center",
        userSelect: "none",
        whiteSpace: "nowrap",
    };

    return (
        <div
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
                position: "absolute",
                left: sx,
                top: sy + 16,
                transform: "translateX(-50%)",
                display: "flex",
                gap: 4,
                background: "#0a1628",
                border: "1px solid #1e3a5f",
                borderRadius: 8,
                padding: "5px 6px",
                zIndex: 200,
                boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
                pointerEvents: "all",
            }}
        >
            {editing ? (
                <input
                    ref={inputRef}
                    value={label}
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
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        height: 24,
                        width: 120,
                        background: "#0f172a",
                        border: "1px solid #3b82f6",
                        borderRadius: 5,
                        color: "#93c5fd",
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                        textAlign: "center",
                        outline: "none",
                        padding: "0 6px",
                    }}
                />
            ) : (
                <>
                    <button
                        style={{ ...btnBase, color: "#93c5fd" }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault(); // ← prevent blur stealing focus from canvas
                            setEditing(true);
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#132035"; e.currentTarget.style.borderColor = "#3b82f6"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#0a1628"; e.currentTarget.style.borderColor = "#1e3a5f"; }}
                    >
                        ✎ {edge.label ? "rename" : "add label"}
                    </button>

                    {edge.label && (
                        <button
                            style={{ ...btnBase, color: "#9ca3af" }}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                dispatch({ type: "RENAME_EDGE", id: edge.id, label: "" });
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#132035"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#0a1628"; }}
                        >
                            ⌫ clear
                        </button>
                    )}

                    <button
                        style={{ ...btnBase, color: "#a78bfa" }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            dispatch({ type: "TOGGLE_EDGE_ANIMATED", id: edge.id });
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#132035"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#0a1628"; }}
                    >
                        ⟳ {edge.animated ? "static" : "animate"}
                    </button>

                    <button
                        style={{ ...btnBase, color: "#f87171", borderColor: "#2d1515" }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            dispatch({ type: "DELETE_EDGE", id: edge.id });
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#1f0505"; e.currentTarget.style.borderColor = "#7f1d1d"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#0a1628"; e.currentTarget.style.borderColor = "#2d1515"; }}
                    >
                        ✕ delete
                    </button>
                </>
            )}
        </div>
    );
})