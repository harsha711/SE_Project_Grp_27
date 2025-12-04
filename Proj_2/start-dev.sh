#!/bin/bash

#===============================================================================
# Howl2Go Development Setup Script
#===============================================================================
# This script starts all services needed for local development:
#   1. MongoDB in a Docker container
#   2. Backend API (Express.js on port 4000)
#   3. Frontend (Next.js on port 3000)
#
# Usage:
#   ./start-dev.sh              # Start all services (background)
#   ./start-dev.sh --backend    # Start MongoDB + backend only (foreground)
#   ./start-dev.sh --frontend   # Start frontend only (foreground)
#   ./start-dev.sh --mongo      # Start MongoDB only
#   ./start-dev.sh --stop       # Stop all services
#   ./start-dev.sh --logs       # Show logs from all services
#
# For development with separate terminals:
#   Terminal 1: ./start-dev.sh --mongo    (or --backend will auto-start MongoDB)
#   Terminal 2: ./start-dev.sh --backend  
#   Terminal 3: ./start-dev.sh --frontend 
#
# Prerequisites:
#   - Docker installed and running
#   - Node.js 18+ and npm 9+
#   - GROQ_API_KEY environment variable (for AI features)
#===============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/Howl2Go_backend"
FRONTEND_DIR="$SCRIPT_DIR/Howl2Go_frontend"
MONGO_CONTAINER_NAME="howl2go-mongo"
MONGO_PORT=27017
MONGO_DATA_DIR="$HOME/.howl2go/mongo-data"
PID_DIR="$HOME/.howl2go/pids"
BACKEND_PID_FILE="$PID_DIR/backend.pid"
FRONTEND_PID_FILE="$PID_DIR/frontend.pid"

# Print colored message
print_msg() {
    local color=$1
    local msg=$2
    echo -e "${color}${msg}${NC}"
}

print_header() {
    echo ""
    print_msg "$CYAN" "╔═══════════════════════════════════════════════════════════════╗"
    print_msg "$CYAN" "║                    🐺 Howl2Go Dev Setup                       ║"
    print_msg "$CYAN" "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
}

# Check if a command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_msg "$RED" "❌ $1 is not installed. Please install it first."
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    print_msg "$BLUE" "🔍 Checking prerequisites..."
    
    check_command "docker"
    check_command "node"
    check_command "npm"
    
    # Check Node version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_msg "$RED" "❌ Node.js 18+ required. Current: $(node -v)"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_msg "$RED" "❌ Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_msg "$GREEN" "✅ All prerequisites met!"
}

# Create directories
setup_dirs() {
    mkdir -p "$PID_DIR"
    mkdir -p "$MONGO_DATA_DIR"
}

# Start MongoDB container
start_mongodb() {
    print_msg "$BLUE" "🍃 Starting MongoDB..."
    
    # Check if container already exists
    if docker ps -a --format '{{.Names}}' | grep -q "^${MONGO_CONTAINER_NAME}$"; then
        # Check if it's running
        if docker ps --format '{{.Names}}' | grep -q "^${MONGO_CONTAINER_NAME}$"; then
            print_msg "$YELLOW" "   MongoDB container already running"
        else
            print_msg "$YELLOW" "   Starting existing MongoDB container..."
            docker start "$MONGO_CONTAINER_NAME"
        fi
    else
        # Create and start new container
        docker run -d \
            --name "$MONGO_CONTAINER_NAME" \
            -p $MONGO_PORT:27017 \
            -v "$MONGO_DATA_DIR:/data/db" \
            mongo:latest
        
        print_msg "$GREEN" "   MongoDB container created and started"
    fi
    
    # Wait for MongoDB to be ready
    print_msg "$BLUE" "   Waiting for MongoDB to be ready..."
    for i in {1..30}; do
        if docker exec "$MONGO_CONTAINER_NAME" mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
            print_msg "$GREEN" "✅ MongoDB is ready on port $MONGO_PORT"
            return 0
        fi
        sleep 1
    done
    
    print_msg "$RED" "❌ MongoDB failed to start"
    exit 1
}

