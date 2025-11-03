import dotenv from 'dotenv';

dotenv.config();

const rawPort = process.env.PORT ?? '4000';
const parsedPort = Number.parseInt(rawPort, 10);

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.isNaN(parsedPort) ? 4000 : parsedPort,
  mongodbUri: process.env.MONGODB_URI,
  session: {
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
    name: process.env.SESSION_NAME || 'howl2go.sid',
    maxAge: Number.parseInt(process.env.SESSION_MAX_AGE || '86400000', 10), // 24 hours default
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
  },
};

/**
 * Get environment variable with optional default value
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} Environment variable value
 */
export const getEnvVariable = (key, defaultValue = '') => {
  return process.env[key] || defaultValue;
};

export default config;
