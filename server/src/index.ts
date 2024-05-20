import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from 'http';
import { Server, Socket } from 'socket.io';

import { RoomInfoType } from './type/room';

dotenv.config();

const app: Express = express();
const port: string = process.env.PORT || "3001";

// ===== SOCKET SERVER INIT =====
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
// ===== END SOCKET SERVER INIT =====


// ===== SERVER VARIABLES =====
const letters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const roomIds: string[] = [];
const allRoomInfo: {[key: string]: RoomInfoType} = {};
const allRoomPots: {[key: string]: number} = {};
// ===== END SERVER VARIABLES =====


// ===== HELPER FUNCTIONS =====
const sendRoomData = (roomId: string) => {
  io.to(roomId).emit('roomInfo', allRoomInfo[roomId]);
  io.to(roomId).emit('roomPot', allRoomPots[roomId]);
}

const sendAction = (roomId: string, name: string, action: string, amount: number) => {
  let message: string;
  if (action === 'bet') message = `${name} bet ${amount} chips`;
  else if (action === 'take') message = `${name} took ${amount} chips`;
  else return;
  io.to(roomId).emit('roomAction', message);
}
// ===== END HELPER FUNCTIONS =====


// ===== SOCKET EVENTS =====
io.on('connection', (socket: Socket) => {
  // console.log(`[server]: New connection ${socket.id}`);

  socket.on('joinRoom', (data: {roomId: string, amount: number, name: string}): void => {
    const { roomId, amount, name } = data;
    if (!roomIds.includes(roomId)) {
      socket.emit('roomError', 'Room does not exist');
      return;
    }

    // console.log(`[socket]: ${name} (${socket.id}) joined room ${roomId} with ${amount} chips`);
    socket.join(roomId);

    // Add player to room and initialize room, then update room data
    allRoomInfo[roomId] = {...allRoomInfo[roomId], [socket.id]: {name: name, amount: amount}};
    if (!allRoomPots[roomId]) allRoomPots[roomId] = 0;
    sendRoomData(roomId);

    socket.on('bet', (data: {amt: number, roomId: string, socketId: string}): void => {
      const { amt, socketId, roomId } = data;
      // console.log(`[socket]: ${allRoomInfo[roomId][socketId].name} (${socketId}) bet ${amt} chips`);
      allRoomInfo[roomId][socketId].amount -= amt;
      allRoomPots[roomId] += amt;
      sendRoomData(roomId);
      sendAction(roomId, allRoomInfo[roomId][socketId].name, 'bet', amt);
    });

    socket.on('take', (data: {amt: number, roomId: string, socketId: string}): void => {
      const { amt, socketId, roomId } = data;
      // console.log(`[socket]: ${allRoomInfo[roomId][socketId].name} (${socketId}) took ${amt} chips`); // todo: send message
      allRoomInfo[roomId][socketId].amount += amt;
      allRoomPots[roomId] -= amt;
      sendRoomData(roomId);
      sendAction(roomId, allRoomInfo[roomId][socketId].name, 'take', amt);
    });
    
    socket.on('disconnect', () => {
      // console.log(`[socket]: ${socket.id} disconnected from room ${roomId}`);
      if (allRoomInfo[roomId]) delete allRoomInfo[roomId][socket.id];
      if (Object.keys(allRoomInfo[roomId]).length === 0) {
        roomIds.splice(roomIds.indexOf(roomId), 1);
        delete allRoomInfo[roomId];
        delete allRoomPots[roomId];
      } else {
        sendRoomData(roomId);
      }
      // console.log(`Remaining room codes: ${roomIds}`);
      // console.log(`Remaining room data: ${JSON.stringify(allRoomInfo)}`);
      // console.log(`Remaining room pots: ${JSON.stringify(allRoomPots)}`);
    });
  });
});
// ===== END SOCKET EVENTS =====


// ===== API ROUTES =====
app.get('/api/getNewRoomId', (req: Request, res: Response): void => {
  // generate 5 letter game ID
  let newRoomId: string;
  do {
    newRoomId = '';
    for (let i = 0; i < 5; i++) {
      newRoomId += letters[Math.floor(Math.random() * letters.length)];
    }
  } while (roomIds.includes(newRoomId));

  // console.log(`[server]: New room ID generated: ${newRoomId}`);
  roomIds.push(newRoomId);
  let data = JSON.stringify({roomId: newRoomId});
  res.send(data);
});

app.get('/api/checkRoomId/:roomId', (req: Request, res: Response): void => {
  const { roomId } = req.params;
  let data = JSON.stringify({roomExists: roomIds.includes(roomId)});
  res.send(data);
});
// ===== END API ROUTES =====