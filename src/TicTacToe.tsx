import React from 'react';
import { Dispatch, SetStateAction } from 'react';
import Game from './Game';
import Lobby from './lobby';


/*
   BIG EXERCISE:  Implement JSX code and logic into this file so that this component displays a
		  UI according to the current state of user interaction:
		  -A TOP BAR/SIDE BAR should be constantly visible and display whether the user has
		   logged in. The Top/side bar can also have application navigation
		  (login,logout,etc.)in it.
                  -the remaining area of the screen should then be dedicated for "stuff" we build
		   later, like:
			-a login screen (which you can build already now)
			-a registration screen (you can already do this too!)
			-the lobby (visible after login, we'll work with this later)
			-the game board (after choosing an opponent in the lobby, we'll work that out
			 later)

   
   The component in this file (TicTacToe, which is the "main component") should therefore be visible
   as the top/side-bar which displays at the minimum a logged in user's email and a "log out" button.
   The rest of the screen contents change dynamically.
   As long as a "statusbar" of this kind is visible the visual aspects do not matter in this exercise,
   you can work on the graphics as much or as little as you like.

   As an example the game board has been separated into it's own file/component called "Game".

   As "ready to use"-democode you also get a _rudimentary_ login (and kind of logout) too. The logic is
   not ready by any means, but the basic operation is functional and can be used in production _IF_ 
   the production has TLS encryption for the http-communications. Do note that the https-protocol is a
   _requirement_ for this setup to be OK. Key points of the scheme: password and username are sent to 
   server where a hash code (check the PHP code) is generated of the password. The database stores the
   hash code, which is used for comparing the login authentication, _plain_text_passwords_are_never_stored_
   in the database, only hashcodes are!!!!!! It is nontrivial (but not impossible!) to find a password
   matching a given hashcode, so even if the database "leaks" the passwords are not compromised.
   So, the basic setup is fine, however the logic is currently ridiculous and you can fix that! 

   EXERCISE 2:
   Separate Login into it's own component file and then make it prettier to look at and more logical to use.
   This will also require some change to the PHP side of things. Use your experience and common sense.
   The "most silly feature" at the moment is that if a username does not exist, the username is registered 
   right away and without even notifying the user that the registration was done!-) In real life this
   would result in n+1 accidental usernames and a bunch of misspelled passwords and therefore locked accounts.
   Registration needs it's own view, passwords should not be displayed on screen, at registration time the
   password should be queried twice to ensure no typos... etc. etc. Oh... and emails typically have an @
   somewhere?

   There's some features you want into _your_ version of Login.tsx/Register.tsx for starters?-)
   If you create a good Login/Register now, you can utilize it in the project course!!!

*/


let viewSetter : Dispatch<SetStateAction<any>>;
let userSetter : Dispatch<SetStateAction<any>>;

function confirmSession(j : any)
{

	if (j.success)
	{
		alert("Whooops... if you got this message in less than 15 minutes of work something went wrong with the exercise :-). So, essentially: you did it, but you should still check the logs and make the application prettier. This message from TicTacToe.tsx, confirmSession-function.");
		viewSetter("game");
	}
	else 
	{
		alert("Whooooops... something went wrong, you now need to dig up the .jsx and .php files and start checking what it might have been. This message from TicTacToe.tsx, confirmSession-function.");
		viewSetter("login");
	}
}

function showError(e : any)
{
	alert("Whoops... communication with the server did not work out... or the JSON has some weirdness in it... Check out the console.");
	console.log(e);
	viewSetter("login");
}

function getSession(event : any, m: string, p: string, c : any)
{
	let obu = { email : m, pass : p};
 	fetch(c.serviceroot+c.login, { method : "POST", mode : "cors", credentials : "include", 
                                             headers: {'Content-Type': 'text/plain'}, 
                                             body : JSON.stringify(obu) }).
	then( r => r.json() ).then( j => confirmSession(j) ).catch( e => showError(e));
}

function TicTacToe(props : any) 
{
	let config = props.config;
	let [view, setView] = React.useState(props.view);
	let [user, setUser] = React.useState(props.user);
	const viewSetter = setView;
	const userSetter = setUser;
	const handleInvite = (invitee: string) => {
		// Send invite to the server
		fetch('/invite.php', {
		  method: 'POST',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ inviter: user, invitee })
		})
		  .then(response => response.json())
		  .then(data => {
			if (data.status === 'success') {
			  alert(`Invitation sent to ${invitee}`);
			} else {
			  alert(`Failed to send invitation to ${invitee}`);
			}
		  })
		  .catch(error => console.error('Error sending invitation:', error));
	  };
	
	  if (view === "game") {
		return <Game key={view} sizex={3} sizey={3} config={config} username={user} />;
	  } else if (view === "lobby") {
		return <Lobby username={user} />;
	  } else {
		return null;
	  }
	}

export default TicTacToe;
