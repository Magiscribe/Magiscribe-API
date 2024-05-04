import dotenv from 'dotenv';
import startServer from './server';
import config from '@config';

// Dotenv configuration
dotenv.config();

startServer(config.port);
