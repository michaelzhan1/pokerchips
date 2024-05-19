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

io.on('connection', (socket: Socket) => {
  console.log(`[socket]: ${socket.id} connected`);

  io.to(socket.id).emit('message', `Hello ${socket.id}! You are the ${io.engine.clientsCount}th user`);

  socket.on('disconnect', () => {
    console.log(`[socket]: ${socket.id} disconnected`);
  });
})




app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});