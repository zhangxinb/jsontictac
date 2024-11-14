<?PHP
require "constants.php";
require PREFIX."credentials.php";

//This connects us to the database, if it doesn't work, check out credentials.php!!!
function getDbSes()
{
	try
	{
		return new PDO(getDbStringFromCredentials(), getDbUserFromCredentials(), getDbPwdFromCredentials(),
		array( PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
			 PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8' ));
	}
	catch (PDOException $noDb)
	{
		$ret = [];
		$ret["success"] = false;
		$ret["message"] = "Database connection failure." . $noDb->getMessage();
		$ret["mid"] = 1;
		echo json_encode($ret);
		return false;
	}
	
}


?>