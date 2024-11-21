// webSocketHandlers.ts
import { Dispatch, SetStateAction } from 'react';

interface User {
  uid: string;
  email: string;
  lastseen: number;
  gid: number | null;
}

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export const handleWebSocketMessage = (
  event: MessageEvent,
  setUser: Dispatch<SetStateAction<User | null>>,
  setUsers: Dispatch<SetStateAction<User[]>>,
  setGameId: Dispatch<SetStateAction<string | null>>,
  setOpponent: Dispatch<SetStateAction<User | null>>,
  setView: Dispatch<SetStateAction<string>>,
  setBoard: Dispatch<SetStateAction<(string | null)[]>>
) => {
  const data: WebSocketMessage = JSON.parse(event.data);
  switch (data.type) {
    case 'loginSuccess':
    if (setUser) {
        setUser((prevUser) => (prevUser?.uid === data.currentUser.uid ? prevUser : data.currentUser));
      }
      if (setUsers) {
        setUsers(data.users);
      }
      localStorage.setItem('user', JSON.stringify(data.currentUser));
      break;
    case 'updateUsers':
      if (setUsers) {
        setUsers(data.users);
      }
      break;
    case 'gameStarted':
      if (setGameId) {
        setGameId(data.gameId);
      }
      if (setOpponent) {
        setOpponent(data.opponent);
      }
      if (setView) {
        setView('game');
      }
      break;
    case 'updateBoard':
      if (setBoard) {
        setBoard(data.board);
      }
      break;
    default:
      console.warn('Unhandled WebSocket message type:', data.type);
      break;
  }
};
export {};