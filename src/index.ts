import express, { type Express, type Request, type Response } from 'express';


const app: Express = express();

app.use(express.json());

//app.use('/api', mainRoute)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

const port =3000
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});