# Setup backend environment
setup_backend_env() {
    local ENV_FILE="$BACKEND_DIR/.env"
    
    if [ ! -f "$ENV_FILE" ]; then
        print_msg "$YELLOW" "   Creating backend .env file..."
        cat > "$ENV_FILE" << EOF
PORT=4000
NODE_ENV=development

# Database - Local MongoDB container
MONGODB_URI=mongodb://localhost:27017/howl2go

# JWT Configuration
JWT_SECRET=dev-jwt-secret-key-change-in-production-$(openssl rand -hex 16)
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=dev-jwt-refresh-secret-key-change-in-production-$(openssl rand -hex 16)
JWT_REFRESH_EXPIRES_IN=30d

# Session Configuration
SESSION_SECRET=dev-session-secret-key-change-in-production-$(openssl rand -hex 16)
SESSION_NAME=howl2go.sid
SESSION_MAX_AGE=86400000

# Groq API (Required for AI features)
GROQ_API_KEY=${GROQ_API_KEY:-your_groq_api_key_here}

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
EOF
        print_msg "$GREEN" "   Created $ENV_FILE"
        
        if [ -z "$GROQ_API_KEY" ]; then
            print_msg "$YELLOW" "   ⚠️  GROQ_API_KEY not set. AI features won't work."
            print_msg "$YELLOW" "      Set it with: export GROQ_API_KEY=your_key"
        fi
    else
        print_msg "$GREEN" "   Backend .env already exists"
    fi
}

# Install dependencies
install_dependencies() {
    print_msg "$BLUE" "📦 Installing dependencies..."
    
    # Backend
    print_msg "$BLUE" "   Installing backend dependencies..."
    cd "$BACKEND_DIR"
    npm install --silent
    
    # Frontend
    print_msg "$BLUE" "   Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm install --silent
    
    print_msg "$GREEN" "✅ Dependencies installed"
}

# Import food data
import_data() {
    print_msg "$BLUE" "🍔 Checking food data..."
    
    cd "$BACKEND_DIR"
    
    # Check if data already imported by checking collection count
    COUNT=$(docker exec "$MONGO_CONTAINER_NAME" mongosh --quiet --eval "db.getSiblingDB('howl2go').fastfooditems.countDocuments()" 2>/dev/null || echo "0")
    
    if [ "$COUNT" -gt 1000 ]; then
        print_msg "$GREEN" "   Food data already imported ($COUNT items)"
    else
        print_msg "$BLUE" "   Running data import script..."
        npm run import:fastfood 2>&1 | tail -5
        print_msg "$GREEN" "✅ Food data imported"
    fi
}

# Start backend server
start_backend() {
    print_msg "$BLUE" "🚀 Starting backend server..."
    
    cd "$BACKEND_DIR"
    
    # Kill existing process if running
    if [ -f "$BACKEND_PID_FILE" ]; then
        OLD_PID=$(cat "$BACKEND_PID_FILE")
        if ps -p "$OLD_PID" &> /dev/null; then
            kill "$OLD_PID" 2>/dev/null || true
            sleep 1
        fi
    fi
    
    # Start backend in background
    npm run dev > /dev/null 2>&1 &
    echo $! > "$BACKEND_PID_FILE"
    
    # Wait for backend to be ready
    print_msg "$BLUE" "   Waiting for backend to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
            print_msg "$GREEN" "✅ Backend running on http://localhost:4000"
            return 0
        fi
        sleep 1
    done
    
    print_msg "$RED" "❌ Backend failed to start"
    exit 1
}

# Start frontend server
start_frontend() {
    print_msg "$BLUE" "🎨 Starting frontend server..."
    
    cd "$FRONTEND_DIR"
    
    # Kill existing process if running
    if [ -f "$FRONTEND_PID_FILE" ]; then
        OLD_PID=$(cat "$FRONTEND_PID_FILE")
        if ps -p "$OLD_PID" &> /dev/null; then
            kill "$OLD_PID" 2>/dev/null || true
            sleep 1
        fi
    fi
    
    # Start frontend in background
    npm run dev > /dev/null 2>&1 &
    echo $! > "$FRONTEND_PID_FILE"
    
    # Wait for frontend to be ready
    print_msg "$BLUE" "   Waiting for frontend to be ready..."
    for i in {1..60}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            print_msg "$GREEN" "✅ Frontend running on http://localhost:3000"
            return 0
        fi
        sleep 1
    done
    
    print_msg "$YELLOW" "⚠️  Frontend may still be starting"
}

# Start frontend in foreground (for separate terminal)
start_frontend_foreground() {
    print_msg "$BLUE" "🎨 Starting frontend server (foreground mode)..."
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_msg "$BLUE" "   Installing frontend dependencies..."
        npm install
    fi
    
    print_msg "$GREEN" "✅ Starting Next.js on http://localhost:3000"
    print_msg "$YELLOW" "   Press Ctrl+C to stop"
    echo ""
    
    # Run in foreground so user sees output
    npm run dev
}

# Start backend in foreground (for separate terminal)
start_backend_foreground() {
    print_msg "$BLUE" "🚀 Starting backend server (foreground mode)..."
    
    # Ensure MongoDB is running
    if ! docker ps --format '{{.Names}}' | grep -q "^${MONGO_CONTAINER_NAME}$"; then
        print_msg "$YELLOW" "⚠️  MongoDB container not running. Starting it first..."
        start_mongodb
    fi
    
    cd "$BACKEND_DIR"
    
    # Setup environment
    setup_backend_env
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_msg "$BLUE" "   Installing backend dependencies..."
        npm install
    fi
    
    # Import data if needed
    import_data
    
    print_msg "$GREEN" "✅ Starting Express.js on http://localhost:4000"
    print_msg "$YELLOW" "   Press Ctrl+C to stop"
    echo ""
    
    # Run in foreground so user sees output
    npm run dev
}

