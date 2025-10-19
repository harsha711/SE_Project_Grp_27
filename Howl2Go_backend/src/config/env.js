import dotenv from 'dotenv';

dotenv.config();

const rawPort = process.env.PORT ?? '4000';
const parsedPort = Number.parseInt(rawPort, 10);

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.isNaN(parsedPort) ? 4000 : parsedPort,
  mongodbUri: process.env.MONGODB_URI,
};

export default env;
