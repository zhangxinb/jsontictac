import React, { useState, useRef, useEffect } from 'react';
import Chat from './Chat';

interface GameProps {
  ws: WebSocket;
  gameId: string;
  user: User;
  opponent: User;
  board: (string | null)[];
  sizex: number;
  sizey: number;
  setBoard: React.Dispatch<React.SetStateAction<(string | null)[]>>;
}

interface User {
  uid: string;
  email: string;
}

function showError(e : any)
{
	alert("So, then... you got this error. Kind of weird you got this far and still see this, but let's see what we're going to do about it next week. In the meanwhile, open up the network logs and see what they say, because at the moment your teacher wants to know too :-D.");
}

function handleMove(j : any)
{
	alert("We'll handle the moves next week, just finalize the sign-in and top status bar first :-). This component has been created already this week mainly to allow you to see a change occur after signing in and also as a hands-on-example of separating the app into components. Once we finish working on this thing you actually enter the game via the \"Lobby\".");
}

function sendMove(mx: number, my: number, c: any)
{
	let obj = { x : mx, y : my};
	fetch(c.serviceroot+c.receiver, { method : "POST", mode : "cors", credentials : "include", 
							headers: {'Content-Type': 'text/plain'}, 
							body : JSON.stringify(obj) }).
								then( r => r.json() ).then( j => handleMove(j) ).catch( e => showError(e));
}

function drawPartialX(context: CanvasRenderingContext2D, x: number, y: number, size: number, progress: number) {
  context.beginPath();
  context.moveTo(x * size, y * size);
  context.lineTo(x * size + size * (progress / 100), y * size + size * (progress / 100));
  context.moveTo(x * size + size, y * size);
  context.lineTo(x * size + size - size * (progress / 100), y * size + size * (progress / 100));
  context.stroke();
}

function drawPartialO(context: CanvasRenderingContext2D, x: number, y: number, size: number, progress: number) {
  context.beginPath();
  context.arc(x * size + size / 2, y * size + size / 2, size / 2 * (progress / 100), 0, 2 * Math.PI);
  context.stroke();
}

function drawGrid(context: CanvasRenderingContext2D, xlines: number, ylines: number, width: number, height: number) {
  const squareSize = Math.min(width / xlines, height / ylines);

  if (squareSize < 10) {
    alert("The size of a square would be less than 10 pixels in either direction.");
    return;
  }

  context.clearRect(0, 0, width, height);
  context.strokeStyle = 'black';

  for (let i = 0; i <= xlines; i++) {
    context.beginPath();
    context.moveTo(i * squareSize, 0);
    context.lineTo(i * squareSize, ylines * squareSize);
    context.stroke();
  }

  for (let i = 0; i <= ylines; i++) {
    context.beginPath();
    context.moveTo(0, i * squareSize);
    context.lineTo(xlines * squareSize, i * squareSize);
    context.stroke();
  }
}

function animateCell(context: CanvasRenderingContext2D, x: number, y: number, size: number, animationType: string) {
  let progress = 0;
  const animationInterval = setInterval(() => {
    context.clearRect(x * size, y * size, size, size);
    context.strokeStyle = 'black';
    context.strokeRect(x * size, y * size, size, size);

    if (animationType === 'X') {
      drawPartialX(context, x, y, size, progress);
    } else if (animationType === 'O') {
      drawPartialO(context, x, y, size, progress);
    }

    progress += 5;
    if (progress >= 100) {
      clearInterval(animationInterval);
    }
  }, 16);
}

const Game: React.FC<GameProps> = ({ ws, gameId, user, opponent, board, sizex, sizey, setBoard }) => {
    const cref = useRef<HTMLCanvasElement>(null);
    const [currentType, setCurrentType] = useState('X'); 
    const [drawnCells, setDrawnCells] = useState<Set<number>>(new Set());
    
  
    const handleCellClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = cref.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;
      const squareSize = canvas.width / sizex;
      const x = Math.floor(e.nativeEvent.offsetX / squareSize);
      const y = Math.floor(e.nativeEvent.offsetY / squareSize);
  
      // Animate cell locally
      animateCell(context, x, y, squareSize, currentType);
  
      // Send move to the server via WebSocket
      if (ws) {
        ws.send(
          JSON.stringify({
            type: 'makeMove',
            gameId,
            x,
            y,
            player: currentType,
          })
        );
      }
  
      // Toggle between X and O
      setCurrentType(currentType === 'X' ? 'O' : 'X');
    };
  
    React.useEffect(() => {
      if (cref.current) {
        const context = cref.current.getContext('2d');
        if (context) {
          drawGrid(context, sizex, sizey, cref.current.width, cref.current.height);
        }
      } else {
        alert("Canvas not yet drawn or something else failed.");
      }
    }, [sizex, sizey]);

    useEffect(() => {
      const canvas = cref.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;
    
      const cellSize = canvas.width / sizex;
    
      // 遍历棋盘并绘制未绘制的棋子
      board.forEach((cell, index) => {
        if (!cell || drawnCells.has(index)) return; // 忽略空单元格和已绘制单元格
    
        const x = index % sizex;
        const y = Math.floor(index / sizex);
    
        if (cell === 'X') {
          drawPartialX(context, x, y, cellSize, 100);
        } else if (cell === 'O') {
          drawPartialO(context, x, y, cellSize, 100);
        }
    
        // 将当前单元格标记为已绘制
        setDrawnCells((prev) => new Set(prev).add(index));
      });
    }, [board, drawnCells, opponent.uid, sizex, user.uid]);
    
    
    return (
      <div>
        <h2>Game with {opponent.email}</h2>
        <canvas ref={cref} width={sizex * 200} height={sizey * 200} onClick={handleCellClick} />
        <audio autoPlay loop>
          <source src="http://localhost:12380/contra.mp3" type="audio/mpeg" />
        </audio>
      </div>
    );
  }

export default Game;
