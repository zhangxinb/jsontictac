<?php
session_start();

$data = json_decode(file_get_contents('php://input'), true);
$inviter = $data['inviter'];
$invitee = $data['invitee'];

if (!isset($_SESSION['invitations'])) {
    $_SESSION['invitations'] = [];
}

if (!isset($_SESSION['invitations'][$invitee])) {
    $_SESSION['invitations'][$invitee] = [];
}

$_SESSION['invitations'][$invitee][] = $inviter;

echo json_encode(['status' => 'success']);
?>