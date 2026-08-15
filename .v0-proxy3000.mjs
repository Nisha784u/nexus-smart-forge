import net from "node:net";

const LISTEN = 3000;
const TARGET_HOST = "127.0.0.1";
const TARGET_PORT = 8080;

const server = net.createServer((client) => {
  const upstream = net.connect(TARGET_PORT, TARGET_HOST);
  client.pipe(upstream);
  upstream.pipe(client);
  const cleanup = () => {
    client.destroy();
    upstream.destroy();
  };
  client.on("error", cleanup);
  upstream.on("error", cleanup);
});

server.listen(LISTEN, "0.0.0.0", () => {
  console.log(`TCP proxy listening on ${LISTEN} -> ${TARGET_HOST}:${TARGET_PORT}`);
});
