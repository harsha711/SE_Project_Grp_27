# Howl2Go - Quick Start Guide

**Step-by-step instructions to get Howl2Go running on your machine**

---

## 📋 Prerequisites Check

Before starting, ensure you have:

- ✅ **Node.js 18+** installed (`node --version`)
- ✅ **npm 9+** installed (`npm --version`)
- ✅ **Git** installed (`git --version`)
- ✅ **MongoDB Atlas account** OR **Local MongoDB** installed
- ✅ **Groq API key** ([Get one free](https://console.groq.com))

---

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/harsha711/SE_Project_Grp_27.git

# Navigate to the project
cd SE_Project_Grp_27/Proj_2
```

---

### Step 2: Set Up MongoDB

**Option A: MongoDB Atlas (Recommended - Cloud)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Login
3. Create a free cluster (M0 - Free Forever)
4. Create a database user:
   - Username: `howl2go_user`
   - Password: (create a strong password - save it!)
5. Add IP address: Click "Network Access" → "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)
6. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://howl2go_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

**Option B: Local MongoDB**

1. Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Connection string: `mongodb://localhost:27017/howl2go`

---

### Step 3: Get Groq API Key

1. Go to [Groq Console](https://console.groq.com)
2. Sign up/Login (free account)
3. Navigate to "API Keys"
4. Click "Create API Key"
5. Copy the API key (starts with `gsk_...`)

---

### Step 4: Backend Setup

```bash
# Navigate to backend directory
cd Howl2Go_backend

# Install dependencies
npm install

# Create .env file
# On Windows (PowerShell):
New-Item -Path .env -ItemType File

# On Mac/Linux:
touch .env
```

**Edit the `.env` file** and add:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string_here

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here_at_least_32_characters_long
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_at_least_32_characters_long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Session Management
SESSION_SECRET=your_session_secret_key_here_at_least_32_characters_long
SESSION_NAME=howl2go.sid
SESSION_MAX_AGE=86400000

# Groq AI API
GROQ_API_KEY=your_groq_api_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Important Notes:**
- Replace `your_mongodb_connection_string_here` with your actual MongoDB connection string
- Replace `your_groq_api_key_here` with your actual Groq API key
- Generate random strings for JWT_SECRET, JWT_REFRESH_SECRET, and SESSION_SECRET (at least 32 characters)
- You can use this command to generate secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

### Step 5: Import Food Data

```bash
# Make sure you're in Howl2Go_backend directory
cd Howl2Go_backend

# Import fast food data to MongoDB
npm run import:fastfood
```

**Expected Output (with CSV file):**
```
Connecting to MongoDB...
MongoDB Connected: cluster0.xxxxx.mongodb.net
Clearing existing fast food items...
Found CSV file at: .../data/fast-food/FastFoodNutritionMenuV3.csv
Importing from CSV...
Parsed 1148 items from CSV
Importing 1148 items...
✅ Successfully imported 1148 fast food items
```

**Expected Output (without CSV file - uses sample data):**
```
Connecting to MongoDB...
MongoDB Connected: cluster0.xxxxx.mongodb.net
Clearing existing fast food items...
CSV file not found. Using sample data instead.
Note: To import full dataset, place FastFoodNutritionMenuV3.csv in data/fast-food/ directory
Importing 12 items...
✅ Successfully imported 12 fast food items
```

**Note:** 
- If you have a CSV file with fast food data, place it at `Proj_2/data/fast-food/FastFoodNutritionMenuV3.csv`
- If no CSV is found, the script will import 12 sample items from major restaurants
- The sample data is sufficient for testing the application

---

### Step 6: Start Backend Server

```bash
# Make sure you're in Howl2Go_backend directory
npm run dev
```

**Expected Output:**
```
MongoDB Connected: cluster0.xxxxx.mongodb.net
Food Delivery API listening on port 4000 in development mode
```

✅ **Backend is now running on http://localhost:4000**

**Keep this terminal window open!**

---

### Step 7: Frontend Setup

**Open a NEW terminal window** (keep backend running):

```bash
# Navigate to frontend directory
cd SE_Project_Grp_27/Proj_2/Howl2Go_frontend

# Install dependencies
npm install
```

**Create `.env.local` file:**

```bash
# On Windows (PowerShell):
New-Item -Path .env.local -ItemType File

# On Mac/Linux:
touch .env.local
```

**Edit `.env.local` and add:**

```env
BACKEND_URL=http://localhost:4000
```

---

### Step 8: Start Frontend Server

```bash
# Make sure you're in Howl2Go_frontend directory
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 15.5.5
  - Local:        http://localhost:3000
  - ready started server on 0.0.0.0:3000
```

✅ **Frontend is now running on http://localhost:3000**

---

### Step 9: Verify Everything Works

1. **Open your browser** and go to: `http://localhost:3000`

2. **Test the application:**
   - You should see the Howl2Go homepage
   - Try searching for: `"high protein meal"`
   - Results should appear within 2-3 seconds

3. **Test backend API:**
   - Open: `http://localhost:4000/api/health`
   - Should see: `{"status":"ok","service":"food-delivery-backend",...}`

4. **Create an account:**
   - Click "Sign Up" in the navigation
   - Fill in your details
   - You should be automatically logged in

5. **Test search:**
   - Type: `"low calorie burger"`
   - Press Enter
   - You should see search results

---

## ✅ Verification Checklist

- [ ] Backend server running on port 4000
- [ ] Frontend server running on port 3000
- [ ] MongoDB connected (check backend console)
- [ ] Food data imported (1,148+ items)
- [ ] Homepage loads in browser
- [ ] Search functionality works
- [ ] Can create account and login
- [ ] Can add items to cart
- [ ] Can place orders
- [ ] Can view order history
- [ ] Can write reviews

---

## 🎯 Quick Commands Reference

### Backend Commands

```bash
cd Howl2Go_backend

# Install dependencies
npm install

# Start development server
npm run dev

# Import food data
npm run import:fastfood

# Run tests
npm test

# Start production server
npm start
```

### Frontend Commands

```bash
cd Howl2Go_frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: MongoDB connection failed**
```
Error: MongoDB connection failed
```
**Solution:**
- Check your `MONGODB_URI` in `.env` file
- Verify MongoDB Atlas IP whitelist includes your IP (or 0.0.0.0/0)
- Check if password in connection string is correct
- Ensure MongoDB service is running (if local)

**Problem: Port 4000 already in use**
```
Error: Port 4000 is already in use
```
**Solution:**
- Change `PORT=4000` to another port (e.g., `PORT=4001`) in `.env`
- Or stop the process using port 4000

**Problem: Groq API error**
```
Error: GROQ_API_KEY is not set
```
**Solution:**
- Check `GROQ_API_KEY` in `.env` file
- Verify the API key is correct
- Make sure there are no extra spaces or quotes

**Problem: Food data import failed**
```
Error: Failed to import data
```
**Solution:**
- Check MongoDB connection first
- Verify CSV file exists: `data/fast-food/FastFoodNutritionMenuV3.csv`
- Check file permissions

### Frontend Issues

**Problem: Port 3000 already in use**
```
Error: Port 3000 is already in use
```
**Solution:**
- Kill the process: `npx kill-port 3000` (or use Task Manager on Windows)
- Or change port: `npm run dev -- -p 3001`

**Problem: Cannot connect to backend**
```
Error: Failed to fetch
```
**Solution:**
- Verify backend is running on port 4000
- Check `BACKEND_URL` in `.env.local` is `http://localhost:4000`
- Check CORS settings in backend
- Verify no firewall blocking the connection

**Problem: Module not found errors**
```
Error: Cannot find module '...'
```
**Solution:**
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

### General Issues

**Problem: Changes not reflecting**
- **Solution:** 
  - Restart both servers
  - Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
  - Check if hot reload is working

**Problem: Authentication not working**
- **Solution:**
  - Check JWT secrets in backend `.env`
  - Verify tokens are being set in cookies
  - Check browser console for errors

---

## 📝 Environment Variables Summary

### Backend (.env)

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your_32_char_secret_here
JWT_REFRESH_SECRET=your_32_char_secret_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
SESSION_SECRET=your_32_char_secret_here
SESSION_NAME=howl2go.sid
SESSION_MAX_AGE=86400000
GROQ_API_KEY=gsk_your_groq_api_key_here
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
BACKEND_URL=http://localhost:4000
```

---

## 🎉 You're All Set!

Once both servers are running:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Health Check:** http://localhost:4000/api/health

**Start exploring Howl2Go!** 🍔

---

## 📚 Next Steps

- Read the [User Guide](USER_GUIDE.md) to learn all features
- Check [API Documentation](API_DOCUMENTATION.md) for API details
- Review [Features List](FEATURES.md) for complete feature catalog
- See [Developer Setup](DEVELOPER_SETUP.md) for advanced configuration

---

**Need Help?**
- Check [Troubleshooting](#-troubleshooting) section above
- Review [Common Issues](DEVELOPER_SETUP.md#14-common-issues--solutions)
- Open an issue on [GitHub](https://github.com/harsha711/SE_Project_Grp_27/issues)

---

*Last Updated: December 2024*

