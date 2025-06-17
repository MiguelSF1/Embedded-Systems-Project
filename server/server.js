// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Queue System
let queueNumber = 0;
let currentNumber = 0;
let currentBranch = '';
let codes = new Map(); // Map<number, string>

// Utility: Generate random 4-digit code
const generateCode = () => {
    return `${Math.floor(Math.random() * 10000)}`.padStart(4,0);
};

// WebSocket Connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('entered', { current_number: currentNumber, current_branch: currentBranch });

  socket.on('message', (msg) => {
    console.log('Client entered queue:', socket.id);
    queueNumber++;
    const code = generateCode();
    codes.set(queueNumber, code);
  
    const data = {
      queue_number: queueNumber,
      code,
      current_number:  currentNumber,
      current_branch: currentBranch
    };
  
    // Send back to client who joined
    socket.emit('queue_enter', data);
  
  });

  socket.on('disconnect', () => {
    console.log('user disconnected: ', socket.id);
  });
  
});


// REST API - Call Next Client
app.get('/next_client/:branchName', (req, res) => {
  if (codes.size === 0) {
    return res.status(404).json({ message: 'No clients in the queue' });
  }
  const firstKey = codes.keys().next().value;
  if (firstKey == currentNumber) {
    codes.delete(firstKey);
    if (codes.size === 0) {
      return res.status(404).json({ message: 'No clients in the queue' });
    } else {
      firstKey = codes.keys().next().value;
    }
  }

  const code = codes.get(firstKey);
  codes.delete(firstKey);
  currentNumber++;

  const branchName = req.params.branchName;
  currentBranch = branchName;
  const data = { current_number: firstKey, code };
  io.emit('queue_update', { current_number: firstKey, current_branch: branchName }); // Notify all clients
  return res.json(data);
});

// Server start
const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
