import React, { useState, useEffect } from 'react';

interface LobbyProps {
  username: string;
  onInvite: (invitee: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ username, onInvite }) => {
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    fetch('/users.php')
      .then(response => response.json())
      .then(data => setUsers(data.users))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  return (
    <div>
      <h2>Welcome, {username}</h2>
      <h3>Logged-in Users</h3>
      <ul>
        {users.map((user, index) => (
          <li key={index}>
            {user} {user !== username && <button onClick={() => onInvite(user)}>Invite</button>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;