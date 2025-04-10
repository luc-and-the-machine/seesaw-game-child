import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKET_SERVER_URL);

function App() {
  const [angle, setAngle] = useState(0);
  const [partnerConnected, setPartnerConnected] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    socket.on('partner_joined', () => setPartnerConnected(true));
    socket.on('tilt', (data) => setAngle(data.angle));
    return () => {
      socket.off('partner_joined');
      socket.off('tilt');
    };
  }, []);

  const sendTilt = (direction) => {
    const newAngle = Math.max(-30, Math.min(30, angle + direction));
    socket.emit('tilt', { angle: newAngle });
    setAngle(newAngle);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.fillStyle = '#444';
    ctx.fillRect(-150, -5, 300, 10);
    ctx.fillStyle = '#FF6F61';
    ctx.beginPath(); ctx.arc(-140, 0, 15, 0, 2 * Math.PI); ctx.fill();
    ctx.beginPath(); ctx.arc(140, 0, 15, 0, 2 * Math.PI); ctx.fill();
    ctx.restore();
  }, [angle]);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      {!partnerConnected ? (
        <p>Waiting for a partner to join...</p>
      ) : (
        <>
          <canvas ref={canvasRef} width={400} height={300} style={{ border: '1px solid #ccc' }} />
          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => sendTilt(-5)}>Press Down (Left)</button>
            <button onClick={() => sendTilt(5)} style={{ marginLeft: '1rem' }}>Press Down (Right)</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
