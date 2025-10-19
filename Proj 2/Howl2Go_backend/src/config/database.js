import mongoose from 'mongoose';
import config from './env.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
