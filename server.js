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

function broadcastMessage(data) {
  const payload = data.payload;
  switch (data.type) {
    case "CONNECTION":
      wss.broadcast(packData("USER_CONNECTED", payload));
      break;
    case "MESSAGE":
      wss.broadcast(packData("MESSAGE_RECEIVED", payload));
      break;
    case 'CONNECTION_CLOSED':
      wss.broadcast(packData("USER_DISCONNECTED", payload));
  }
}

wss.on("connection", function connection(ws) {
  log("New connection established", 'bgGreen');
  let username;
  ws.on("message", function incoming(message) {
    message = JSON.parse(message);
    if (message.type === 'CONNECTION') {
      username = message.payload.username;
      log(`${ username } says hello`, 'magenta');
    } else {
      log(`New message from ${ username }`, 'magenta');
    }
    broadcastMessage(message);
  });
  ws.on('close', () => {
    log(`${ username } disconnected`, 'bgRed');
    broadcastMessage({
      type: 'CONNECTION_CLOSED',
      payload: { username }
    });
  });
});

function log(data, colour) {
  if (!chalk[colour]) {
    return console.log(`> ${ new Date().toISOString() }: ${ data }`);
  }
  console.log(chalk[colour](`> ${ new Date().toISOString() }: ${data} `));
}

function packData(type, payload) {
  return JSON.stringify({ type, payload });
}
