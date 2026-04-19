import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Canvas } from "./components/Canvas/Canvas";
import { Sidebar } from "./components/Controls/Sidebar";
import { FlowProvider, useFlowStore } from "./store/flowStore";

function WorkflowEditor() {
  const { dispatch } = useFlowStore();
  const canvasRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.matches("input, textarea")) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        dispatch({ type: "DELETE_SELECTED" });
      }

      if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
        dispatch({ type: "COPY_SELECTED" });
      }

      if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
        dispatch({ type: "PASTE" });
      }

      if (e.key === "d" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        dispatch({ type: "DUPLICATE_SELECTED" });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  return (
    <div className={`editor-shell${sidebarCollapsed ? " is-sidebar-collapsed" : ""}`}>
      <Sidebar
        canvasRef={canvasRef}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />
      <Canvas canvasRef={canvasRef} />
    </div>
  );
}

export function App() {
  return (
    <FlowProvider>
      <WorkflowEditor />
    </FlowProvider>
  );
}

export default App;
