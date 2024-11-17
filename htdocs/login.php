<?PHP

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type"); 
header("Access-Control-Allow-Credentials: true");

/*
	Three exercises in this file, look for EXERCISE


	EXERCISE 1:

	As you can see by reading the code below, you need to have a table called "user"
        with these columns:
	 uid (numeric id for a user, auto-increment this one)
	 hash (password hash, text)
	 email (user's "email address", but with the current code it could be "anythingandeverything"...)

	We create more later.
	Create a database and a user for that database, both with the same name (tictac).
	credentials.php has the password for the teacher's tictac-database, either copy it from there or come up with a
        better one and update credentials.php.
	
	ABOUT SECURITY:
	Don't forget that the uid, even if it moves from the server to the browser SHOULD NOT MOVE BACK FROM BROWSER TO SERVER.
	(Why would it have to move even from the server to the browser? Let's keep the server as "blackbox" as we can?) 
	The identity-binding has been done the moment the password has been checked and from there on the identity will be kept
	in a PHP-session in which all information lives _only_ in the server side.
	The less information the browser gets of the internals of the server side, the better. Pay attention to this and consider
	the "why"s.
	You also need to consider this in the future as we store some more id:s and "stuff" into the session. Often it might feel
	quicker to just send all this stuff into the browser for React to process, but it's vitally important none of these original
	id's and business logic data flow into the UI - that way they cannot be injected with either!!!


	EXERCISE 2:
		Edit this file in all the ways the *.tsx files require!
		You can (=should?) also separate the creation of a new id and logout (session uid="") away from here.
		Also read the comments of receive.php: from there you can see that another approach is possible and you can have 
		_everything_ accessible via one file _as_long_as_ such a central switch hides a bunch of small, atomic .php
		files with little functions.


*/
session_start();
require_once "dbsession.php";
require "jsonhelper.php";
$dcdb = getDbSes();
if ($dcdb)
{
	$reqbody = file_get_contents('php://input');
	$jsonar = json_decode($reqbody, TRUE);
	if (trim($jsonar["pass"]) == "" || trim($jsonar["email"]) == "")
	{
		$_SESSION["uid"] = "";
		jsonResponse(false, "Nonexistent user or wrong password", 1);
		return;
	}
    login($jsonar, $dcdb);
}

function login($jsonar, $dcdb) {
    $selectuser = $dcdb->prepare("SELECT uid, hash, email FROM user WHERE email=:email;");
    $selectuser->bindValue(":email", $jsonar["email"]);
    $pwd = $jsonar["pass"];

    if ($selectuser->execute() && $selectuser->rowCount() > 0) {
        $user = $selectuser->fetch();
        $hash = $user["hash"];
        $uid = $user["uid"];
        $email = $user["email"];

        if (password_verify($pwd, $hash)) {
            $_SESSION["uid"] = $uid;
            $_SESSION["email"] = $email;

            if (!isset($_SESSION['loggedInUsers']) || !is_array($_SESSION['loggedInUsers'])) {
                $_SESSION['loggedInUsers'] = [];
            }

            $userExists = false;
            foreach ($_SESSION['loggedInUsers'] as $loggedInUser) {
                if (is_array($loggedInUser) && $loggedInUser['uid'] === $uid) {
                    $userExists = true;
                    break;
                }
            }
            if (!$userExists) {
                $_SESSION['loggedInUsers'][] = ['uid' => $uid, 'email' => $email];
            }

			$_SESSION['lastDbUpdateTime'] = getCurrentTimeMillis();

			$lastseen = time();
            $gid = null;
            $insertSession = $dcdb->prepare("INSERT INTO session (uid, lastseen, gid) VALUES (:uid, :lastseen, :gid) ON DUPLICATE KEY UPDATE lastseen = :lastseen, gid = :gid;");
            $insertSession->bindValue(":uid", $uid);
            $insertSession->bindValue(":lastseen", $lastseen);
            $insertSession->bindValue(":gid", $gid);
            $insertSession->execute();

            jsonResponse(true, "Login successful", 2, ['uid' => $uid, 'email' => $email]);
        } else {
            $_SESSION["uid"] = "";
            jsonResponse(false, "Incorrect password", 3);
        }
    } else {
        jsonResponse(false, "User does not exist", 4);
    }
}

function getCurrentTimeMillis() {
    return substr(microtime(true) * 1000, 0, 13);
}
?>