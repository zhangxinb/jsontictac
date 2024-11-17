<?php
function jsonResponse($success, $message, $mid, $email = null) {
    $response = [
        "success" => $success,
        "message" => $message,
        "mid" => $mid,
    ];

    if ($email) {
        $response["user"] = $email;
    }

    echo json_encode($response);
}
?>
