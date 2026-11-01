// @ts-nocheck
/**
 * Semantic OSC only: { address, args }.
 * Dev connects on the same host as the page (`/osc`), which the Vite
 * server forwards to the local bridge. A raw :3000 socket is not
 * reachable from the live preview and would fail on every retry.
 * Production has no bridge, so it does not open a socket.
 */
export function connectOSC(onMessage) {
  if (!import.meta.env.DEV) return;
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const url = `${proto}://${location.host}/osc`;
  let retry = 1000;
  let ws;

  function schedule() {
    const wait = retry;
    retry = Math.min(8000, retry * 2);
    setTimeout(open, wait);
  }

  function open() {
    try {
      ws = new WebSocket(url);
    } catch {
      schedule();
      return;
    }
    ws.onopen = () => {
      retry = 1000;
    };
    ws.onmessage = (ev) => {
      try {
        onMessage(JSON.parse(ev.data));
      } catch { /* ignore */ }
    };
    ws.onclose = () => schedule();
    ws.onerror = () => {
      try { ws.close(); } catch { /* ignore */ }
    };
  }

  open();
}
