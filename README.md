# Howl2Go

<div align="center">

![Howl2Go Logo](https://img.shields.io/badge/🍔_Howl2Go-Food_Discovery-orange?style=for-the-badge)

**AI-Powered Food Discovery Platform**

*Crave it. Find it. Instantly.*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[Documentation](Proj%202/docs/) • [Getting Started](Proj%202/docs/GETTING_STARTED.md) • [API Docs](Proj%202/docs/API_DOCUMENTATION.md) • [Features](Proj%202/docs/FEATURES.md)

</div>

---

## What is Howl2Go?

Howl2Go revolutionizes food ordering by **eliminating traditional menus**. Instead of scrolling through endless options, simply describe what you want in plain English:

> *"Meal under 500 calories"*
>
> *"Give me something with low carbs"*
>
> *"Find me low fat burger"*

Our AI instantly understands your requirements and shows you exactly what you're looking for.

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🧠 **Natural Language Search**
Search using conversational queries instead of complex filters. Powered by Llama 3.1 via Groq.

### 📊 **Smart Nutritional Filtering**
Filter by calories, protein, carbs, fat, fiber, sugar, sodium, and 10+ nutritional parameters.

### 🏪 **Multi-Restaurant Discovery**
Browse 1,148+ items from McDonald's, Burger King, Wendy's, KFC, Taco Bell, and Subway.

</td>
<td width="50%">

### ⚡ **Lightning Fast**
Get results in under 2 seconds with optimized MongoDB queries and AI processing.

### 🎨 **Beautiful UI**
Modern dark theme with smooth animations and responsive design that works on all devices.

### 🔒 **Developer-Friendly**
Complete REST API, TypeScript support, comprehensive docs, and pre-commit hooks.

</td>
</tr>
</table>

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- MongoDB Atlas account (or local MongoDB)
- Groq API key ([Get free key](https://console.groq.com))

### 1. Clone the Repository
```bash
git clone https://github.com/harsha711/SE_Project_Grp_27.git
cd SE_Project_Grp_27/Proj\ 2
```

### 2. Setup Backend
```bash
cd Howl2Go_backend
npm install

# Create .env file
echo "GROQ_API_KEY=your_groq_api_key" > .env
echo "MONGODB_URI=your_mongodb_connection_string" >> .env

# Import nutrition data
npm run import:fastfood

# Start server
npm run dev
```

### 3. Setup Frontend
```bash
cd ../Howl2Go_frontend
npm install
npm run dev
```

### 4. Open Application
Navigate to **http://localhost:3000** and start searching!

📖 **[Full Setup Guide →](Proj%202/docs/DEVELOPER_SETUP.md)**

## 🎯 How It Works

```mermaid
graph LR
    A[User Query] --> B[Groq LLM]
    B --> C[Parse Criteria]
    C --> D[MongoDB Query]
    D --> E[Smart Sorting]
    E --> F[Results Display]
```

1. **User enters query** in natural language
2. **AI processes** and extracts nutritional criteria
3. **MongoDB searches** 1,148+ food items
4. **Smart sorting** ranks results by relevance
5. **Beautiful UI** displays matches instantly

## 📸 Screenshots

| Home Page | Search Results |
|-----------|----------------|
| <img src="Proj%202/docs/screenshots/home.png" width="400" alt="Home Page"/> | <img src="Proj%202/docs/screenshots/results.png" width="400" alt="Search Results"/> |

*Coming Soon: Demo GIF showcasing search functionality*

## 🛠️ Tech Stack

**Frontend**
- Next.js 15 with App Router
- React 19 with TypeScript
- Tailwind CSS 4
- Framer Motion for animations
- Lucide React icons

**Backend**
- Node.js 18+ with Express.js 5
- MongoDB Atlas with Mongoose
- Groq SDK (Llama 3.1 8B Instant)
- CORS, Morgan, dotenv

**DevOps**
- Husky for Git hooks
- ESLint for code quality
- Jest for testing
- Nodemon for hot reload

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](Proj%202/docs/GETTING_STARTED.md) | User guide with search examples |
| [User Manual](Proj%202/docs/USER_MANUAL.md) | Complete end-user documentation |
| [Developer Setup](Proj%202/docs/DEVELOPER_SETUP.md) | Development environment setup |
| [API Documentation](Proj%202/docs/API_DOCUMENTATION.md) | REST API reference |
| [Features](Proj%202/docs/FEATURES.md) | Complete feature catalog |

## 🧪 Testing

```bash
# Backend tests
cd Howl2Go_backend
npm test

# Frontend tests
cd Howl2Go_frontend
npm test
```

**Test Coverage:**
- 56+ comprehensive test cases for cart functionality
- Unit tests for API endpoints
- Integration tests for LLM service
- Frontend component tests

## 🗂️ Project Structure

```
SE_Project_Grp_27/
├── Proj 2/
│   ├── Howl2Go_backend/      # Express.js API server
│   ├── Howl2Go_frontend/     # Next.js React app
│   ├── Howl2Go_LLM/          # LLM testing scripts
│   ├── docs/                 # Project documentation
│   └── data/                 # Nutrition datasets
├── Proj 1/                   # Project planning docs
└── README.md                 # This file
```

## 🌟 Feature Highlights

### Current (v1.0)
- ✅ Natural language food search
- ✅ Multi-restaurant discovery (1,148+ items)
- ✅ Nutritional filtering (10+ parameters)
- ✅ Smart recommendations
- ✅ Shopping cart with place order
- ✅ Beautiful dark theme UI
- ✅ Responsive design

### Coming Soon (v1.1)
- 🚧 User authentication
- 🚧 Order history
- 🚧 Saved favorites
- 🚧 Payment integration
- 🚧 Real-time order tracking

**[Full Roadmap →](Proj%202/docs/FEATURES.md)**

## 👥 Team

**SE_Project_Grp_27**
- Lead Developer: Harsha
- Course: Software Engineering
- Institution: NC State University

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- **Groq** for LLM API access
- **MongoDB Atlas** for database hosting
- **Next.js Team** for the amazing framework
- **Open Source Community** for inspiration and tools

## 📞 Support

- 📧 Email: support@howl2go.com
- 🐛 Issues: [GitHub Issues](https://github.com/harsha711/SE_Project_Grp_27/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/harsha711/SE_Project_Grp_27/discussions)

---

<div align="center">

**Made with ❤️ by SE_Project_Grp_27**

*Crave it. Find it. Instantly.*

</div>
