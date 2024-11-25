const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let users = {}; // 在线用户
let games = {}; // 游戏状态

wss.on('connection', (ws) => {
  let currentUserId = null; // 当前用户 ID

  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    console.log('Received message:', data);

    switch (data.type) {
      case 'login': {
        // 用户登录
        users[data.uid] = { ws, email: data.email };
        currentUserId = data.uid;

        // 发送登录成功信息
        ws.send(
          JSON.stringify({
            type: 'loginSuccess',
            message: 'Login successful',
            currentUser: { uid: data.uid, email: data.email },
            users: Object.entries(users).map(([uid, user]) => ({
              uid,
              email: user.email,
            })),
          })
        );

        // 广播更新用户列表
        broadcastUpdateUsers();
        break;
      }

      case 'startGame': {
        // 创建游戏，调用 PHP API 写入数据库
        const { uidx, uido, sizex, sizey, playerX, playerO } = data;
        try {
          const response = await fetch('http://localhost:12380/startGame.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uidx, uido, sizex, sizey }),
          });
          const result = await response.json();

          if (result.success) {
            const gameId = result.gameId;
            console.log(gameId);

            games[gameId] = {
              uidx,
              uido,
              sizex,
              sizey,
              playerX,
              playerO,
              board: Array(sizex * sizey).fill(null),
              currentPlayer: uidx,
            };

            // 通知两名玩家游戏已开始
            [uidx, uido].forEach((uid) => {
              if (users[uid] && users[uid].ws.readyState === WebSocket.OPEN) {
                users[uid].ws.send(
                  JSON.stringify({
                    type: 'gameStarted',
                    gameId,
                    playerX: uidx,
                    playerO: uido,
                    opponent: {
                      uid: uid === uidx ? uido : uidx,
                      email: users[uid === uidx ? uido : uidx].email,
                    },
                  })
                );
              }
            });
          } else {
            // PHP 返回失败时，通知发起者
            ws.send(
              JSON.stringify({
                type: 'error',
                message: result.message || 'Failed to start game',
              })
            );
          }
        } catch (error) {
          console.error('Error starting game:', error);
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Server error while starting game',
            })
          );
        }
        break;
      }

      case 'makeMove': {
        const { gameId, x, y, player } = data; // 解构客户端发来的数据
        console.log(`Received move for gameId: ${gameId}`);
        const game = games[gameId];

        console.log(`Received move for gameId: ${gameId}`);
      
        if (!game) {
          ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
          return;
        }


      
        const index = y * game.sizex + x; // 根据 x, y 计算在一维数组中的索引
      
        // 检查该位置是否有效
        if (index < 0 || index >= game.board.length || game.board[index] !== null) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
          return;
        }
      
        // 更新棋盘
        game.board[index] = player;
        //game.currentPlayer = game.currentPlayer === game.uidx ? game.uidx : game.uido;
      
        [game.uidx, game.uido].forEach(playerId => {
          if (users[playerId]) {
            users[playerId].ws.send(JSON.stringify({
              type: 'updateBoard',
              gameId,
              //currentPlayer: game.currentPlayer,
              board: game.board,
            }));
          }
        });
        break;
      }

      case 'logout': {
        // 用户登出
        delete users[data.uid];
        broadcastUpdateUsers();
        break;
      }

      default: {
        console.log('Unknown message type:', data.type);
        break;
      }
    }
  });

  ws.on('close', () => {
    // 连接关闭时，删除用户
    if (currentUserId && users[currentUserId]) {
      delete users[currentUserId];
      broadcastUpdateUsers();
    }
  });
});

// 广播给指定玩家或全体
function broadcast(data, recipients = null) {
  if (recipients) {
    recipients.forEach((uid) => {
      if (users[uid] && users[uid].ws.readyState === WebSocket.OPEN) {
        users[uid].ws.send(JSON.stringify(data));
      }
    });
  } else {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

// 广播更新用户列表
function broadcastUpdateUsers() {
  const userList = Object.entries(users).map(([uid, user]) => ({
    uid,
    email: user.email,
  }));
  Object.values(users).forEach((user) => {
    user.ws.send(
      JSON.stringify({
        type: 'updateUsers',
        users: userList,
      })
    );
  });
}

console.log('WebSocket server is running on ws://localhost:8080');
