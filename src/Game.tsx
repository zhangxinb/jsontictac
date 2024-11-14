import React, { useState } from 'react';
import Navbar from './Navbar';
import Chat from './Chat';

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

function Game(props: any) {
  const cref = React.useRef<HTMLCanvasElement>(null);
  const [currentType, setCurrentType] = useState('X');

  const handleCellClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = cref.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const squareSize = canvas.width / props.sizex;
    const x = Math.floor(e.nativeEvent.offsetX / squareSize);
    const y = Math.floor(e.nativeEvent.offsetY / squareSize);

    animateCell(context, x, y, squareSize, currentType);

    setCurrentType(currentType === 'X' ? 'O' : 'X');
  };

  React.useEffect(() => {
    if (cref.current) {
      const context = cref.current.getContext('2d');
      if (context) {
        drawGrid(context, props.sizex, props.sizey, cref.current.width, cref.current.height);
      }
    } else {
      alert("Canvas not yet drawn or something else failed.");
    }
  }, [props.sizex, props.sizey]);

  const handleLogout = () => {
    fetch('http://localhost:12380//logout.php', {
      method: 'POST',
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          alert('You have logged out.');
          window.location.href = '/login';
        } else {
          alert('Logout failed.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <div>
      <Navbar onLogout={handleLogout} username={props.username} />
      <canvas ref={cref} width={props.sizex * 200} height={props.sizey * 200} onClick={handleCellClick} />
      <Chat username={props.username} />
      <audio autoPlay loop>
      <source src="http://localhost:12380/contra.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}

export default Game;
