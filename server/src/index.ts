import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from 'http';
import { Server, Socket } from 'socket.io';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// set up socket
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST"],
}));

const server: http.Server = http.createServer(app);
server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

const io: Server = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  }
});


// server variables
const letters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const roomIds: string[] = [];

io.on('connection', (socket: Socket) => {
  console.log(`[server]: New connection ${socket.id}`);

  socket.on('joinRoom', (roomId: string) => {
    console.log(`[socket]: ${socket.id} joined room ${roomId}`);
    socket.join(roomId);
    socket.emit('message', `You are the ${io.sockets.adapter.rooms.get(roomId)?.size}th person to join the room`);
    
    socket.on('disconnect', () => {
      console.log(`[socket]: ${socket.id} disconnected from room ${roomId}`);
    });
  });
});


// ===== API ROUTES =====
app.get('/api/getNewRoomId', (req: Request, res: Response) => {
  // generate 5 letter game ID
  let newRoomId: string;
  do {
    newRoomId = '';
    for (let i = 0; i < 5; i++) {
      newRoomId += letters[Math.floor(Math.random() * letters.length)];
    }
  } while (roomIds.includes(newRoomId));

  console.log(`[server]: New room ID generated: ${newRoomId}`);
  roomIds.push(newRoomId);
  res.send(newRoomId);
});

app.get('/api/checkRoomId/:roomId', (req: Request, res: Response) => {
  const { roomId } = req.params;
  res.send(roomIds.includes(roomId));
});
// ===== END API ROUTES =====