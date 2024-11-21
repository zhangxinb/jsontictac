const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let users = {}; // 存储在线用户
let games = {}; // 存储游戏状态

wss.on('connection', (ws) => {
  let currentUserId = null; // 保存当前连接用户的 uid

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('Received message:', data);

    switch (data.type) {
      case 'login':
        // 如果是登录请求，将用户加入到 users 对象中
        users[data.uid] = { ws, email: data.email };
        currentUserId = data.uid; // 保存当前用户的 id

        // 登录成功后，发送当前用户信息以及在线用户列表
        ws.send(JSON.stringify({
          type: 'loginSuccess',
          message: 'Login successful',
          currentUser: { uid: data.uid, email: data.email },
          users: Object.entries(users).map(([uid, user]) => ({ uid, email: user.email }))
        }));

        // 广播更新所有在线用户
        broadcastUpdateUsers();
        break;

      case 'startGame':
        // 开始游戏
        const gameId = `${data.uidx}-${data.uido}`;
        games[gameId] = {
          uidx: data.uidx,
          uido: data.uido,
          sizex: data.sizex,
          sizey: data.sizey,
          board: Array(data.sizex * data.sizey).fill(null),
        };

        // 通知对方玩家游戏已开始
        users[data.uido].ws.send(JSON.stringify({
          type: 'gameStarted',
          gameId,
          opponent: { uid: data.uidx, email: data.email }
        }));

        // 通知当前玩家游戏已开始
        ws.send(JSON.stringify({
          type: 'gameStarted',
          gameId,
          opponent: { uid: data.uido, email: users[data.uido].email }
        }));
        break;

      case 'makeMove':
        // 处理玩家移动
        const game = games[data.gameId];
        if (game) {
          game.board[data.index] = data.symbol;
          broadcast({ type: 'updateBoard', gameId: data.gameId, board: game.board });
        }
        break;

      case 'logout':
        // 用户登出时，从 users 中删除用户
        delete users[data.uid];
        broadcastUpdateUsers();
        break;

      default:
        break;
    }
  });

  ws.on('close', () => {
    if (currentUserId && users[currentUserId]) {
      // 连接关闭时，删除当前用户并广播更新用户列表
      delete users[currentUserId];
      broadcast({
        type: 'updateUsers',
        users: Object.entries(users).map(([uid, user]) => ({ uid, email: user.email }))
      });
    }
  });
});


// 广播给所有客户端
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
function broadcastUpdateUsers() {
  const userList = Object.entries(users).map(([uid, user]) => ({ uid, email: user.email }));
  Object.values(users).forEach(user => {
    user.ws.send(JSON.stringify({
      type: 'updateUsers',
      users: userList
    }));
  });
}

console.log('WebSocket server is running on ws://localhost:8080');
