<?PHP
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type"); 
header("Access-Control-Allow-Credentials: true");

session_start();
require "dbsession.php";
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
    register($jsonar, $dcdb);
}


function register($jsonar, $dcdb) {
    $selectuser = $dcdb->prepare("SELECT uid FROM user WHERE email=:email;");
    $selectuser->bindValue(":email", $jsonar["email"]);

    if ($selectuser->execute() && $selectuser->rowCount() > 0) {
        jsonResponse(false, "User already exists", 5);
        return;
    }

    $insertuser = $dcdb->prepare("INSERT INTO user (email, hash) values (:email, :hash);");
    $insertuser->bindValue(":email", $jsonar["email"]);
    $insertuser->bindValue(":hash", password_hash($jsonar["pass"], PASSWORD_BCRYPT));

    if ($insertuser->execute()) {
        jsonResponse(true, "Registration successful", 6);
    } else {
        jsonResponse(false, "Registration failed", 7);
    }
}