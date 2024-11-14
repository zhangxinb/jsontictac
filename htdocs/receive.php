<?PHP
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
require "sessioncheck.php";

//If login.php has not stored the UID into the session, then "nothing to be seen here": the user
//is instantly thrown out of the system. That can also happen if you cannot get CORS and cookies
//working in your dev environment (see the slides for that!).
//Note that sessionUid-function has a side-effect: it echoes an error if things go wrong!
if (($uid = sessionUid()) != null)
{
	$ret = [];
	$ret["success"] = true;
	$ret["message"] = "Well well well, looks like you're logged in!";
	$ret["mid"] = 1;
	echo json_encode($ret);
}
?>