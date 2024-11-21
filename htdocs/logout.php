<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type"); 
header("Access-Control-Allow-Credentials: true");

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $uid = $_SESSION['uid'];

    if (isset($_SESSION['loggedInUsers'])) {
        $_SESSION['loggedInUsers'] = array_filter($_SESSION['loggedInUsers'], function($user) use ($uid) {
            return $user['uid'] !== $uid;
        });
    }
    unset($_SESSION['uid']);
    unset($_SESSION['email']);
    unset($_SESSION['lastActivityTime']);
    unset($_SESSION['lastDbUpdateTime']);
    unset($_SESSION['lastCallTime']);

    echo json_encode(["status" => "success", "message" => "Logout successful"]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
}
?>