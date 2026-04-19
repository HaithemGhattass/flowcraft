export function StatusBar({ state }) {
  const selectedCount = state.nodes.filter((n) => n.selected).length;

  return (
    <div className="control-dock__stats">
      <span className="control-dock__stat">
        <strong>{state.nodes.length}</strong>
        <span>nodes</span>
      </span>
      <span className="control-dock__stat">
        <strong>{state.edges.length}</strong>
        <span>edges</span>
      </span>
      <span className="control-dock__stat">
        <strong>{selectedCount}</strong>
        <span>selected</span>
      </span>
    </div>
  );
}
