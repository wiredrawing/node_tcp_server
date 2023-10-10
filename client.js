const net = require('net');
// 接続先Socketへ説j族する
const client = new net.Socket()
client.connect(51000, "192.168.0.16");

// サーバーへ接続が完了した際のイベント
client.on("connect", function (data) {
  console.log("Completed connection to the server.");
  console.log(data);
});

let userName = "";
// 自身の名前が入力されるまで繰り返す
// 初回入力時,自身のユーザー名を入力させる.
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
/**
 * クライアントプログラム実行直後はユーザー名を
 * 正しく入力させる
 */
function getCli() {
  readline.question('あなたのお名前を入力して下さい:  ', (answer) => {
    if (answer.length > 0) {
      // readline.close();
      // Send my name to server.
      client.write((answer));
      // ユーザー名が正しく入力できたらサーバーとの会話を開始する
      interactionToServer();
    } else {
      // 再帰実行
      return getCli();
    }
  });
}

function interactionToServer() {

  readline.question('>> ', (answer) => {

    if (answer.length > 0) {
      // readline.close();
      // Send my name to server.
      client.write((answer));
    }
    interactionToServer();
  });

}

getCli();


client.on("data", (data) => {
  console.log("サーバーからのデータを受信");
  console.log(data.toString());
  interactionToServer();
});
