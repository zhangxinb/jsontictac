<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type"); 
header("Access-Control-Allow-Credentials: true");

session_start();
require "dbsession.php";

$dcdb = getDbSes();
if ($dcdb) {
    $selectSessions = $dcdb->prepare("SELECT s.uid, s.lastseen, s.gid, u.email FROM session s JOIN user u ON s.uid = u.uid");
    if ($selectSessions->execute()) {
        $sessions = $selectSessions->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['users' => $sessions]);
    } else {
        echo json_encode(['users' => []]);
    }
} else {
    echo json_encode(['users' => []]);
}
?>