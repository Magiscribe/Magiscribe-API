import dotenv from 'dotenv';
import startServer from './server';

// Dotenv configuration
dotenv.config();

const PORT = process.env.PORT || 3000;

startServer(+PORT);
