import { useCallback } from "react";

export function useConnect(dispatch) {
  const startConnect = useCallback(
    (e, nodeId, handleType, ax, ay) => {
      e.stopPropagation();
      dispatch({ type: "START_CONNECT", connecting: { nodeId, handleType, mx: ax, my: ay } });
    },
    [dispatch]
  );

  const finishConnect = useCallback(
    (nodeId) => {
      dispatch({ type: "FINISH_CONNECT", nodeId });
    },
    [dispatch]
  );

  const cancelConnect = useCallback(() => {
    dispatch({ type: "CANCEL_CONNECT" });
  }, [dispatch]);

  return { startConnect, finishConnect, cancelConnect };
}
