import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface User {
  uid: number;
  email: string;
  lastseen: number;
  gid: number | null;
}

interface GameState {
  board: (string | null)[];
  currentPlayer: "X" | "O";
  winner: string | null;
  boardSize: number;
}

interface SessionContextType {
    users: User[];
    currentUser: User | null;
    gameState: GameState;
    gameId: string | null;
    opponent: User | null;
    view: string;
    board: (string | null)[];
    addUser: (user: User) => void;
    setUser: (user: User | null) => void;
    setUsers: (users: User[]) => void;
    setCurrentUser: (user: User | null) => void;
    setGameId: (gameId: string | null) => void;
    setOpponent: (opponent: User | null) => void;
    setView: (view: string) => void;
    setBoard: (board: (string | null)[]) => void;
    handleStartGame: (opponent: User) => void;
    handleLogout: () => void;
  }

const defaultBoardSize = 3;
const defaultGameState: GameState = {
  board: Array(defaultBoardSize * defaultBoardSize).fill(null),
  currentPlayer: "X",
  winner: null,
  boardSize: defaultBoardSize,
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [gameState, setGameState] = useState<GameState>(defaultGameState);
  const [gameId, setGameId] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<User | null>(null);
  const [view, setView] = useState<string>("lobby");
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));

  const handleStartGame = async (opponent: User) => {
    try {
      const response = await fetch('http://localhost:12380/startGame.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uidx: currentUser!.uid,
          uido: opponent.uid,
          playerX: currentUser!.uid,
          playerO: opponent.uid,
          sizex: 3,
          sizey: 3,
          email: currentUser?.email,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGameId(data.gameId);
        setOpponent(opponent);
        setView("game");
        setBoard(Array(3 * 3).fill(null)); // Initialize the board
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('user');
    setCurrentUser(null);
    try {
      const response = await fetch('http://localhost:12380/logout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.status === 'success') {
        window.location.href = '/login';
      } else {
        alert('Failed to log out. Please try again.');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  const addUser = useCallback((user: User) => {
    setUsers((prev) => {
      if (prev.some((u) => u.uid === user.uid)) {
        return prev; 
      }
      const newUsers = [...prev, user];
      console.log('Current users:', newUsers);
      return newUsers;
    });
  }, []);

  const removeUser = useCallback((uid: number) => {
    setUsers((prev) => prev.filter((user) => user.uid !== uid));
    if (currentUser?.uid === uid) {
      setCurrentUser(null);
    }
  }, [currentUser]);

  const updateCurrentUser = useCallback((user: User | null) => {
    setCurrentUser(user);
    if (user) {
      addUser(user);
    }
  }, [addUser]);


  const makeMove = (index: number) => {
    if (!gameState.board[index] && !gameState.winner) {
      const newBoard = [...gameState.board];
      newBoard[index] = gameState.currentPlayer;

      const winner = calculateWinner(newBoard, gameState.boardSize);

      setGameState({
        board: newBoard,
        currentPlayer: gameState.currentPlayer === "X" ? "O" : "X",
        winner,
        boardSize: gameState.boardSize,
      });
    }
  };

  const resetGame = () => {
    setGameState({
      board: Array(gameState.boardSize * gameState.boardSize).fill(null),
      currentPlayer: "X",
      winner: null,
      boardSize: gameState.boardSize,
    });
  };

  const setBoardSize = (size: number) => {
    setGameState({
      board: Array(size * size).fill(null),
      currentPlayer: "X",
      winner: null,
      boardSize: size,
    });
  };

  const value: SessionContextType = {
    addUser,
    setCurrentUser: updateCurrentUser,
    users,
    currentUser,
    gameState,
    gameId,
    opponent,
    view,
    board,
    setUser: setCurrentUser,
    setUsers,
    setGameId,
    setOpponent,
    setView,
    setBoard: setBoard as React.Dispatch<React.SetStateAction<(string | null)[]>>,
    handleStartGame,
    handleLogout,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

const calculateWinner = (board: (string | null)[], boardSize: number): string | null => {
  const lines = [];

  for (let row = 0; row < boardSize; row++) {
    lines.push([...Array(boardSize)].map((_, col) => row * boardSize + col));
  }

  for (let col = 0; col < boardSize; col++) {
    lines.push([...Array(boardSize)].map((_, row) => row * boardSize + col));
  }

  lines.push([...Array(boardSize)].map((_, i) => i * boardSize + i));

  lines.push([...Array(boardSize)].map((_, i) => (i + 1) * boardSize - i - 1));

  for (let line of lines) {
    const [first, ...rest] = line;
    if (board[first] && rest.every((index) => board[index] === board[first])) {
      return board[first];
    }
  }

  return null;
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export default SessionContext;
