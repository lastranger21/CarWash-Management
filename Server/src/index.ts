import express, { type Express, type Request, type Response } from 'express';
import mainRoute from './routes/indexRoute';
import { errorHandler } from './middlewares/errorHandler';
import cors from 'cors'
const app: Express = express();
app.use(cors())
app.use(express.json());
app.use('/api', mainRoute)
app.use(errorHandler)
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

const port =3000
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});