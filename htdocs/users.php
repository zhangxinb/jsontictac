<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

session_start();
require "jsonhelper.php";
require_once "dbsession.php";
$dcdb = getDbSes();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // 获取当前在线用户列表
    getUserList($dcdb);
} 
 else {
    jsonResponse(false, "Unsupported method", 405);
}

// 获取当前在线用户列表
function getUserList($dcdb) {
    try {
        // 查询数据库中的所有在线用户
        $query = $dcdb->prepare("
            SELECT u.uid, u.email, s.lastseen, s.gid
            FROM session s
            JOIN user u ON s.uid = u.uid
        ");
        $query->execute();

        $users = $query->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'users' => $users]);
    } catch (Exception $e) {
        error_log("Error fetching user list: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to fetch user list']);
    }
}


?>
