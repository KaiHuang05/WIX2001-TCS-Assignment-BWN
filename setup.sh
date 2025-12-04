#!/bin/bash

echo "🚀 Setting up Smart Memento Booth..."

# Backend setup
echo ""
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python -m venv venv

# Activate virtual environment and install dependencies
echo "Installing backend dependencies..."
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
else
    source venv/Scripts/activate
fi

pip install -r requirements.txt

# Create .env file
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
fi

cd ..

# Frontend setup
echo ""
echo "🎨 Setting up Frontend..."
cd frontend

# Check if bun is available, otherwise use npm
if command -v bun &> /dev/null; then
    echo "Installing frontend dependencies with bun..."
    bun install
else
    echo "Installing frontend dependencies with npm..."
    npm install
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "Backend:"
echo "  cd backend"
echo "  source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
echo "  fastapi dev app/main.py"
echo ""
echo "Frontend:"
echo "  cd frontend"
echo "  npm run dev  # or bun run dev"
echo ""
