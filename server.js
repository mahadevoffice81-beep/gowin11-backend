const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get('/', (req, res) => {
  res.json({ message: "GoWin11 Backend Server Running!" });
});

let currentMultiplier = 1.00;
let isFlying = false;

function startNewGameRound() {
  currentMultiplier = 1.00;
  isFlying = true;
  let crashPoint = (Math.random() * (10.0 - 1.1) + 1.1).toFixed(2);

  const gameInterval = setInterval(() => {
    if (!isFlying) { clearInterval(gameInterval); return; }
    currentMultiplier += 0.05;
    currentMultiplier = parseFloat(currentMultiplier.toFixed(2));

    if (currentMultiplier >= crashPoint) {
      isFlying = false;
      io.emit('aviator_crash', { crashPoint: currentMultiplier });
      clearInterval(gameInterval);
      setTimeout(startNewGameRound, 5000);
    } else {
      io.emit('aviator_tick', { multiplier: currentMultiplier });
    }
  }, 200);
}

io.on('connection', (socket) => {
  socket.emit('aviator_state', { multiplier: currentMultiplier, isFlying: isFlying });
});

startNewGameRound();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
