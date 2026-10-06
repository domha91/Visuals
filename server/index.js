import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import osc from "osc";
import path from "path";
import { fileURLToPath } from "url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const OSC_PORT = Number(process.env.OSC_PORT || 57121);
const HTTP_PORT = Number(process.env.PORT || 3000);

const udp = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: OSC_PORT,
  metadata: true
});

function broadcast(obj) {
  const s = JSON.stringify(obj);
  for (const c of wss.clients) {
    if (c.readyState === 1) c.send(s);
  }
}

udp.on("message", (msg) => {
  broadcast({
    address: msg.address,
    args: (msg.args || []).map((a) => a.value)
  });
});

udp.on("error", (e) => console.warn("osc", e.message));
udp.open();

app.get("/health", (_req, res) => res.json({ ok: true, osc: OSC_PORT }));

server.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`OSC UDP ${OSC_PORT}  websocket :${HTTP_PORT}`);
});
