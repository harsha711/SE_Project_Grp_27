# SE_Project_Grp_27 - Howl2Go

A food delivery application with nutritional analysis and AI-powered recommendations.

## Project Structure

### Proj 1 - Project Planning & Documentation
- Proj 1a1 - Problem familiarization
- Proj 1b1 - Problem Anticipation
- Proj 1c1 - Problem Condensation
- Proj 1d1 - Problem Reflection
- Proj 1e1 - Poster

### Proj 2 - Implementation
Contains all the code and data for the Howl2Go application:

- **[Howl2Go_backend/](Proj%202/Howl2Go_backend/)** - Node.js/Express backend with MongoDB
  - FastFood nutrition database
  - API endpoints
  - MongoDB integration

- **[Howl2Go_frontend/](Proj%202/Howl2Go_frontend/)** - Next.js/React/TypeScript frontend
  - Modern UI
  - Real-time updates

- **[Howl2Go_LLM/](Proj%202/Howl2Go_LLM/)** - AI/ML integration
  - Groq API for natural language processing
  - Nutritional requirement extraction
  - Llama 3.1 model

- **data/** - Datasets
  - Fast food nutrition data (CSV)
  - Restaurant menus

## Quick Start

### Backend
```bash
cd "Proj 2/Howl2Go_backend"
npm install
npm run import:fastfood  # Import nutrition data
npm run dev
```

### Frontend
```bash
cd "Proj 2/Howl2Go_frontend"
npm install
npm run dev
```

### LLM Service
```bash
cd "Proj 2/Howl2Go_LLM"
conda activate torch121
export GROQ_API_KEY="your-key-here"
python llama_test.py
```

## Features

- 🍔 **Nutrition Database** - 1,148+ fast food items from 6+ chains
- 🤖 **AI-Powered** - Natural language food search
- 🔐 **Secure** - Pre-commit hooks prevent secret leaks
- 📊 **Rich Data** - Complete nutritional information
- ⚡ **Fast** - MongoDB for quick queries

## Documentation

- [Pre-Commit Hooks](PRE-COMMIT-HOOKS.md)
- [Backend README](Proj%202/Howl2Go_backend/README.md)
- [LLM README](Proj%202/Howl2Go_LLM/README.md)
