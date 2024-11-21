import React, { useState, useEffect, useRef } from 'react';
import KeepAlive from './KeepAlive';
import { Container, Typography, List, ListItem, ListItemText, Button, CircularProgress, ListItemIcon, Paper } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';

interface LobbyProps {
  onStartGame: (opponent: User) => void;
  users: User[];
}

interface User {
  uid: string;
  email: string;
  lastseen: number;
  gid: number | null;
}

const Lobby: React.FC<LobbyProps> = ({ onStartGame, users }) => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(false);
  }, [users]);

  const fade = useSpring({ opacity: loading ? 0 : 1 });

  return (
    <Container>
      {/* 标题部分 */}
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <GroupIcon sx={{ marginRight: 1 }} />
        Logged-in Users
      </Typography>
  
      {/* 加载状态或用户列表 */}
      {loading ? (
        <CircularProgress />
      ) : (
        <animated.div style={fade}>
          <Paper elevation={3} sx={{ padding: 2, borderRadius: 2 }}>
            <List>
              {users.map((user, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingY: 1,
                  }}
                >
                  {/* 用户信息部分 */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary={user.email} />
                  </div>
  
                  {/* 按钮部分 */}
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => onStartGame(user)}
                  >
                    Start Game
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        </animated.div>
      )}
  
      {/* 保活部分 */}
      <KeepAlive />
    </Container>
  );
  
};

export default Lobby;