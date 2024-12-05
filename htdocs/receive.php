<?PHP
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type"); 
header("Access-Control-Allow-Credentials: true");
/*
	When this .php activates one should already have a session.

	With some heavy use of JSON this could also be the only "endpoint" (the only PHP-file in 		htdocs!). Done like that this file would conditionally include whatever other .php files
	are needed from outside htdocs, where they are one step away from "leaking" to the world
	(suppose, as an example, an Apache update disabling the php plugin or files under htdocs
	becoming available via some other mechanism?)

	A "central switch" like this needs also to be implemented for platforms which do not have a
	session cookie by default, but PHP does have one.
*/
session_start();
require_once "sessioncheck.php";
require_once "dbsession.php";

$inactive = 900; // 15mins
if (isset($_SESSION['lastActivityTime']) && (time() - $_SESSION['lastActivityTime']) > $inactive) {
    session_unset();
    session_destroy();
    echo json_encode(["success" => false, "message" => "Session expired"]);
    exit();
} else {
    $_SESSION['lastActivityTime'] = time();
}

//If login.php has not stored the UID into the session, then "nothing to be seen here": the user
//is instantly thrown out of the system. That can also happen if you cannot get CORS and cookies
//working in your dev environment (see the slides for that!).
//Note that sessionUid-function has a side-effect: it echoes an error if things go wrong!
function getCurrentTimeMillis() {
    return substr(microtime(true) * 1000, 0, 13);
}

if (($uid = sessionUid()) != null) {
    $currentTime = getCurrentTimeMillis();
    $_SESSION['lastCallTime'] = $currentTime;

    if (!isset($_SESSION['lastDbUpdateTime'])) {
        $_SESSION['lastDbUpdateTime'] = $currentTime;
    }

    if (($currentTime - $_SESSION['lastDbUpdateTime']) >= 10000) {
        $dcdb = getDbSes();
        if ($dcdb) {
            $updateSession = $dcdb->prepare("UPDATE session SET lastseen = :lastseen WHERE uid = :uid");
            $updateSession->bindValue(":lastseen", $currentTime);
            $updateSession->bindValue(":uid", $uid);
            $updateSession->execute();
        }
        $_SESSION['lastDbUpdateTime'] = $currentTime;
    }

    $ret = [];
    $ret["success"] = true;

    if (isset($_POST['action']) && $_POST['action'] === 'nop') {
        $ret["action"] = 'nop';
    }

    echo json_encode($ret);
}
?>