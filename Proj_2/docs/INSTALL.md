# Installation Guide

This guide provides step-by-step instructions for installing and setting up the HOWL2GO application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Backend Installation](#backend-installation)
- [Frontend Installation](#frontend-installation)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before installing HOWL2GO, ensure you have the following installed on your system:

- **Node.js** (v18.0.0 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`

- **npm** (v9.0.0 or higher)
  - Comes with Node.js
  - Verify installation: `npm --version`

- **MongoDB** (v6.0 or higher)
  - Option 1: MongoDB Atlas (cloud-based, recommended)
    - Sign up at: https://www.mongodb.com/cloud/atlas
  - Option 2: Local MongoDB installation
    - Download from: https://www.mongodb.com/try/download/community

- **Git**
  - Download from: https://git-scm.com/
  - Verify installation: `git --version`

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/harsha711/SE_Project_Grp_27.git
cd SE_Project_Grp_27/Proj_2
```

---

## Step 2: Backend Installation

### 2.1 Navigate to Backend Directory

```bash
cd Howl2Go_backend
```

### 2.2 Install Dependencies

```bash
npm install
```

This will install all required backend dependencies including:
- Express.js (web framework)
- Mongoose (MongoDB ODM)
- Groq SDK (LLM integration)
- JWT utilities
- Testing frameworks (Jest)

### 2.3 Configure Environment Variables

Create a `.env` file in the `Howl2Go_backend` directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file and configure the following variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_at_least_32_characters_long
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_at_least_32_characters_long
JWT_REFRESH_EXPIRES_IN=30d

# Session Configuration
SESSION_SECRET=your_session_secret_key_here_at_least_32_characters_long
SESSION_NAME=howl2go.sid
SESSION_MAX_AGE=86400000

# Groq API (for LLM-powered food query parsing)
GROQ_API_KEY=your_groq_api_key

# DoorDash API (optional)
DOORDASH_DEVELOPER_ID=your_developer_id
DOORDASH_KEY_ID=your_key_id
DOORDASH_SIGNING_SECRET=your_signing_secret
```

#### How to Get API Keys:

**MongoDB URI:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Click "Connect" and choose "Connect your application"
4. Copy the connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/database`)

**Groq API Key:**
1. Go to https://console.groq.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy and paste it into your `.env` file

**JWT Secrets:**
- Generate random strings (at least 32 characters)
- Example: `openssl rand -base64 32` (on Linux/Mac)

### 2.4 Import Sample Data

Import the fast food nutrition data into MongoDB:

```bash
npm run import-data
```

This will populate your database with fast food nutrition information from major chains (McDonald's, Burger King, Wendy's, KFC, Taco Bell, Pizza Hut).

---

## Step 3: Frontend Installation

### 3.1 Navigate to Frontend Directory

```bash
# From the backend directory
cd ../Howl2Go_frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

This will install all required frontend dependencies including:
- Next.js 15 (React framework)
- React 19
- Tailwind CSS
- TypeScript
- Axios (HTTP client)

### 3.3 Configure Frontend Environment (Optional)

If your backend runs on a different port or host, create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Step 4: Running the Application

### 4.1 Start the Backend Server

```bash
# In the Howl2Go_backend directory
npm run dev
```

The backend server should start on `http://localhost:4000`

You should see:
```
Server running on port 4000
MongoDB connected successfully
```

### 4.2 Start the Frontend Development Server

Open a new terminal window:

```bash
# In the Howl2Go_frontend directory
npm run dev
```

The frontend should start on `http://localhost:3000`

You should see:
```
▲ Next.js 15.5.5 (Turbopack)
- Local:        http://localhost:3000
✓ Ready in 1277ms
```

### 4.3 Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## Step 5: Verify Installation

### 5.1 Run Backend Tests

```bash
# In the Howl2Go_backend directory
npm test
```

All tests should pass. You should see something like:
```
Test Suites: 10 passed, 10 total
Tests:       146 passed, 146 total
```

### 5.2 Test the API Endpoints

You can test the backend API using tools like:
- **Postman**: https://www.postman.com/
- **Thunder Client** (VS Code extension)
- **curl** (command line)

Example test request:
```bash
curl -X POST http://localhost:4000/api/food/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "I want something with high protein and low calories"}'
```

### 5.3 Test the Frontend

1. Open http://localhost:3000 in your browser
2. Try searching for food items
3. Test natural language queries like:
   - "I want a burger with less than 500 calories"
   - "Show me high protein meals"
   - "Find items with low saturated fat"

---

## Project Structure

```
Proj_2/
├── Howl2Go_backend/          # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic (LLM service)
│   │   ├── middleware/       # Custom middleware
│   │   ├── config/           # Configuration files
│   │   └── __tests__/        # Test files
│   ├── data/                 # Sample data (CSV files)
│   ├── .env                  # Environment variables (create this)
│   └── package.json
│
├── Howl2Go_frontend/         # Frontend (Next.js + React)
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   ├── types/                # TypeScript type definitions
│   ├── public/               # Static assets
│   └── package.json
│
└── docs/                     # Documentation
    ├── INSTALL.md            # This file
    └── CODE_OF_CONDUCT.md    # Code of conduct
```

---

## Troubleshooting

### Backend Issues

**Problem: `GROQ_API_KEY environment variable is not set`**
- Solution: Make sure you've created a `.env` file and added your Groq API key

**Problem: `MongoDB connection failed`**
- Solution: Check your `MONGODB_URI` in the `.env` file
- Ensure your IP is whitelisted in MongoDB Atlas (if using cloud)
- Verify MongoDB service is running (if using local installation)

**Problem: Port 4000 is already in use**
- Solution: Change the `PORT` in your `.env` file to a different port (e.g., 5000)

### Frontend Issues

**Problem: `'next' is not recognized as an internal or external command`**
- Solution: Run `npm install` in the frontend directory first

**Problem: `Cannot connect to backend API`**
- Solution: Ensure the backend server is running on the correct port
- Check `NEXT_PUBLIC_API_URL` in `.env.local` (if configured)

**Problem: Frontend shows CORS errors**
- Solution: The backend CORS is already configured. If issues persist, check that the backend is running and accessible

### General Issues

**Problem: `npm install` fails**
- Solution: Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Problem: Tests are failing**
- Solution: Ensure all dependencies are installed
- Check that `.env` file is properly configured
- Run `npm test` to see detailed error messages

---

## Additional Commands

### Backend Commands

```bash
# Run in development mode with auto-reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Import sample data
npm run import-data

# Start production server
npm start
```

### Frontend Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## Next Steps

After successful installation:

1. **Explore the API**: Check out the API documentation in the backend `routes/` directory
2. **Customize**: Modify the frontend UI in the `components/` directory
3. **Add Features**: Extend functionality by adding new controllers, services, or components

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/harsha711/SE_Project_Grp_27/issues)
2. Review the project's README.md
3. Consult the Code of Conduct for community guidelines

---

## License

This project is developed as part of CSC510 Software Engineering at NCSU (MIT License)
