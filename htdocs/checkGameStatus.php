<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type"); 
header("Access-Control-Allow-Credentials: true");

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_SESSION['gameId']) && isset($_SESSION['gameStatus']) && $_SESSION['gameStatus'] === 'inProgress') {
        $opponent = $_SESSION['opponent'];
        echo json_encode(["status" => "inProgress", "opponent" => $opponent]);
    } else {
        echo json_encode(["status" => "waiting"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
}
?>