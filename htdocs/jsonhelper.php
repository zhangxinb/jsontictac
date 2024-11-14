<?php
function jsonResponse($success, $message, $mid, $email = null) {
    $response = [
        "success" => $success,
        "message" => $message,
        "mid" => $mid,
    ];

    if ($email) {
        $response["email"] = $email;
    }

    echo json_encode($response);
}
?>
