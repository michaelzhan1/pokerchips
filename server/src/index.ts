import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from 'http';
import { Server, Socket } from 'socket.io';

import { RoomInfoType } from './type/room';

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
const allRoomInfo: {[key: string]: RoomInfoType} = {}; // track players (socketid) and their amounts
const allRoomPots: {[key: string]: number} = {};

// helper functions
const sendRoomData = (roomId: string) => {
  io.to(roomId).emit('roomInfo', allRoomInfo[roomId]);
  io.to(roomId).emit('roomPot', allRoomPots[roomId]);
}

io.on('connection', (socket: Socket) => {
  console.log(`[server]: New connection ${socket.id}`);

  socket.on('joinRoom', (data) => {
    const { roomId, amount, name } = data;
    console.log(`[socket]: ${name} (${socket.id}) joined room ${roomId} with ${amount} chips`);
    socket.join(roomId);

    // Add player to room and initialize room, then update room data
    allRoomInfo[roomId] = {...allRoomInfo[roomId], [socket.id]: {name: name, amount: parseInt(amount || '1000')}};
    if (!allRoomPots[roomId]) allRoomPots[roomId] = 0;
    sendRoomData(roomId);

    socket.on('bet', (data) => {
      const { amt, socketId, roomId } = data;
      console.log(`[socket]: ${allRoomInfo[roomId][socketId].name} (${socketId}) bet ${amt} chips`);
      allRoomInfo[roomId][socketId].amount -= amt;
      allRoomPots[roomId] += amt;
      sendRoomData(roomId);
    });

    socket.on('take', (data) => {
      const { amt, socketId, roomId } = data;
      console.log(`[socket]: ${allRoomInfo[roomId][socketId].name} (${socketId}) took ${amt} chips`);
      allRoomInfo[roomId][socketId].amount += amt;
      allRoomPots[roomId] -= amt;
      sendRoomData(roomId);
    });


    
    socket.on('disconnect', () => {
      console.log(`[socket]: ${socket.id} disconnected from room ${roomId}`);
      if (allRoomInfo[roomId]) delete allRoomInfo[roomId][socket.id];
      if (Object.keys(allRoomInfo[roomId]).length === 0) {
        roomIds.splice(roomIds.indexOf(roomId), 1);
        delete allRoomInfo[roomId];
        delete allRoomPots[roomId];
      } else {
        sendRoomData(roomId);
      }
      console.log(`Remaining room codes: ${roomIds}`);
      console.log(`Remaining room data: ${JSON.stringify(allRoomInfo)}`);
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