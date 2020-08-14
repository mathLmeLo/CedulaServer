const webSocketsServerPort = 8000;
const webSocketsServer = require("websocket").server;
const http = require("http");

const server = http.createServer();
server.listen(webSocketsServerPort);
console.log("listening on port 8000");

const wsServer = new webSocketsServer({
  httpServer: server,
});

const clients = {};
const userQueue = [
  {
    id: "Vazio",
    name: "Vazio",
  },
];

function getNextVoter() {
  if (userQueue.length > 1) userQueue = userQueue.slice(1);
}

function addUserToQueue(user) {
  userQueue.push(user);
}

function objIsEmpty(obj) {
  if (Object.keys(obj).length === 0 && obj.constructor === Object) {
    return true;
  } else {
    return false;
  }
}

function removeUser(obj, target) {
  const clients = Object.keys(obj).reduce((object, key) => {
    if (key !== target) {
      object[key] = car[key];
    }
    return object;
  }, {});
  return clients;
}

// Função para gerar userId unico para cada usuario;
const getUniqueID = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return s4() + s4() + "-" + s4();
};

wsServer.on("request", function (request) {
  let userId = getUniqueID();
  // console.log(
  //   new Date() +
  //     " Recieved a new connection from origin " +
  //     request.origin +
  //     "."
  // );
  console.log("ALGUEM CONECTOU");

  //Aceitar a conexao
  const connection = request.accept(null, request.origin);
  clients[userId] = connection;
  // console.log(
  //   "connected: " + userId + " in " + Object.getOwnPropertyNames(clients)
  // );

  connection.on("message", function (msg) {
    message = JSON.parse(msg.data);
    switch (message.type) {
      case "enter-queue":
        addUserToQueue(message.data);
        console.log(`\n\n***Tentando Entrar ${message.data}***\n\n`);
        break;
      case "move-queue":
        getNextVoter();
        for (key in clients) {
          clients[key].send(
            JSON.stringify({
              type: "new-current-user",
              id: userQueue[0].id,
              name: userQueue[0].name,
            })
          );
        }
        break;
      case "get-head-of-queue":
        for (key in clients) {
          clients[key].send(
            JSON.stringify({
              type: "new-current-user",
              id: userQueue[0].id,
              name: userQueue[0].name,
            })
          );
        }
        break;
      case "get-lenght-of-queue":
        for (key in clients) {
          clients[key].send(
            JSON.stringify({
              type: "lenght-of-queue",
              value: userQueue.lenght,
            })
          );
        }
        break;
      case "set-sessionId":
        for (key in clients) {
          clients[key].send(
            JSON.stringify({
              type: "your-sessionId",
              value: message.data,
            })
          );
        }
        break;
      default:
    }
  });
});
