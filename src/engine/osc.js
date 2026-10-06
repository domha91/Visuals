// @ts-nocheck
export function connectOSC(onMessage) {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const url = `${proto}://${location.hostname}:3000`;
  let ws;
  let retry = 1000;

  function open() {
    try {
      ws = new WebSocket(url);
    } catch {
      setTimeout(open, retry);
      return;
    }
    ws.onmessage = (ev) => {
      try {
        onMessage(JSON.parse(ev.data));
      } catch { /* ignore */ }
    };
    ws.onclose = () => setTimeout(open, retry);
    ws.onerror = () => ws.close();
  }
  open();
}
