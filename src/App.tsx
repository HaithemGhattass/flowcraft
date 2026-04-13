import { useEffect } from "react";
import { FlowProvider, useFlowStore } from "./store/flowStore";
import { Canvas } from "./components/Canvas/Canvas";

function ReactFlowClone() {
  const { dispatch } = useFlowStore();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && !e.target.matches("input, textarea")) {
        dispatch({ type: "DELETE_SELECTED" });
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
      <div style={{ width: "100%", height: "520px", borderRadius: 12, overflow: "hidden", border: "1px solid #0d1a2e" }}>
        <ReactFlowClone />
      </div>
    </FlowProvider>
  );
}

export default App;
