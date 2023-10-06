const net = require("net");


const server = new net.Server();


server.on("close", function (data) {
  console.log("close");
})

const acceptedSockets = new Map();
const socketNames = new Map();
server.on("connection", function (socket) {
  socket.write("コネクション成功");
  // 接続してきたSocketクライアントの情報をここで取得
  const port = socket.remotePort;
  const address = socket.remoteAddress;
  const clientKey = address + ":" + port;

  if (acceptedSockets.has(clientKey) !== true) {
    // 初回接続クライアントの場合,受付済みSocket一覧に保持する
    acceptedSockets.set(clientKey, socket);
  }
  socket.on("data", function (data) {

    // クライアントツール上で最初に入力した内容を当該のクライアント名として保存する
    if (socketNames.has(clientKey) !== true) {
      socketNames.set(clientKey, data);
      data = data + "さんが入室しました";
    } else {
      const speaker = socketNames.get(clientKey);
      data = "[" + speaker + "さん]" + data;
    }
    // 受信したメッセージを発信者以外のSocketに配信する
    acceptedSockets.forEach(function (value, index) {
      if (index !== clientKey) {
        value.write(data);
      }
    });
    console.log(data.toString());
  });
  console.log(acceptedSockets);
})
server.on("error", function (error) {
  console.log("error");
  console.log(error);
})
server.listen(51000, "192.168.0.16", 256, (server) => {
  console.log(2);
  console.log(server);
})

server.on("data", (data) => {
  console.log(data);
})
