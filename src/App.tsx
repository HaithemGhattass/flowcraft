import { useEffect } from "react";
import { FlowProvider, useFlowStore } from "./store/flowStore";
import { Canvas } from "./components/Canvas/Canvas";

function ReactFlowClone() {
  const { dispatch } = useFlowStore();

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.matches("input, textarea")) return;

      // delete
      if (e.key === "Delete" || e.key === "Backspace") {
        dispatch({ type: "DELETE_SELECTED" });
      }

      // copy — Ctrl+C / Cmd+C
      if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
        dispatch({ type: "COPY_SELECTED" });
      }

      // paste — Ctrl+V / Cmd+V
      if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
        dispatch({ type: "PASTE" });
      }

      // duplicate shortcut — Ctrl+D / Cmd+D
      if (e.key === "d" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); // prevent browser bookmark dialog
        dispatch({ type: "COPY_SELECTED" });
        dispatch({ type: "PASTE" });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  return <Canvas />;
}

export function App() {
  return (
    <FlowProvider>
      <div
        style={{
          width: "100%",
          height: "520px",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #0d1a2e",
        }}
      >
        <ReactFlowClone />
      </div>
    </FlowProvider>
  );
}

export default App;
