import React from 'react';
import { Dispatch, SetStateAction, useState, useEffect, useRef } from 'react';
import Game from './Game';
import Lobby from './lobby';
import Navbar from './Navbar';
import { Container } from '@mui/material';


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


let viewSetter: Dispatch<SetStateAction<any>>;
let userSetter: Dispatch<SetStateAction<any>>;

function confirmSession(j: any) {

	if (j.success) {
		alert("Whooops... if you got this message in less than 15 minutes of work something went wrong with the exercise :-). So, essentially: you did it, but you should still check the logs and make the application prettier. This message from TicTacToe.tsx, confirmSession-function.");
		viewSetter("game");
	}
	else {
		alert("Whooooops... something went wrong, you now need to dig up the .jsx and .php files and start checking what it might have been. This message from TicTacToe.tsx, confirmSession-function.");
		viewSetter("login");
	}
}

function showError(e: any) {
	alert("Whoops... communication with the server did not work out... or the JSON has some weirdness in it... Check out the console.");
	console.log(e);
	viewSetter("login");
}

function getSession(event: any, m: string, p: string, c: any) {
	let obu = { email: m, pass: p };
	fetch(c.serviceroot + c.login, {
		method: "POST", mode: "cors", credentials: "include",
		headers: { 'Content-Type': 'text/plain' },
		body: JSON.stringify(obu)
	}).
		then(r => r.json()).then(j => confirmSession(j)).catch(e => showError(e));
}

interface User {
	uid: string;
	email: string;
	lastseen: number;
	gid: number | null;
}

function TicTacToe(props: any) {
	const config = props.config;
	const [view, setView] = useState('lobby');
	const [user, setUser] = useState<User | null>(props.user);
	const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
	const [opponent, setOpponent] = useState<User | null>(null);
	const [gameId, setGameId] = useState<string | null>(null);
	const [board, setBoard] = useState<(string | null)[]>(Array(config.sizex * config.sizey).fill(null));
	const [users, setUsers] = useState<User[]>([]);
	const ws = useRef<WebSocket | null>(null);
	const isWsOpen = useRef(false);

	useEffect(() => {
		if (ws.current) return;

		ws.current = new WebSocket('ws://localhost:8080');

		ws.current.onopen = () => {
			isWsOpen.current = true; // 标记连接成功
			if (user) {
				ws.current?.send(
					JSON.stringify({
						type: 'login',
						uid: user.uid,
						email: user.email,
					})
				);
			}
		};

		ws.current.onmessage = (event) => handleWebSocketMessage(event, setUser, setUsers, setGameId, setOpponent, setView, setBoard);

		ws.current.onerror = (error) => {
			console.error('WebSocket error:', error);
		};

		ws.current.onclose = () => {
			console.log('WebSocket closed');
			isWsOpen.current = false;
		};

		// 清理 WebSocket
		return () => {
			if (ws.current?.readyState === WebSocket.OPEN) {
				ws.current.close();
			}
			ws.current = null;
			isWsOpen.current = false;
		};
	}, [user]);

	const sendWebSocketMessage = (message: any) => {
		if (ws.current?.readyState === WebSocket.OPEN) {
			ws.current.send(JSON.stringify(message));
		} else {
			console.warn('WebSocket is not ready. Message not sent:', message);
		}
	};

	const handleStartGame = (opponent: User) => {
		ws.current?.send(JSON.stringify({
			type: 'startGame',
			uidx: user!.uid,
			uido: opponent.uid,
			playerX: user!.uid,
			playerO: opponent.uid,
			sizex: config.sizex,
			sizey: config.sizey,
			email: user?.email
		}));
		setView('game');
	};

	const handleLogout = () => {
		ws.current?.send(JSON.stringify({ type: 'logout', uid: user?.uid }));
		setUser(null);
		window.location.href = '/login';
	};

	return (
		<Container>
			<Navbar onLogout={handleLogout} username={user!.email} />
			{view === 'lobby' && <Lobby onStartGame={handleStartGame} users={users} />}
			{view === 'game' && opponent && (
				<Game
				ws={ws.current!}
				gameId={gameId!}
				user={user!}
				opponent={opponent}
				board={board}
				sizex={config.sizex}
				sizey={config.sizey}
				setBoard={setBoard}
				uidx={user!.uid}
				uido={opponent.uid}
				/>
			)}
		</Container>
	);
}

export default TicTacToe;
