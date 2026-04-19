import { PALETTE_NODE_TYPES, getNodeMeta } from "../../config/nodeTypes";
import { useFlowStore } from "../../store/flowStore";
import { utils } from "../../utils/utils";

function PaletteCard({ meta, onAdd, collapsed }) {
  return (
    <button
      className="palette-card"
      draggable
      onClick={() => onAdd(meta.type)}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData("application/flowcraft-node", meta.type);
      }}
      title={collapsed ? meta.label : undefined}
    >
      <span
        className="palette-card__icon"
        style={{
          color: meta.accent,
          background: meta.tint,
          borderColor: meta.border,
        }}
      >
        {meta.glyph}
      </span>
      {!collapsed && (
        <>
          <span className="palette-card__content">
            <span className="palette-card__label">{meta.label}</span>
            <span className="palette-card__desc">{meta.description}</span>
          </span>
          <span className="palette-card__grab">⋮⋮</span>
        </>
      )}
    </button>
  );
}

export function Sidebar({ canvasRef, collapsed = false, onToggle }) {
  const { state, dispatch } = useFlowStore();

  const addNodeFromPalette = (nodeType) => {
    const meta = getNodeMeta(nodeType);
    const rect = canvasRef.current?.getBoundingClientRect();
    const fallback = { width: 960, height: 720 };
    const width = rect?.width ?? fallback.width;
    const height = rect?.height ?? fallback.height;
    const x = width * 0.34;
    const y = height * 0.24;
    const canvasPoint = utils.screenToCanvas(x, y, state.viewport);

    dispatch({
      type: "ADD_NODE_FROM_PALETTE",
      nodeType,
      label: meta.label,
      x: canvasPoint.x - meta.defaultWidth / 2,
      y: canvasPoint.y - meta.defaultHeight / 2,
    });
  };

  return (
    <aside className={`editor-sidebar${collapsed ? " is-collapsed" : ""}`}>
      <div className="editor-sidebar__header">
        <div className="editor-sidebar__header-row">
          <div className="editor-sidebar__brand">
            {!collapsed && (
              <div>
                <div className="editor-sidebar__title">Workflow Editor</div>
                <div className="editor-sidebar__subtitle">Build and connect workflow steps</div>
              </div>
            )}
          </div>
          <button className="editor-sidebar__toggle" type="button" onClick={onToggle}>
            {collapsed ? "›" : "‹"}
          </button>
        </div>
      </div>

      <div className="editor-sidebar__section">
        {PALETTE_NODE_TYPES.map((nodeType) => {
          const meta = getNodeMeta(nodeType);
          return <PaletteCard key={nodeType} meta={meta} onAdd={addNodeFromPalette} collapsed={collapsed} />;
        })}
      </div>

      <div className="editor-sidebar__footer">
        <button className="settings-link" type="button">
          <span className="settings-link__icon">⟲</span>
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
}
