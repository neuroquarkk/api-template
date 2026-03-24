import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import cookieParser from 'cookie-parser';
import { authRouter } from '../api';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.MorganFormat));
app.use(cookieParser());

app.get('/', (_req, res) => {
    return res.send('Hello from the server');
});

app.use('/api/v1/auth', authRouter);

export default app;
