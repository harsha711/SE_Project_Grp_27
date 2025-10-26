# Developer Setup Guide - Howl2Go Project

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Repository Setup](#2-repository-setup)
3. [Environment Configuration](#3-environment-configuration)
4. [MongoDB Setup](#4-mongodb-setup)
5. [Groq API Setup](#5-groq-api-setup)
6. [Backend Setup](#6-backend-setup)
7. [Frontend Setup](#7-frontend-setup)
8. [Database Seeding](#8-database-seeding)
9. [Testing Setup](#9-testing-setup)
10. [IDE Configuration](#10-ide-configuration)
11. [Development Workflow](#11-development-workflow)
12. [Debugging](#12-debugging)
13. [Code Style](#13-code-style)
14. [Common Issues & Solutions](#14-common-issues--solutions)

---

## 1. Prerequisites

Before you begin, ensure you have the following software installed on your machine:

### Required Software

#### Node.js and npm
- **Node.js:** Version 18.0.0 or higher
- **npm:** Version 9.0.0 or higher

**Installation:**
```bash
# Check if Node.js is installed
node --version  # Should output v18.0.0 or higher

# Check npm version
npm --version   # Should output 9.0.0 or higher
```

**Download from:** https://nodejs.org/ (LTS version recommended)

**Verification:**
```bash
# After installation, verify both are working
node -v
npm -v
```

#### Git
- **Version:** 2.30 or higher

**Installation:**
```bash
# Check if Git is installed
git --version

# Download from: https://git-scm.com/downloads
```

#### MongoDB
You need either:
- **MongoDB Atlas** (Cloud - Recommended for development)
- **MongoDB Community Server** (Local installation)

We'll cover both options in [Section 4: MongoDB Setup](#4-mongodb-setup).

### Optional but Recommended

#### Visual Studio Code
- Latest stable version
- Download from: https://code.visualstudio.com/

#### Python (for LLM testing)
- **Version:** 3.8 or higher
- Only needed if testing LLM features locally
- Download from: https://www.python.org/downloads/

---

## 2. Repository Setup

### Clone the Repository

```bash
# Clone the repository
git clone https://github.com/harsha711/SE_Project_Grp_27.git

# Navigate to the project directory
cd SE_Project_Grp_27

# Navigate to Proj 2 (main project folder)
cd "Proj 2"
```

### Understand the Branch Structure

```bash
# View all branches
git branch -a

# The main branches you'll work with:
# - main: Production-ready code
# - frontend: Frontend development
# - backend: Backend development
```

### Current Project Structure

```
Proj 2/
├── Howl2Go_backend/          # Express.js API Server
│   ├── src/
│   │   ├── app.js            # Express app configuration
│   │   ├── server.js         # Server entry point
│   │   ├── config/           # Configuration files
│   │   │   └── database.js   # MongoDB connection config
│   │   ├── controllers/      # Request handlers
│   │   │   └── food.controller.js
│   │   ├── routes/           # API routes
│   │   │   └── food.routes.js
│   │   ├── middleware/       # Custom middleware
│   │   │   └── llm.middleware.js
│   │   ├── services/         # Business logic
│   │   │   └── llm.service.js
│   │   ├── models/           # Database models
│   │   │   └── FastFoodItem.js
│   │   ├── scripts/          # Utility scripts
│   │   │   └── importFastFoodData.js
│   │   └── __tests__/        # Backend tests
│   ├── .env.example          # Environment template
│   ├── .env                  # Your environment variables (DO NOT COMMIT)
│   ├── package.json
│   └── README.md
│
├── Howl2Go_frontend/         # Next.js React App
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx          # Home page
│   │   ├── layout.tsx        # Root layout
│   │   ├── globals.css       # Global styles
│   │   ├── search/           # Search results page
│   │   ├── login/            # Login page
│   │   └── dashboard/        # User dashboard
│   ├── components/           # React components
│   ├── types/                # TypeScript type definitions
│   ├── public/               # Static assets
│   ├── eslint.config.mjs     # ESLint configuration
│   ├── next.config.ts        # Next.js configuration
│   ├── tailwind.config.ts    # Tailwind CSS configuration
│   ├── tsconfig.json         # TypeScript configuration
│   ├── package.json
│   └── README.md
│
├── Howl2Go_LLM/              # LLM Testing Scripts
│   ├── test_groq.py          # Groq API tests
│   └── llama_test.py         # Local Llama tests
│
├── docs/                     # Documentation
│   ├── DEVELOPER_SETUP.md    # This file
│   ├── GETTING_STARTED.md    # User guide
│   ├── screenshots/          # UI screenshots
│   └── diagrams/             # Architecture diagrams
│
└── README.md                 # Project overview
```

---

## 3. Environment Configuration

The project requires environment variables for sensitive data like API keys and database credentials. **Never commit `.env` files to version control.**

### Backend Environment Variables

#### Step 1: Create `.env` file

Navigate to the backend directory and create your environment file:

```bash
cd Howl2Go_backend

# Copy the example template
cp .env.example .env

# Open .env in your editor
# Windows:
notepad .env

# Mac/Linux:
nano .env
# or
code .env  # if using VS Code
```

#### Step 2: Configure Backend `.env`

Edit the `.env` file with your actual values:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Configuration
# Replace with your actual MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/howl2go?retryWrites=true&w=majority

# Groq API Configuration
# Get your API key from https://console.groq.com
GROQ_API_KEY=gsk_your_actual_api_key_here
```

**Detailed Explanation of Each Variable:**

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `PORT` | Port number for the backend server | `4000` | Yes |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` | Yes |
| `MONGODB_URI` | MongoDB connection string (Atlas or local) | See [MongoDB Setup](#4-mongodb-setup) | Yes |
| `GROQ_API_KEY` | API key for Groq LLM service | See [Groq API Setup](#5-groq-api-setup) | Yes |

### Frontend Environment Variables (Optional)

The frontend can optionally use environment variables:

```bash
cd Howl2Go_frontend

# Create .env.local file
touch .env.local

# Edit the file
code .env.local
```

Add the following (if needed):

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Optional: Analytics or other services
# NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

**Note:** In Next.js, environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in browser-side code.

### Environment File Security

The project uses **pre-commit hooks** to prevent accidentally committing `.env` files:

```bash
# These files are already in .gitignore:
.env
*.env
.env.local
.env.production
```

**If you accidentally stage a `.env` file:**
```bash
# The pre-commit hook will block the commit with:
❌ ERROR: .env file detected in commit!
Never commit .env files. Use .env.example instead.

# Fix by unstaging:
git reset HEAD .env
```

---

## 4. MongoDB Setup

You have two options for MongoDB: **Cloud (MongoDB Atlas)** or **Local Installation**. MongoDB Atlas is recommended for ease of setup.

### Option A: MongoDB Atlas (Cloud - Recommended)

#### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"** or **"Sign Up"**
3. Create account with email or Google/GitHub login
4. Complete email verification

#### Step 2: Create a New Cluster

1. **Choose a cluster tier:**
   - Select **"Free Shared"** (M0 - Free Forever)

2. **Choose a cloud provider & region:**
   - Provider: AWS, Google Cloud, or Azure (any is fine)
   - Region: Choose closest to your location for better latency

3. **Name your cluster:**
   - Example: `howl2go-dev-cluster`

4. Click **"Create Cluster"** (takes 3-5 minutes)

#### Step 3: Create Database User

1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create credentials:
   ```
   Username: howl2go_user
   Password: <generate strong password>
   ```
   **Save these credentials securely!**
5. Set **Database User Privileges** to **"Read and write to any database"**
6. Click **"Add User"**

#### Step 4: Configure Network Access

1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"**
   - IP Address: `0.0.0.0/0` (this allows all IPs - OK for development)
   - **For production:** Add only specific IP addresses
4. Click **"Confirm"**

#### Step 5: Get Connection String

1. Go to **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select:
   - Driver: **Node.js**
   - Version: **5.5 or later**
5. Copy the connection string:
   ```
   mongodb+srv://howl2go_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Important:** Replace `<password>` with your actual password
7. Add database name after `.net/`: `/howl2go`

**Final connection string example:**
```
mongodb+srv://howl2go_user:MySecurePass123@cluster0.ab1cd.mongodb.net/howl2go?retryWrites=true&w=majority
```

#### Step 6: Add to `.env` File

```env
MONGODB_URI=mongodb+srv://howl2go_user:MySecurePass123@cluster0.ab1cd.mongodb.net/howl2go?retryWrites=true&w=majority
```

#### Step 7: Test Connection

```bash
# From the backend directory
cd Howl2Go_backend

# Start the server
npm run dev

# You should see:
✅ MongoDB connected successfully
Server running on port 4000
```

### Option B: Local MongoDB Installation

#### For Windows:

1. **Download MongoDB Community Server:**
   - Go to https://www.mongodb.com/try/download/community
   - Select Windows, current version, MSI installer
   - Download and run installer

2. **Installation steps:**
   - Choose "Complete" installation
   - Install as Windows Service
   - Use default data directory: `C:\Program Files\MongoDB\Server\7.0\data`

3. **Start MongoDB:**
   ```bash
   # MongoDB should start automatically as a service
   # Verify it's running:
   net start MongoDB
   ```

4. **Connection string for local:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/howl2go
   ```

#### For Mac (using Homebrew):

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify it's running
brew services list
```

**Connection string:**
```env
MONGODB_URI=mongodb://localhost:27017/howl2go
```

#### For Linux (Ubuntu/Debian):

```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

**Connection string:**
```env
MONGODB_URI=mongodb://localhost:27017/howl2go
```

---

## 5. Groq API Setup

Groq provides free access to the Llama 3.1 LLM model for natural language processing.

### Step 1: Create Groq Account

1. Go to https://console.groq.com
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up with:
   - Email and password, OR
   - GitHub account, OR
   - Google account

### Step 2: Generate API Key

1. After signing in, go to **"API Keys"** in the left sidebar
2. Click **"Create API Key"**
3. Give it a name:
   ```
   Name: Howl2Go Development
   ```
4. Click **"Create"**
5. **Copy the API key immediately** (you won't see it again!)
   ```
   gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 3: Add to `.env` File

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Understanding Groq Rate Limits

**Free Tier Limits:**
- **Requests:** 30 requests per minute
- **Tokens:** 6,000 tokens per minute
- **Models available:** Llama 3.1 8B, Llama 3.1 70B, Mixtral 8x7B

**For development:** The free tier is more than sufficient.

**If you hit rate limits:**
```bash
# Error message:
429 Too Many Requests - Rate limit exceeded

# Solution: Wait 60 seconds or implement retry logic
```

### Testing Your API Key

```bash
# From backend directory
cd Howl2Go_backend

# Create a test script
node -e "
import('groq-sdk').then(Groq => {
  const groq = new Groq.default({ apiKey: process.env.GROQ_API_KEY });
  groq.chat.completions.create({
    messages: [{ role: 'user', content: 'Hello!' }],
    model: 'llama-3.1-8b-instant'
  }).then(response => {
    console.log('✅ Groq API is working!');
    console.log('Response:', response.choices[0].message.content);
  }).catch(err => {
    console.error('❌ Groq API error:', err.message);
  });
});
"
```

---

## 6. Backend Setup

### Step 1: Navigate to Backend Directory

```bash
# From Proj 2 directory
cd Howl2Go_backend
```

### Step 2: Install Dependencies

```bash
# Install all dependencies from package.json
npm install

# This will install:
# - express: Web framework
# - mongoose: MongoDB ODM
# - groq-sdk: LLM integration
# - cors: Cross-origin requests
# - dotenv: Environment variables
# - morgan: HTTP request logger
# - csv-parser: CSV file parsing
# - nodemon: Development auto-reload (dev dependency)
# - supertest: API testing (dev dependency)
# - husky: Git hooks (dev dependency)
# - lint-staged: Pre-commit linting (dev dependency)
```

**Expected output:**
```
added 150 packages, and audited 151 packages in 15s
found 0 vulnerabilities
```

### Step 3: Verify `.env` Configuration

```bash
# Check that .env file exists and has all required variables
cat .env

# Should show:
# PORT=4000
# NODE_ENV=development
# MONGODB_URI=mongodb+srv://...
# GROQ_API_KEY=gsk_...
```

### Step 4: Start Development Server

```bash
# Start server with auto-reload
npm run dev
```

**Expected output:**
```
[nodemon] 3.1.10
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node src/server.js`
✅ MongoDB connected successfully
🚀 Server is running on port 4000
📍 http://localhost:4000
```

### Step 5: Test Backend API

**Test Health Endpoint:**
```bash
# In a new terminal window
curl http://localhost:4000/api/health

# Expected response:
{
  "status": "ok",
  "message": "Food Delivery API is running",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "development"
}
```

**Test LLM Parse Endpoint:**
```bash
curl -X POST http://localhost:4000/api/food/parse \
  -H "Content-Type: application/json" \
  -d '{"query": "I want a high protein meal"}'

# Expected response:
{
  "success": true,
  "query": "I want a high protein meal",
  "criteria": {
    "protein": {
      "min": 20
    }
  },
  "message": "Query parsed successfully"
}
```

### Backend Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload (uses nodemon) |
| `npm start` | Start production server (no hot-reload) |
| `npm test` | Run all tests with Node.js test runner |
| `npm run import:fastfood` | Import fast food nutrition data from CSV |

---

## 7. Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
# From Proj 2 directory
cd Howl2Go_frontend
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# This will install:
# - next: React framework
# - react: UI library
# - react-dom: React DOM bindings
# - typescript: Type safety
# - tailwindcss: Utility-first CSS
# - framer-motion: Animation library
# - lucide-react: Icon library
# - eslint: Code linting (dev dependency)
```

**Expected output:**
```
added 300+ packages, and audited 301 packages in 30s
found 0 vulnerabilities
```

### Step 3: Configure Environment (Optional)

```bash
# Create .env.local if needed
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local
```

### Step 4: Start Development Server

```bash
# Start Next.js development server with Turbopack
npm run dev
```

**Expected output:**
```
▲ Next.js 15.5.5
- Local:        http://localhost:3000
- Turbopack (alpha) is enabled

✓ Starting...
✓ Ready in 2.5s
```

### Step 5: Test Frontend

1. **Open your browser:**
   - Navigate to http://localhost:3000

2. **You should see:**
   - Howl2Go home page with hero section
   - Search bar with placeholder text
   - Animated logo and typewriter effect

3. **Test search functionality:**
   - Type: "high protein low carb meal"
   - Click search
   - Should navigate to results page

### Frontend Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm start` | Start production server (run `build` first) |
| `npm run lint` | Run ESLint to check code quality |

### Verify Both Servers are Running

```bash
# Terminal 1 - Backend
cd "Proj 2/Howl2Go_backend"
npm run dev
# Running on http://localhost:4000

# Terminal 2 - Frontend
cd "Proj 2/Howl2Go_frontend"
npm run dev
# Running on http://localhost:3000
```

---

## 8. Database Seeding

The project includes a fast food nutrition database with 1,148+ items from major chains.

### Understanding the Data

**Data source:** `data/fast-food/FastFoodNutritionMenuV3.csv`

**Included restaurants:**
- McDonald's
- Burger King
- Wendy's
- KFC
- Taco Bell
- Chick-fil-A (if available)

**Nutritional fields:**
- Calories, Protein, Carbs, Fats
- Fiber, Sugars, Sodium
- Cholesterol, Saturated Fat, Trans Fat
- Weight Watchers Points

### Step 1: Verify CSV File Exists

```bash
# From Proj 2 directory
ls -lh data/fast-food/FastFoodNutritionMenuV3.csv

# If file doesn't exist, contact project maintainer
```

### Step 2: Import Data

```bash
# From backend directory
cd Howl2Go_backend

# Run import script
npm run import:fastfood
```

**Expected output:**
```
Connected to MongoDB
Cleared existing fast food items

First row data (for debugging):
Available columns: [ 'Company', 'Item', 'Calories', 'Calories from Fat', ... ]
Sample values: { Company: "McDonald's", Item: 'Egg McMuffin', ... }

Parsed 1148 items from CSV

Sample parsed item:
{
  "company": "McDonald's",
  "item": "Egg McMuffin",
  "calories": 300,
  "caloriesFromFat": 110,
  "totalFat": 13,
  "saturatedFat": 5,
  "transFat": 0,
  "cholesterol": 260,
  "sodium": 750,
  "carbs": 30,
  "fiber": 4,
  "sugars": 3,
  "protein": 17,
  "weightWatchersPoints": 7
}

✅ Successfully imported 1148 fast food items

Companies in database: 6
  - McDonald's
  - Burger King
  - Wendy's
  - KFC
  - Taco Bell
  - Chick-fil-A

Sample items with nutrition data:
  - McDonald's: Egg McMuffin
    Calories: 300, Protein: 17g, Carbs: 30g
  ...
```

### Step 3: Verify Data in MongoDB

**Using MongoDB Compass (GUI):**
1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect using your connection string
3. Browse to `howl2go` database → `fastfooditems` collection
4. You should see 1,148 documents

**Using MongoDB Shell:**
```bash
# Connect to MongoDB
mongosh "mongodb+srv://your-connection-string"

# Use howl2go database
use howl2go

# Count documents
db.fastfooditems.countDocuments()
# Should return: 1148

# View sample document
db.fastfooditems.findOne()

# View companies
db.fastfooditems.distinct("company")
```

**Using Backend API:**
```bash
# Search for items
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{"query": "all items", "limit": 5}'
```

### Adding Custom Test Data

If you want to add custom food items for testing:

```javascript
// In MongoDB shell or using Compass
db.fastfooditems.insertOne({
  company: "My Restaurant",
  item: "Custom Salad",
  calories: 250,
  caloriesFromFat: 80,
  totalFat: 9,
  saturatedFat: 2,
  transFat: 0,
  cholesterol: 30,
  sodium: 400,
  carbs: 20,
  fiber: 8,
  sugars: 5,
  protein: 25,
  weightWatchersPoints: 5
})
```

---

## 9. Testing Setup

The backend includes comprehensive tests using Node.js built-in test runner.

### Test Structure

```
src/__tests__/
├── health.test.js                      # API health endpoint tests
├── food.controller.test.js             # Controller unit tests
├── food.routes.integration.test.js     # Route integration tests
├── llm.service.test.js                 # LLM service tests
└── llm.middleware.test.js              # LLM middleware tests
```

### Running Tests

```bash
# From backend directory
cd Howl2Go_backend

# Run all tests
npm test

# Run with verbose output
npm test -- --verbose

# Run specific test file
npm test -- src/__tests__/health.test.js

# Run tests in watch mode (re-run on file changes)
npm test -- --watch
```

**Expected output:**
```
✓ Health endpoint returns OK status (5ms)
✓ Parse query endpoint extracts criteria (120ms)
✓ Search endpoint returns results (200ms)
✓ LLM service parses natural language (150ms)
✓ MongoDB query builder creates correct filters (2ms)

5 tests passed
0 tests failed
Duration: 1.2s
```

### Writing Tests

**Example test structure:**

```javascript
// src/__tests__/example.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../app.js';

describe('API Tests', () => {
  before(async () => {
    // Setup before tests
    console.log('Setting up tests...');
  });

  after(async () => {
    // Cleanup after tests
    console.log('Cleaning up tests...');
  });

  it('should return health status', async () => {
    const response = await request(app).get('/api/health');

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.status, 'ok');
  });

  it('should search for food items', async () => {
    const response = await request(app)
      .post('/api/food/search')
      .send({ query: 'high protein' });

    assert.strictEqual(response.status, 200);
    assert.ok(response.body.results);
    assert.ok(response.body.results.length > 0);
  });
});
```

### Test Coverage (Future Enhancement)

To add test coverage:

```bash
# Install coverage tool (not yet in project)
npm install --save-dev c8

# Add to package.json scripts:
{
  "scripts": {
    "test:coverage": "c8 npm test"
  }
}

# Run with coverage
npm run test:coverage
```

### Frontend Testing (To Be Implemented)

Currently, frontend tests are not implemented. Here's how to add them:

```bash
cd Howl2Go_frontend

# Install testing libraries
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom

# Add test script to package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

---

## 10. IDE Configuration

### Visual Studio Code (Recommended)

#### Recommended Extensions

Install these extensions for the best development experience:

**Essential:**
```
1. ESLint (dbaeumer.vscode-eslint)
   - Real-time JavaScript/TypeScript linting

2. Prettier - Code formatter (esbenp.prettier-vscode)
   - Automatic code formatting

3. ES7+ React/Redux/React-Native snippets (dsznajder.es7-react-js-snippets)
   - React code snippets

4. Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
   - Autocomplete for Tailwind classes

5. MongoDB for VS Code (mongodb.mongodb-vscode)
   - MongoDB database explorer
```

**Highly Recommended:**
```
6. GitLens (eamodio.gitlens)
   - Enhanced Git integration

7. Thunder Client (rangav.vscode-thunder-client)
   - API testing tool (alternative to Postman)

8. Error Lens (usernamehw.errorlens)
   - Inline error highlighting

9. Auto Rename Tag (formulahendry.auto-rename-tag)
   - Auto rename paired HTML/JSX tags

10. Path Intellisense (christian-kohler.path-intellisense)
    - Autocomplete for file paths
```

#### Workspace Settings

Create `.vscode/settings.json` in the project root:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "files.exclude": {
    "**/node_modules": true,
    "**/.next": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/package-lock.json": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

#### Launch Configuration for Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Backend: Debug",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/Proj 2/Howl2Go_backend",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Frontend: Debug",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/Proj 2/Howl2Go_frontend",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Backend: Run Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test"],
      "cwd": "${workspaceFolder}/Proj 2/Howl2Go_backend",
      "console": "integratedTerminal"
    }
  ]
}
```

#### Code Snippets

Create `.vscode/howl2go.code-snippets`:

```json
{
  "Express Route Handler": {
    "prefix": "exroute",
    "body": [
      "export const ${1:handlerName} = async (req, res) => {",
      "  try {",
      "    ${2:// Your code here}",
      "    res.status(200).json({",
      "      success: true,",
      "      data: ${3:result}",
      "    });",
      "  } catch (error) {",
      "    console.error('${1:handlerName} error:', error);",
      "    res.status(500).json({",
      "      success: false,",
      "      error: error.message",
      "    });",
      "  }",
      "};"
    ],
    "description": "Express route handler with error handling"
  },
  "React Component": {
    "prefix": "rfc",
    "body": [
      "interface ${1:ComponentName}Props {",
      "  ${2:// props}",
      "}",
      "",
      "export default function ${1:ComponentName}({ ${2} }: ${1:ComponentName}Props) {",
      "  return (",
      "    <div>",
      "      ${3:// component content}",
      "    </div>",
      "  );",
      "}"
    ],
    "description": "React functional component with TypeScript"
  }
}
```

---

## 11. Development Workflow

### Git Workflow

The project follows a **feature branch workflow** with pre-commit hooks for code quality.

#### Branch Naming Convention

```bash
# Feature branches
feature/search-functionality
feature/user-authentication
feature/food-recommendations

# Bug fixes
bugfix/search-api-timeout
bugfix/mobile-layout-issue

# Hotfixes (for production)
hotfix/critical-security-patch

# Documentation
docs/update-readme
docs/api-documentation
```

#### Step-by-Step Workflow

**1. Create a new feature branch:**

```bash
# Always start from main
git checkout main
git pull origin main

# Create your feature branch
git checkout -b feature/your-feature-name
```

**2. Make your changes:**

```bash
# Edit files as needed
code src/controllers/food.controller.js

# Check what you've changed
git status
git diff
```

**3. Stage and commit:**

```bash
# Stage specific files
git add src/controllers/food.controller.js

# Or stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add nutritional filtering to search API

- Added min/max filters for protein, carbs, fat
- Updated controller to parse filter parameters
- Added validation for filter values
- Updated tests to cover new functionality"
```

**4. Pre-commit hooks will run automatically:**

```bash
🔍 Running pre-commit checks...
🔐 Checking for secrets and API keys...
📦 Checking for large files...
✨ Running lint-staged...
✅ Pre-commit checks passed!

[feature/your-feature-name abc123d] feat: Add nutritional filtering
 1 file changed, 45 insertions(+), 5 deletions(-)
```

**5. Push to remote:**

```bash
# First push of new branch
git push -u origin feature/your-feature-name

# Subsequent pushes
git push
```

**6. Create Pull Request:**

```bash
# On GitHub, click "Compare & pull request"
# Or use GitHub CLI:
gh pr create --title "Add nutritional filtering to search API" \
  --body "This PR adds min/max filtering for nutritional values"
```

### Commit Message Conventions

Follow **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build config)

**Examples:**

```bash
# Feature
git commit -m "feat(search): Add natural language query parsing"

# Bug fix
git commit -m "fix(api): Handle empty search results correctly"

# Documentation
git commit -m "docs: Update MongoDB setup instructions"

# Refactor
git commit -m "refactor(controller): Extract validation logic to middleware"

# Test
git commit -m "test(llm): Add unit tests for query parser"

# Chore
git commit -m "chore(deps): Update Express to v5.1.0"
```

### Pre-commit Hooks

The project uses **Husky** to run checks before commits:

**What gets checked:**
1. **Secret detection** - Blocks commits with API keys
2. **`.env` file detection** - Prevents committing environment files
3. **Large file detection** - Blocks files over 50MB
4. **Lint-staged** - Runs linters on staged files

**If a check fails:**

```bash
❌ ERROR: Potential API key detected!
File: src/config/api.js
Please remove secrets before committing.

# Fix the issue, then commit again
```

**To bypass hooks (emergency only):**

```bash
# NOT RECOMMENDED - only for emergencies
git commit --no-verify -m "Emergency hotfix"
```

---

## 12. Debugging

### Backend Debugging

#### Using VS Code Debugger

1. **Set breakpoints:**
   - Click in the gutter next to line numbers in your code
   - Red dot appears indicating breakpoint

2. **Start debugging:**
   - Press `F5` or go to Run → Start Debugging
   - Select "Backend: Debug" configuration
   - Server starts in debug mode

3. **Debug controls:**
   - `F5`: Continue
   - `F10`: Step Over
   - `F11`: Step Into
   - `Shift+F11`: Step Out
   - `Shift+F5`: Stop

4. **Inspect variables:**
   - Hover over variables to see values
   - Use Debug Console to evaluate expressions
   - Check Variables panel for local/global scope

#### Using Console Logging

```javascript
// Basic logging
console.log('User query:', req.body.query);

// Structured logging
console.log({
  timestamp: new Date().toISOString(),
  method: req.method,
  path: req.path,
  query: req.body.query
});

// Error logging
console.error('Database error:', error);
console.error('Stack trace:', error.stack);

// Pretty print objects
console.log(JSON.stringify(result, null, 2));
```

#### Using Morgan for HTTP Logging

Already configured in the backend:

```javascript
// In src/app.js
import morgan from 'morgan';

app.use(morgan('dev'));
// Logs: GET /api/food/search 200 5.234 ms - 1245
```

**Morgan formats:**
- `dev`: Colored output for development
- `combined`: Apache combined log format
- `common`: Apache common log format
- `short`: Shorter than default
- `tiny`: Minimal output

#### Debugging MongoDB Queries

```javascript
// Enable Mongoose debug mode
import mongoose from 'mongoose';

mongoose.set('debug', true);

// Now all queries are logged:
// Mongoose: fastfooditems.find({ protein: { '$gte': 20 } }) {}
```

#### Common Debugging Scenarios

**Debug LLM query parsing:**

```javascript
// In src/services/llm.service.js
export async function parseFoodQuery(query) {
  console.log('🔍 Parsing query:', query);

  const response = await groq.chat.completions.create({...});

  console.log('🤖 LLM response:', response.choices[0].message.content);

  const criteria = JSON.parse(response.choices[0].message.content);
  console.log('📋 Parsed criteria:', criteria);

  return criteria;
}
```

**Debug API request:**

```javascript
// In controller
export const searchFood = async (req, res) => {
  console.log('📥 Request body:', req.body);
  console.log('📋 Query params:', req.query);
  console.log('🔑 Headers:', req.headers);

  // ... rest of handler
};
```

### Frontend Debugging

#### Using React Developer Tools

1. **Install extension:**
   - Chrome: React Developer Tools
   - Firefox: React Developer Tools

2. **Inspect components:**
   - Open DevTools (F12)
   - Go to "Components" tab
   - Browse component tree
   - Inspect props, state, hooks

#### Using Browser DevTools

```javascript
// Console logging in components
export default function SearchPage() {
  const [results, setResults] = useState([]);

  // Debug state changes
  useEffect(() => {
    console.log('Results updated:', results);
  }, [results]);

  const handleSearch = async (query) => {
    console.log('Searching for:', query);

    const response = await fetch('/api/food/search', {
      method: 'POST',
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    console.log('Search results:', data);

    setResults(data.results);
  };

  // ...
}
```

#### Network Debugging

1. **Open DevTools** → Network tab
2. **Filter by:** Fetch/XHR
3. **Inspect API calls:**
   - Click on request
   - View Headers, Payload, Response
   - Check timing information

#### Next.js Specific Debugging

```javascript
// Enable verbose logging
// In next.config.ts
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};
```

---

## 13. Code Style

### JavaScript/TypeScript Style Guide

The project uses **ESLint** and **Prettier** for consistent code style.

#### ESLint Configuration

Backend uses standard JavaScript style:
```javascript
// Automatically checked on commit via lint-staged
```

Frontend uses Next.js ESLint config:
```javascript
// eslint.config.mjs
export default [
  ...compat.extends("next/core-web-vitals", "next/typescript")
];
```

#### Formatting Rules

**Indentation:** 2 spaces (not tabs)
```javascript
// ✅ Correct
function example() {
  if (condition) {
    doSomething();
  }
}

// ❌ Wrong (4 spaces or tabs)
function example() {
    if (condition) {
        doSomething();
    }
}
```

**Quotes:** Single quotes for JavaScript, double for JSON
```javascript
// ✅ Correct
const message = 'Hello world';
import { Router } from 'express';

// ❌ Wrong
const message = "Hello world";
```

**Semicolons:** Required
```javascript
// ✅ Correct
const x = 5;
console.log(x);

// ❌ Wrong
const x = 5
console.log(x)
```

**Line Length:** 80-100 characters (soft limit)

#### Naming Conventions

**Files:**
```
camelCase.js        - for utilities/helpers
PascalCase.tsx      - for React components
kebab-case.css      - for CSS files
UPPERCASE.md        - for documentation
```

**Variables and Functions:**
```javascript
// camelCase for variables and functions
const userName = 'John';
function calculateTotal() {}

// PascalCase for classes and components
class UserProfile {}
export default function SearchPage() {}

// UPPER_SNAKE_CASE for constants
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'http://localhost:4000';
```

**Database Models:**
```javascript
// PascalCase, singular
const User = mongoose.model('User', userSchema);
const FastFoodItem = mongoose.model('FastFoodItem', schema);
```

#### Code Organization

**Import order:**
```javascript
// 1. External dependencies
import express from 'express';
import mongoose from 'mongoose';

// 2. Internal modules
import { parseFoodQuery } from '../services/llm.service.js';
import FastFoodItem from '../models/FastFoodItem.js';

// 3. Types (if TypeScript)
import type { Request, Response } from 'express';

// 4. CSS/Assets
import './styles.css';
```

**Function order:**
```javascript
// 1. Exports at top
export const mainFunction = () => {};

// 2. Helper functions below
const helperFunction = () => {};

// 3. Constants at top or near usage
const CONFIG = {};
```

#### Comments

**Use JSDoc for functions:**
```javascript
/**
 * Search for food items based on natural language query
 * @param {string} query - Natural language search query
 * @param {number} limit - Maximum number of results
 * @param {number} page - Page number for pagination
 * @returns {Promise<Object>} Search results with pagination
 */
export async function searchFoodItems(query, limit, page) {
  // Implementation
}
```

**Inline comments for clarity:**
```javascript
// Calculate calories from fat (1g fat = 9 calories)
const caloriesFromFat = totalFat * 9;

// TODO: Implement caching for frequent queries
const results = await fetchResults(query);

// FIXME: This breaks with empty arrays
const first = array[0];
```

### Running Linters

**Backend:**
```bash
# Lint is run automatically on commit via lint-staged
# Manual run (when set up):
npm run lint
```

**Frontend:**
```bash
cd Howl2Go_frontend

# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

---

## 14. Common Issues & Solutions

### Installation Issues

#### Issue: `npm install` fails with EACCES error

**Error:**
```
npm ERR! code EACCES
npm ERR! syscall mkdir
npm ERR! path /usr/local/lib/node_modules
npm ERR! errno -13
```

**Solution:**
```bash
# Option 1: Use npx for global packages
npx nodemon src/server.js

# Option 2: Configure npm to use different directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Option 3: Fix permissions (not recommended)
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

#### Issue: `npm install` is slow

**Solution:**
```bash
# Use npm ci for faster, reproducible installs
npm ci

# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Backend Issues

#### Issue: "GROQ_API_KEY is not set"

**Error:**
```
Error: GROQ_API_KEY environment variable is required
```

**Solution:**
```bash
# 1. Verify .env file exists
ls -la Howl2Go_backend/.env

# 2. Check .env contents
cat Howl2Go_backend/.env | grep GROQ_API_KEY

# 3. Ensure no spaces around =
# ✅ Correct: GROQ_API_KEY=gsk_xxx
# ❌ Wrong: GROQ_API_KEY = gsk_xxx

# 4. Restart server after editing .env
npm run dev
```

#### Issue: "MongoDB connection failed"

**Error:**
```
MongooseError: Could not connect to MongoDB
```

**Solution:**
```bash
# 1. Check MongoDB URI is correct
cat .env | grep MONGODB_URI

# 2. Verify MongoDB Atlas IP whitelist
# Go to Network Access → Add IP Address → Allow from Anywhere (0.0.0.0/0)

# 3. Test connection string
mongosh "your_mongodb_uri"

# 4. Check credentials are correct (no special characters unescaped)
# If password has special chars, URL encode them:
# @ becomes %40
# : becomes %3A
# # becomes %23

# Example:
# Password: P@ss:word#123
# Encoded: P%40ss%3Aword%23123
```

#### Issue: Port 4000 already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solution:**
```bash
# Option 1: Kill the process using port 4000
# Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:4000 | xargs kill -9

# Option 2: Use different port
# Edit .env:
PORT=4001
```

### Frontend Issues

#### Issue: "Module not found" error

**Error:**
```
Module not found: Can't resolve 'framer-motion'
```

**Solution:**
```bash
# 1. Reinstall dependencies
cd Howl2Go_frontend
rm -rf node_modules package-lock.json
npm install

# 2. Clear Next.js cache
rm -rf .next

# 3. Restart dev server
npm run dev
```

#### Issue: API calls fail with CORS error

**Error:**
```
Access to fetch at 'http://localhost:4000/api/food/search' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Solution:**
```javascript
// Backend should already have CORS enabled
// In src/app.js:
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

#### Issue: Tailwind styles not applying

**Solution:**
```bash
# 1. Check tailwind.config.ts content paths
# Should include:
content: [
  "./app/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
]

# 2. Restart dev server
npm run dev

# 3. Clear browser cache (Cmd/Ctrl + Shift + R)
```

### Database Issues

#### Issue: Data import fails

**Error:**
```
Error reading CSV: ENOENT: no such file or directory
```

**Solution:**
```bash
# 1. Verify CSV file exists
ls -la data/fast-food/FastFoodNutritionMenuV3.csv

# 2. Check path in import script
# Should be relative to script location:
# ../../../data/fast-food/FastFoodNutritionMenuV3.csv

# 3. Run from correct directory
cd Howl2Go_backend
npm run import:fastfood
```

#### Issue: Duplicate key error during import

**Error:**
```
E11000 duplicate key error collection
```

**Solution:**
```bash
# Clear existing data first
mongosh "your_mongodb_uri"

use howl2go
db.fastfooditems.deleteMany({})

# Then re-run import
npm run import:fastfood
```

### Git/Husky Issues

#### Issue: Pre-commit hook not running

**Solution:**
```bash
# 1. Reinstall Husky
rm -rf .husky
npm run prepare

# 2. Make hook executable (Mac/Linux)
chmod +x .husky/pre-commit

# 3. Verify Git hooks are enabled
git config core.hooksPath
# Should output: .husky
```

#### Issue: "Secret detected" false positive

**Solution:**
```bash
# Option 1: Fix the code to not match the pattern
# Instead of: const key = 'gsk_fake_key_example'
# Use: const key = process.env.GROQ_API_KEY

# Option 2: Use --no-verify (document why)
git commit --no-verify -m "docs: Add API key example in documentation"
```

### Performance Issues

#### Issue: Slow API response times

**Solution:**
```javascript
// 1. Check if MongoDB indexes exist
// In MongoDB shell:
db.fastfooditems.getIndexes()

// 2. Create indexes if missing
db.fastfooditems.createIndex({ company: 1, item: 1 })
db.fastfooditems.createIndex({ item: "text", company: "text" })

// 3. Monitor query performance
mongoose.set('debug', true);

// 4. Implement caching (future enhancement)
```

#### Issue: Large package size after build

**Solution:**
```bash
# Analyze bundle size
cd Howl2Go_frontend

# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.ts:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Run analysis
ANALYZE=true npm run build
```

### Need More Help?

**Project Resources:**
- GitHub Issues: https://github.com/harsha711/SE_Project_Grp_27/issues
- API Documentation: [LLM_API_DOCUMENTATION.md](../Howl2Go_backend/LLM_API_DOCUMENTATION.md)
- Getting Started Guide: [GETTING_STARTED.md](GETTING_STARTED.md)

**External Resources:**
- Node.js Docs: https://nodejs.org/docs
- Express.js Docs: https://expressjs.com
- Next.js Docs: https://nextjs.org/docs
- MongoDB Docs: https://docs.mongodb.com
- Groq Docs: https://console.groq.com/docs

**Community:**
- Stack Overflow: Tag questions with `howl2go` or relevant tech stack
- Project Discussions: GitHub Discussions (if enabled)

---

## Summary Checklist

Use this checklist to verify your development environment is set up correctly:

### Initial Setup
- [ ] Node.js 18+ and npm 9+ installed
- [ ] Git installed and configured
- [ ] Repository cloned
- [ ] MongoDB Atlas account created OR local MongoDB installed

### Backend Setup
- [ ] Backend dependencies installed (`npm install`)
- [ ] `.env` file created with all variables
- [ ] MongoDB connection string added
- [ ] Groq API key added
- [ ] Backend server starts successfully (`npm run dev`)
- [ ] Health endpoint returns OK (`curl http://localhost:4000/api/health`)
- [ ] Data imported successfully (`npm run import:fastfood`)

### Frontend Setup
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend server starts successfully (`npm run dev`)
- [ ] Can access home page at http://localhost:3000
- [ ] Search functionality works (makes API calls to backend)

### Testing
- [ ] Backend tests pass (`npm test`)
- [ ] Can run individual test files

### Development Tools
- [ ] VS Code (or preferred IDE) configured
- [ ] Recommended extensions installed
- [ ] ESLint working
- [ ] Git hooks working (try making a test commit)

### Verification
- [ ] Can search for "high protein" and see results
- [ ] Can view food item details
- [ ] API responds within reasonable time (<2s)
- [ ] No console errors in browser or terminal

---

**Congratulations!** You've successfully set up your Howl2Go development environment. You're now ready to start building amazing features!

For next steps, see:
- [Development Workflow](#11-development-workflow)
- [API Documentation](../Howl2Go_backend/LLM_API_DOCUMENTATION.md)
- [Design System](../Howl2Go_frontend/DESIGN_SYSTEM.md)

Happy coding!
