const net = require("node:net");
const readline = require('readline');
const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


// サーバープログラム上で入力を可能にする
function getCli(socket) {
  terminal.question(">>> ", function (input) {
    if (input.length > 0) {
      if (input === "exit") {
        socket.destroy();
      } else {
        socket.write(input);
      }
    }
  })
}


const queue = 1;

// コマンドライン引数を取得
// サーバー起動時のオプションに使用する
const parameters = process.argv;
if (parameters.length !== 4) {
  console.log("正しい引数を指定してください");
  process.exit(-1);
}

// listenするIPアドレス
const specifyHost = parameters[2];
// listenするポート番号
const specifyPort = parseInt(parameters[3]);

// Make a socket server.
const server = new net.Server();

// アドレスの bind とポートの listenを listen()メソッドが
// 一括で行う
server.listen(specifyPort, specifyHost, queue, (server) => {
  console.log("サーバーを起動しました");
});


// 接続を許可されたSocketのみを保持するMapオブジェクト
const allowedSocket = new Map();
// Socketのacceptをconnectionイベントで受け取る
server.on("connection", function (socket) {

  // 本サーバーに接続してきたクライアントの情報を取得
  const sourceAddress = socket.remoteAddress;
  const sourcePort = socket.remotePort;
  const clientKey = sourceAddress + ":" + sourcePort;

  console.log(`[通知]: ${sourceAddress}:${sourcePort} が接続してきました`);

  // 接続してきたクライアントの初回メッセージを一旦取得
  socket.on("data", function (data) {

    // 当該サーバーに接続できるクライアントは1つのみ
    if (allowedSocket.size !== 0 && allowedSocket.has(clientKey) !== true) {
      socket.write("現在サーバーは満員です またのご利用をお待ちしております");
      socket = socket.destroy();
      if (socket.destroyed) {
        console.log(`[通知]: ${sourceAddress}:${sourcePort} の接続を拒否しました.`);
      }
    }


    if (allowedSocket.has(clientKey)) {
      console.log("以下発言は,許可されたクライアントのメッセージです");
      console.log(data.toString());
    } else {
      if (data.toString() === "妥当な接続") {
        // 接続してきたクライアントに対して,接続完了メッセージを送信
        socket.write(">>>接続完了");
        allowedSocket.set(clientKey, socket);
        // 接続が許可された場合は,サーバー側も入力を可能にする
        getCli(socket)
      } else {
        // 接続クライアントを拒否したい場合
        const destroyedSocket = socket.destroy();
        if (destroyedSocket.destroyed) {
          console.log(`[通知]: ${sourceAddress}:${sourcePort} の接続を拒否しました.`);
        }
      }
    }
  });
});