# Start MongoDB only
start_mongo_only() {
    print_header
    check_prerequisites
    start_mongodb
    
    echo ""
    print_msg "$GREEN" "✅ MongoDB is running"
    print_msg "$BLUE" "   Connection: mongodb://localhost:${MONGO_PORT}/howl2go"
    print_msg "$YELLOW" "   Run './start-dev.sh --backend' in another terminal for backend"
    print_msg "$YELLOW" "   Run './start-dev.sh --frontend' in another terminal for frontend"
}

# Stop all services
stop_services() {
    print_header
    print_msg "$BLUE" "🛑 Stopping all services..."
    
    # Stop backend
    if [ -f "$BACKEND_PID_FILE" ]; then
        PID=$(cat "$BACKEND_PID_FILE")
        if ps -p "$PID" &> /dev/null; then
            kill "$PID" 2>/dev/null || true
            print_msg "$GREEN" "   Backend stopped"
        fi
        rm -f "$BACKEND_PID_FILE"
    fi
    
    # Stop frontend
    if [ -f "$FRONTEND_PID_FILE" ]; then
        PID=$(cat "$FRONTEND_PID_FILE")
        if ps -p "$PID" &> /dev/null; then
            kill "$PID" 2>/dev/null || true
            print_msg "$GREEN" "   Frontend stopped"
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    # Stop MongoDB container
    if docker ps --format '{{.Names}}' | grep -q "^${MONGO_CONTAINER_NAME}$"; then
        docker stop "$MONGO_CONTAINER_NAME" > /dev/null
        print_msg "$GREEN" "   MongoDB stopped"
    fi
    
    print_msg "$GREEN" "✅ All services stopped"
}

# Show logs
show_logs() {
    print_header
    print_msg "$BLUE" "📋 Use --backend and --frontend in separate terminals to see live logs"
    print_msg "$BLUE" "   Or use: docker logs -f $MONGO_CONTAINER_NAME (for MongoDB)"
    echo ""
}

# Print status and URLs
print_status() {
    echo ""
    print_msg "$GREEN" "═══════════════════════════════════════════════════════════════"
    print_msg "$GREEN" "                    🎉 Howl2Go is running!                      "
    print_msg "$GREEN" "═══════════════════════════════════════════════════════════════"
    echo ""
    print_msg "$CYAN" "  🌐 Frontend:  http://localhost:3000"
    print_msg "$CYAN" "  🔌 Backend:   http://localhost:4000"
    print_msg "$CYAN" "  🍃 MongoDB:   mongodb://localhost:27017/howl2go"
    echo ""
    print_msg "$YELLOW" "  📋 View logs:     ./start-dev.sh --logs"
    print_msg "$YELLOW" "  🛑 Stop all:      ./start-dev.sh --stop"
    echo ""
    print_msg "$BLUE" "  Data stored in: $HOME/.howl2go/"
    echo ""
}

# Main execution
main() {
    cd "$SCRIPT_DIR"
    
    case "${1:-}" in
        --stop|-s)
            stop_services
            exit 0
            ;;
        --logs|-l)
            show_logs
            exit 0
            ;;
        --backend|-b)
            print_header
            start_backend_foreground
            exit 0
            ;;
        --frontend|-f)
            print_header
            start_frontend_foreground
            exit 0
            ;;
        --mongo|-m)
            start_mongo_only
            exit 0
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  (none)          Start all services in background"
            echo "  --backend,  -b  Start MongoDB + backend in foreground (for separate terminal)"
            echo "  --frontend, -f  Start frontend in foreground (for separate terminal)"
            echo "  --mongo,    -m  Start MongoDB container only"
            echo "  --stop,     -s  Stop all services"
            echo "  --logs,     -l  Show logs from all services"
            echo "  --help,     -h  Show this help message"
            echo ""
            echo "For development with separate terminals:"
            echo "  Terminal 1: ./start-dev.sh --mongo    # Start MongoDB"
            echo "  Terminal 2: ./start-dev.sh --backend  # Start backend (will start MongoDB if needed)"
            echo "  Terminal 3: ./start-dev.sh --frontend # Start frontend"
            exit 0
            ;;
    esac
    
    print_header
    check_prerequisites
    setup_dirs
    start_mongodb
    setup_backend_env
    install_dependencies
    import_data
    start_backend
    start_frontend
    print_status
}

main "$@"
