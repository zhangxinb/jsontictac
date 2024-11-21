<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type"); 
header("Access-Control-Allow-Credentials: true");

session_start();
require_once "dbsession.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $uidx = $data['uidx'];
    $uido = $data['uido'];
    $sizex = $data['sizex'];
    $sizey = $data['sizey'];

    $dcdb = getDbSes();
    if ($dcdb) {
        $insertGame = $dcdb->prepare("INSERT INTO game (uidx, uido, sizex, sizey) VALUES (:uidx, :uido, :sizex, :sizey)");
        $insertGame->bindValue(":uidx", $uidx);
        $insertGame->bindValue(":uido", $uido);
        $insertGame->bindValue(":sizex", $sizex);
        $insertGame->bindValue(":sizey", $sizey);
        if ($insertGame->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to insert game"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Database connection failed"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
}
?>