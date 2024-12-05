<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $gameId = $data['gameId'] ?? null;
    $x = $data['x'] ?? null;
    $y = $data['y'] ?? null;
    $player = $data['player'] ?? null;

    // 验证游戏是否存在
    if (!isset($_SESSION['games'][$gameId])) {
        echo json_encode([
            'success' => false,
            'message' => '游戏不存在'
        ]);
        exit;
    }

    $game = &$_SESSION['games'][$gameId];
    
    // 初始化游戏数据（如果需要）
    if (!isset($game['board'])) {
        $game['board'] = array_fill(0, 9, null);
    }
    if (!isset($game['currentTurn'])) {
        $game['currentTurn'] = $game['playerX'];
    }

    $position = $y * 3 + $x;

    // 检查是否是玩家的回合
    if ($game['currentTurn'] !== $player) {
        echo json_encode([
            'success' => false,
            'message' => '不是你的回合'
        ]);
        exit;
    }

    // 检查位置是否已被占用
    if ($game['board'][$position] !== null) {
        echo json_encode([
            'success' => false,
            'message' => '该位置已被占用'
        ]);
        exit;
    }

    // 更新棋盘
    $symbol = ($player === $game['playerX']) ? 'X' : 'O';
    $game['board'][$position] = $symbol;
    
    // 切换回合
    $game['currentTurn'] = ($player === $game['playerX']) ? $game['playerO'] : $game['playerX'];
    
    // 检查游戏是否结束
    $winner = checkWinner($game['board']);
    if ($winner) {
        $game['status'] = 'completed';
        $game['winner'] = $winner;
        echo json_encode([
            'success' => true,
            'board' => $game['board'],
            'status' => 'completed',
            'winner' => $winner,
            'nextTurn' => null
        ]);
    } else if (!in_array(null, $game['board'])) {
        $game['status'] = 'draw';
        echo json_encode([
            'success' => true,
            'board' => $game['board'],
            'status' => 'draw',
            'winner' => null,
            'nextTurn' => null
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'board' => $game['board'],
            'status' => 'active',
            'nextTurn' => $game['currentTurn']
        ]);
    }
}

function checkWinner($board) {
    $lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横向
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // 纵向
        [0, 4, 8], [2, 4, 6] // 对角线
    ];

    foreach ($lines as $line) {
        [$a, $b, $c] = $line;
        if ($board[$a] && $board[$a] === $board[$b] && $board[$a] === $board[$c]) {
            return $board[$a];
        }
    }
    return null;
}
?>