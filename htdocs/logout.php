<?php
// 设置错误报告
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS 头部设置
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// 处理 OPTIONS 请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON data');
        }

        $uid = $data['uid'] ?? null;

        if (!$uid) {
            throw new Exception('User ID is required');
        }

        if (isset($_SESSION['loggedInUsers'])) {
            $_SESSION['loggedInUsers'] = array_values(array_filter(
                $_SESSION['loggedInUsers'],
                function($user) use ($uid) {
                    return (int)$user['uid'] !== (int)$uid;
                }
            ));
        }

        // 清除session数据
        unset($_SESSION['uid']);
        unset($_SESSION['email']);
        unset($_SESSION['lastActivityTime']);
        unset($_SESSION['gameId']);
        
        // 确保响应被正确发送
        ob_clean(); // 清除任何输出缓冲
        echo json_encode([
            "status" => "success",
            "message" => "Logout successful",
            "remainingUsers" => $_SESSION['loggedInUsers'] ?? []
        ]);
        exit();

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
        exit();
    }
} else {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Method not allowed"
    ]);
}