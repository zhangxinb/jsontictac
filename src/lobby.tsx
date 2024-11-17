import React, { useState, useEffect } from 'react';
import KeepAlive from './KeepAlive';
import Navbar from './Navbar';

interface LobbyProps {
  username: string;
}

interface User {
  uid: string;
  email: string;
  lastseen: number;
  gid: number | null;
}

const Lobby: React.FC<LobbyProps> = ({ username }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('http://localhost:12380/users.php', {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => setUsers(data.users))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

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
      <Navbar onLogout={handleLogout} username={username} />
      <h3>Logged-in Users</h3>
      <ul>
        {users.map((user, index) => (
          <li key={index}>
          {user.email}
        </li>
        ))}
      </ul>
      <KeepAlive />
    </div>
  );
};

export default Lobby;