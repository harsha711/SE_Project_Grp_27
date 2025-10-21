import http from 'http';
import app from './app.js';
import env from './config/env.js';
import connectDB from './config/database.js';

const { port, nodeEnv } = env;

// Connect to MongoDB before starting the server
await connectDB();

const server = http.createServer(app);

const onListening = () => {
  console.log(`Food Delivery API listening on port ${port} in ${nodeEnv} mode`);
};

const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${port} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${port} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Closing server gracefully...`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
};

server.listen(port);
server.on('listening', onListening);
server.on('error', onError);

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => gracefulShutdown(signal));
});
