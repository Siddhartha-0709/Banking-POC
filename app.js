import express from 'express';
import cors from 'cors';
import customerRoutes from './routes/customer.route.js';
import accountRoutes from './routes/account.route.js';
import transactionRouter from './routes/transaction.route.js';
import authenticationRouter from './routes/authentication.route.js';
import voiceRoutes from './routes/voice.route.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors('*'));

app.get('/', (req, res) => {
    res.send('Welcome to the Banking Application API');
});

app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/account', accountRoutes);
app.use('/api/v1/transaction', transactionRouter);
app.use('/api/v1/auth', authenticationRouter );
app.use('/api/v1/voice',voiceRoutes);


export default app;


