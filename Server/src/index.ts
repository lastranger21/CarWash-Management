import express, { type Express, type Request, type Response } from 'express';
import mainRoute from './routes/indexRoute';
import { errorHandler } from './middlewares/errorHandler';
import cors from 'cors'
const app: Express = express();

const http = require('http');
const { Server } = require('socket.io');
app.use(cors())
app.use(express.json());
app.use('/api', mainRoute)
app.use(errorHandler)
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
  },
});
// Simpan instance io 
app.set('io', io);
// Event koneksi Socket.IO
io.on('connection', (socket:any) => {
  console.log(`Client terhubung: ${socket.id}`);
  // Customer bergabung ke room khusus untuk order tertentu
  socket.on('join_order', (orderId:any) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} join ke room order_${orderId}`);
  });
  socket.on('disconnect', () => {
    console.log(`Client disconnect: ${socket.id}`);
  });
});


const port =3000
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});