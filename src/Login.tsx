import React, { useState, useEffect, useRef } from 'react';
import LoginPage, { Username, Password, TitleSignup, TitleLogin, Submit, Title } from '@react-login-page/page8';
import TicTacToe from './TicTacToe';


const styles = { height: 690 };

interface User {
  uid: string;
  email: string;
}

const Login: React.FC = (props: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [view, setView] = useState<'login' | 'lobby'>('login');
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(props.user);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (view === 'lobby') {
      if (!ws.current) {
        ws.current = new WebSocket('ws://localhost:8080');
      }

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        if (loggedInUser) {
          ws.current?.send(
            JSON.stringify({
              type: 'login',
              uid: loggedInUser.uid,
              email: loggedInUser.email,
            })
          );
        }
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'loginSuccess':
				setUser((prevUser) => (prevUser?.uid === data.currentUser.uid ? prevUser : data.currentUser));
				setUsers(data.users);
				localStorage.setItem('user', JSON.stringify(data.currentUser));
				break;
          case 'gameStarted':
            console.log('Game started with', data.opponent);
            break;
          default:
            console.warn('Unhandled WebSocket message type:', data.type);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Optionally handle reconnect logic here
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        ws.current?.close();
        ws.current = null;
      };
    }
  }, [view, loggedInUser]);

  const getSession = async (event: React.FormEvent) => {
    event.preventDefault();
    const requestBody = {
      email,
      pass: password,
    };

    try {
      const response = await fetch('http://localhost:12380/login.php', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        const user = {
          uid: data.user.uid,
          email: data.user.email,
        };
        setLoggedInUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        setView('lobby');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Communication with the server failed. Check console for details.');
      console.error(error);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const requestBody = {
      email,
      pass: password,
    };

    try {
      const response = await fetch('http://localhost:12380/register.php', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Communication with the server failed. Check console for details.');
      console.error(error);
    }
  };

  return (
    <div style={styles}>
      {view === 'login' ? (
        <LoginPage>
          <Title />
          <TitleSignup>Signup</TitleSignup>
          <TitleLogin>Login</TitleLogin>

          <Username
            label="Email"
            placeholder="Please input email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Password
            label="Password"
            placeholder="Please enter password"
            name="userPassword"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Submit keyname="submit" onClick={getSession}>
            Login
          </Submit>

          <Submit keyname="reset">Reset</Submit>

          <Username
            panel="signup"
            label="Email"
            placeholder="E-mail"
            keyname="e-mail"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Password
            panel="signup"
            label="Password"
            placeholder="Please enter password"
            keyname="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Password
            panel="signup"
            label="Confirm Password"
            placeholder="Confirm password"
            keyname="confirm-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Submit panel="signup" keyname="signup-submit" onClick={handleRegister}>
            Signup
          </Submit>
          <Submit panel="signup" keyname="signup-reset">
            Reset
          </Submit>
        </LoginPage>
      ) : (
        <TicTacToe user={loggedInUser} config={{ sizex: 3, sizey: 3 }} users={users} ws={ws.current} />
      )}
    </div>
  );
};

export default Login;
