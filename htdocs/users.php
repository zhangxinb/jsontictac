<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type"); 
header("Access-Control-Allow-Credentials: true");

session_start();

if (!isset($_SESSION["uid"])) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit();
}

$response = [
    "success" => true,
    "users" => isset($_SESSION['loggedInUsers']) ? $_SESSION['loggedInUsers'] : []
];

echo json_encode($response);
?>