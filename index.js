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

let busy = false;

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
  console.log(
    new Date() +
      " Recieved a new connection from origin " +
      request.origin +
      "."
  );

  //Aceitar a conexao
  const connection = request.accept(null, request.origin);
  clients[userId] = connection;
  console.log(
    "connected: " + userId + " in " + Object.getOwnPropertyNames(clients)
  );

  connection.on("message", function (message) {
    if (message.utf8Data === "stop-conference") {
      clients = removeUser(clients, userId);
      busy = false;
      console.log("\n***Someone stopped a conference***\n");
    } else if (objIsEmpty(clients)) {
      busy = false;
    }
    //Controle de fila de usuários
    for (key in clients) {
      if (!busy) {
        busy = true;
        clients[key].sendUTF("start-conference");
        console.log(
          "\n***This client started a conference: " + clients[key] + "***\n"
        );
      }
    }
  });
});

// Cliente manda uma mensagem, uma string "connect-me"
// A partir dai ele esta na fila para receber a mensagem "start-conference"
// Quando sair da conferencia o cliente deve mandar "stop-conference"
