# Howl2Go

**AI-Powered Food Discovery Platform**

[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)](https://github.com/harsha711/SE_Project_Grp_27)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> *Crave it. Find it. Instantly.*

---

## What is Howl2Go?

Howl2Go eliminates traditional menus. Simply describe what you want in plain English, and our AI finds perfect matches across multiple restaurants.

**Example Searches:**
- *"Meal under 500 calories"*
- *"High protein low carb"*
- *"Low fat burger"*

---

## ✨ Key Features

🧠 **Natural Language Search** - AI-powered query understanding (Llama 3.1 via Groq)

🍔 **Multi-Restaurant** - 1,148+ items from McDonald's, Burger King, Wendy's, KFC, Taco Bell

📊 **Nutritional Filtering** - Search by calories, protein, carbs, fat, fiber, sodium, and more

⚡ **Lightning Fast** - Results in under 2 seconds

🎨 **Modern UI** - Dark theme with smooth animations

🛒 **Shopping Cart** - Complete cart management with order placement

---

## 📸 Demo & Screenshots

### Video Demos
> 📹 **Coming Soon** - Demo videos will be added here

### Screenshots
> 🖼️ **Coming Soon** - Screenshots will be added to `docs/screenshots/`

**Planned Screenshots:**
- Home page with search bar
- Search results display
- Cart page with items
- Order success animation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Groq API key ([Get free key](https://console.groq.com))

### Setup

```bash
# Clone repository
git clone https://github.com/harsha711/SE_Project_Grp_27.git
cd "SE_Project_Grp_27/Proj 2"

# Backend setup
cd Howl2Go_backend
npm install

# Create .env file
echo "GROQ_API_KEY=your_api_key" > .env
echo "MONGODB_URI=your_mongodb_uri" >> .env

# Import food data
npm run import:fastfood

# Start backend
npm run dev
# Backend runs at http://localhost:4000

# Frontend setup (new terminal)
cd ../Howl2Go_frontend
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

### Test API
```bash
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{"query": "high protein", "limit": 5}'
```

---

## 🛠️ Tech Stack

**Frontend:** Next.js 15 • React 19 • TypeScript • Tailwind CSS • Framer Motion

**Backend:** Node.js • Express • MongoDB • Mongoose • Groq SDK

**AI/LLM:** Llama 3.1 8B Instant via Groq

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](docs/GETTING_STARTED.md) | User onboarding guide |
| [User Manual](docs/USER_MANUAL.md) | Complete feature documentation |
| [Developer Setup](docs/DEVELOPER_SETUP.md) | Development environment setup |
| [API Documentation](docs/API_DOCUMENTATION.md) | REST API reference |
| [Features](docs/FEATURES.md) | Complete feature catalog |
| [Testing Guide](docs/TESTING_GUIDE.md) | Testing documentation |

---

## 📁 Project Structure

```
Proj 2/
├── Howl2Go_backend/      # Express.js API server
│   ├── src/              # Source code
│   └── package.json
├── Howl2Go_frontend/     # Next.js React app
│   ├── app/              # Pages (App Router)
│   ├── components/       # React components
│   └── package.json
├── Howl2Go_LLM/          # LLM testing scripts
├── docs/                 # Documentation
└── data/                 # Nutrition datasets
```

---

## 🧪 Testing

```bash
# Frontend tests (56 test cases)
cd Howl2Go_frontend
npm test

# Backend tests (planned)
cd Howl2Go_backend
npm test
```

**Current Coverage:** Cart page (100%), Search page (planned)

---

## 🌟 Feature Highlights

### Current (v1.0)
✅ Natural language food search
✅ Multi-restaurant discovery
✅ Nutritional filtering
✅ Shopping cart
✅ Order placement
✅ Dark theme UI

### Coming Soon (v1.1)
🚧 User authentication
🚧 Order history
🚧 Payment integration
🚧 Real-time tracking

**[Full Roadmap →](docs/FEATURES.md)**

---

## 📞 Support

- 📧 Email: support@howl2go.com
- 🐛 Issues: [GitHub Issues](https://github.com/harsha711/SE_Project_Grp_27/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/harsha711/SE_Project_Grp_27/discussions)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 👥 Team

**SE_Project_Grp_27**
- Lead Developer: [Harsha](https://github.com/harsha711)
- Institution: NC State University

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **Groq** for LLM API access
- **MongoDB Atlas** for database hosting
- **Next.js Team** for the framework
- **Open Source Community**

---

<div align="center">

**Made with ❤️ by SE_Project_Grp_27**

*Crave it. Find it. Instantly.*

⭐ Star us on [GitHub](https://github.com/harsha711/SE_Project_Grp_27)

</div>
