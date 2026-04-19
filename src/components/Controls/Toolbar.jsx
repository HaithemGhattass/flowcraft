import { useFlowStore } from "../../store/flowStore";

function ActionButton({ label, title, disabled, onMouseDown }) {
  return (
    <button
      className="canvas-action"
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!disabled) onMouseDown?.();
      }}
    >
      {label}
    </button>
  );
}

export function Toolbar({ dispatch }) {
  const { state } = useFlowStore();
  const selectedNodes = state.nodes.filter((n) => n.selected);
  const hasSelection = selectedNodes.length > 0 || Boolean(state.selectedEdge);

  return (
    <div className="canvas-toolbar">
      <div className="canvas-toolbar__left">
        <ActionButton
          label="Copy"
          title="Copy selected nodes"
          disabled={selectedNodes.length === 0}
          onMouseDown={() => dispatch({ type: "COPY_SELECTED" })}
        />
        <ActionButton
          label="Paste"
          title="Paste copied nodes"
          disabled={!state.clipboard}
          onMouseDown={() => dispatch({ type: "PASTE" })}
        />
        <ActionButton
          label="Duplicate"
          title="Duplicate selected nodes"
          disabled={selectedNodes.length === 0}
          onMouseDown={() => dispatch({ type: "DUPLICATE_SELECTED" })}
        />
        <ActionButton
          label="Delete"
          title="Delete selected nodes or edge"
          disabled={!hasSelection}
          onMouseDown={() => dispatch({ type: "DELETE_SELECTED" })}
        />
      </div>

      <button
        className={`run-workflow-button${state.isRunning ? " is-running" : ""}`}
        type="button"
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          dispatch({ type: "TOGGLE_RUN_STATE" });
        }}
      >
        <span className="run-workflow-button__icon">{state.isRunning ? "■" : "▷"}</span>
        <span>{state.isRunning ? "Running..." : "Run Workflow"}</span>
      </button>
    </div>
  );
}
