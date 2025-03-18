import express from 'express';
import bodyParser from 'body-parser';
import authRouter from './routes/authRouter.js';
import cookieParser from 'cookie-parser';

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api/auth",authRouter)
app.get('/', (req, res) => {
  res.send('Hello World');
}); 
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});