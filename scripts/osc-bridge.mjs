/**
 * Quiet WebSocket on :3000 so the ornamental engine can listen for
 * semantic OSC without a failed-socket error when no bridge is up.
 * Forwards nothing until a client sends a text frame. The live UDP
 * bridge replaces this process when it owns the port.
 */
import http from "node:http";
import crypto from "node:crypto";

const port = Number(process.env.OSC_WS_PORT || 3000);

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end('{"ok":true}');
    return;
  }
  res.writeHead(404);
  res.end();
});

server.on("upgrade", (req, socket) => {
  const key = req.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }
  const accept = crypto
    .createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\n" +
      "Upgrade: websocket\r\n" +
      "Connection: Upgrade\r\n" +
      `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );
  socket.on("error", () => {});
});

server.listen(port, "0.0.0.0");
