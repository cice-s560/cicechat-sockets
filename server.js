const WebSocket = require("ws");
const chalk = require("chalk");
const PORT = process.env.PORT || 5000;

const wss = new WebSocket.Server({ port: PORT });

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

function translateMessage(data) {
  data = JSON.parse(data);

  switch (data.type) {
    case "CONNECTION":
      wss.broadcast(
        JSON.stringify({ type: "USER_CONNECTED", payload: data.payload })
      );
      break;
    case "MESSAGE":
      wss.broadcast(
        JSON.stringify({ type: "MESSAGE_RECEIVED", payload: data.payload })
      );
      break;
  }
}

wss.on("connection", function connection(ws) {
  console.log(chalk.bgGreen("Conexion!"));

  ws.on("message", function incoming(message) {
    console.log(chalk.magenta("received:", message));
    translateMessage(message);
  });
});
