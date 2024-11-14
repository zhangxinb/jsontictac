<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type"); 
header("Access-Control-Allow-Credentials: true");

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $email = $_SESSION['email'];

    if (isset($_SESSION['loggedInUsers'])) {
        $_SESSION['loggedInUsers'] = array_filter($_SESSION['loggedInUsers'], function($user) use ($email) {
            return $user !== $email;
        });
    }
    session_unset();
    session_destroy();

    echo json_encode(["status" => "success", "message" => "Logout successful"]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
}
?>