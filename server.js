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

function translateMessage(data, socket) {
  data = JSON.parse(data);

  switch (data.type) {
    case "CONNECTION":
      // Identifico el socket en el servidor
      socket.userData = data.payload
      // Emito la conexión
      wss.broadcast(
        JSON.stringify({ type: "USER_CONNECTED", payload: data.payload })
      );
      break;
    case "MESSAGE":
      wss.broadcast(
        JSON.stringify({ type: "MESSAGE_RECEIVED", payload: data.payload })
      );
      break;
    case "USER_DISCONNECT":
      wss.broadcast(
        JSON.stringify({ type: "USER_DISCONNECTED", payload: data.payload })
      );
      break;
  }
}

wss.on("connection", function connection(ws) {
  console.log(chalk.bgGreen("Conexion!"));

  ws.on("message", function incoming(message) {
    console.log(chalk.magenta("received:", message));
    translateMessage(message, ws);
  });

  ws.on("close", function close(data){
    console.log(chalk.red("socket closed!", ws.userData));
    translateMessage(JSON.stringify({type: "USER_DISCONNECT", payload: ws.userData}));
  });
});
