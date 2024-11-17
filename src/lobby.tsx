import React, { useState, useEffect } from 'react';
import KeepAlive from './KeepAlive';

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

  return (
    <div>
      <h2>Welcome</h2>
      <h3>Logged-in Users</h3>
      <ul>
        {users.map((user, index) => (
          <li key={index}>
          {user.email} (Last seen: {new Date(user.lastseen * 1000).toLocaleString()})
        </li>
        ))}
      </ul>
      <KeepAlive />
    </div>
  );
};

export default Lobby;