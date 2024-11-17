import React, { useEffect } from 'react';

const KeepAlive: React.FC = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:12380/receive.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'nop' })
      })
        .then(response => response.json())
        .then(data => {
          if (data.action === 'nop') {
            console.log('Keep-alive signal sent.');
          }
        })
        .catch(error => console.error('Error sending keep-alive signal:', error));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default KeepAlive;