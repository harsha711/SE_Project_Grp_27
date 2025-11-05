# Food Delivery Backend

Backend service for a food delivery system built with Node.js and Express. This project starts with a lightweight API foundation that can be expanded with domain-specific features like restaurant management, menu catalogs, order processing, and driver dispatching.

## Prerequisites

- Node.js 18+ and npm 9+

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and adjust values as needed:
   ```bash
   cp .env.example .env
   ```
3. Start the development server with auto-reload:
   ```bash
   npm run dev
   ```

The API defaults to `http://localhost:4000`. A health-check endpoint is available at `GET /api/health`.

## Available Scripts

- `npm run dev` – start the server with hot-reload via nodemon
- `npm start` – start the server once with Node.js
- `npm test` – run Node's built-in test runner against files in `src/**/__tests__`

## Project Structure

```
src/
├── app.js               # Express app configuration
├── config/              # Environment and configuration helpers
├── controllers/         # Request handlers
├── middleware/          # Custom middleware (placeholder)
├── routes/              # Route definitions and routers
└── server.js            # HTTP server bootstrap
```

## Next Steps

- Flesh out domain modules for restaurants, menus, orders, and couriers.
- Add persistence (e.g., PostgreSQL, MongoDB) and related data access layers.
- Introduce logging, validation, authentication, and testing infrastructure as requirements evolve.


## 👥 Team

**SE_Project_Grp_27**
- Lead Developers: [Harsha](https://github.com/harsha711)[Pratham](https://github.com/pratham2879)[Samarth](https://github.com/Samarth061)[Jai](https://github.com/JaiRumz)
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

- 📧 Email: support_howl2go@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/harsha711/SE_Project_Grp_27/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/harsha711/SE_Project_Grp_27/discussions)

---

<div align="center">

**Made with ❤️ by SE_Project_Grp_27**

*Crave it. Find it. Instantly.*

</div>
