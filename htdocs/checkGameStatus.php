<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type"); 
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $gameId = (string)$_GET['gameId'] ?? null;
    
    if (!$gameId) {
        echo json_encode([
            'success' => false,
            'message' => 'Game ID not provided'
        ]);
        exit;
    }

    $gameId = (int)$gameId;
    
    if (!isset($_SESSION['games']) || !isset($_SESSION['games'][$gameId])) {
        echo json_encode([
            'success' => false,
            'message' => 'Game not found',
            'debug' => [
                'sessionExists' => isset($_SESSION),
                'gamesExists' => isset($_SESSION['games']),
                'gameIdType' => gettype($gameId),
                'gameIdValue' => $gameId,
                'availableGames' => array_keys($_SESSION['games'] ?? []),
                'sessionData' => $_SESSION
            ],
            "sessionID" => session_id(),
        ]);
        exit;
    }
    
    $game = $_SESSION['games'][$gameId];
    echo json_encode([
        'success' => true,
        'data' => [
            'board' => $game['board'],
            'currentTurn' => $game['currentTurn'],
            'playerX' => $game['playerX'],
            'playerO' => $game['playerO'],
            'status' => $game['status']
        ]
    ]);
}
?>