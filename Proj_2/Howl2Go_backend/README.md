# Food Delivery Backend

Backend service for a food delivery system built with Node.js and Express. This project starts with a lightweight API foundation that can be expanded with domain-specific features like restaurant management, menu catalogs, order processing, and driver dispatching.

## Prerequisites

-   Node.js 18+ and npm 9+

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

-   `npm run dev` – start the server with hot-reload via nodemon
-   `npm start` – start the server once with Node.js
-   `npm test` – run Node's built-in test runner against files in `src/**/__tests__`

# Howl2Go Backend Docker Guide

This guide explains how to build and run the Howl2Go Express API (`Proj_2/Howl2Go_backend`) with the provided production `Dockerfile`. The container installs only runtime dependencies, drops root privileges, and serves the API on port `4000`.

---

## 1. Prerequisites

-   Docker 24+ (or any recent version with multi-stage build support)
-   Reachable MongoDB instance (Atlas or self-hosted)
-   Groq API key for natural-language search
-   Optional: DoorDash credentials if you plan to use those integrations

---

## 2. Runtime Environment Variables

| Variable                 | Required          | Default                                     | Purpose                                                                                  |
| ------------------------ | ----------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `MONGODB_URI`            | ✅                | –                                           | Connection string for MongoDB                                                            |
| `GROQ_API_KEY`           | ✅ (LLM features) | –                                           | Groq LLM API token                                                                       |
| `PORT`                   | ⛔                | `4000`                                      | Container listens on this port; change only if you also update the `EXPOSE`/port mapping |
| `NODE_ENV`               | ⛔                | `production` (set in Dockerfile)            | Controls logging/error verbosity                                                         |
| `SESSION_SECRET`         | ⚠️                | `your-secret-key-change-this-in-production` | Used for session signing; override in production                                         |
| `SESSION_NAME`           | ⛔                | `howl2go.sid`                               | Cookie/session name                                                                      |
| `SESSION_MAX_AGE`        | ⛔                | `86400000`                                  | Session TTL in ms                                                                        |
| `JWT_SECRET`             | ✅                | –                                           | Access token signing key                                                                 |
| `JWT_EXPIRES_IN`         | ⛔                | `7d`                                        | JWT access token lifetime                                                                |
| `JWT_REFRESH_SECRET`     | ✅                | –                                           | Refresh token signing key (falls back to `JWT_SECRET` if omitted)                        |
| `JWT_REFRESH_EXPIRES_IN` | ⛔                | `30d`                                       | Refresh token lifetime                                                                   |
| `FRONTEND_URL`           | ⛔                | `http://localhost:3000`                     | CORS origin for browser requests                                                         |
| `DOORDASH_*`             | Optional          | –                                           | DoorDash integration credentials if used                                                 |

> ✅ = Required for production use. \
> ⚠️ = Application runs with a weak default, but you should override it.

You can supply these variables in an env file or directly in `docker run`.

### Example `.env.docker`

```dotenv
MONGODB_URI=mongodb://mongodb:27017/howl2go
GROQ_API_KEY=replace_me
JWT_SECRET=replace_me_with_32_characters_minimum
JWT_REFRESH_SECRET=replace_me_with_32_characters_minimum
SESSION_SECRET=another_secure_string
FRONTEND_URL=http://localhost:3000
```

---

## 3. Build the Image

From `Proj_2/Howl2Go_backend/`:

```bash
docker build -t howl2go-backend:latest .
```

What the Dockerfile does:

1. Starts from `node:22-alpine`.
2. Sets `NODE_ENV=production` so dependencies install in production mode.
3. Installs only runtime dependencies with `npm ci --omit=dev --ignore-scripts`.
4. Copies the source code.
5. Adds a health check hitting `/api/health`.
6. Drops privileges to the bundled `node` user.

---

## 4. Run the Container

### Minimal command

```bash
docker run \
  --name howl2go-backend \
  --env-file .env.docker \
  --publish 4000:4000 \
  howl2go-backend:latest
```

### When MongoDB runs on the host

```bash
docker run \
  --name howl2go-backend \
  --env-file .env.docker \
  --publish 4000:4000 \
  --add-host=host.docker.internal:host-gateway \
  --env MONGODB_URI=mongodb://host.docker.internal:27017/howl2go \
  howl2go-backend:latest
```

The API will be reachable at [http://localhost:4000](http://localhost:4000). The health endpoint `/api/health` is useful to confirm the container is ready.

---

## 5. Docker Compose Example

```yaml
services:
    backend:
        image: howl2go-backend:latest
        build:
            context: .
        restart: unless-stopped
        ports:
            - "4000:4000"
        environment:
            MONGODB_URI: mongodb://mongodb:27017/howl2go
            GROQ_API_KEY: ${GROQ_API_KEY}
            JWT_SECRET: ${JWT_SECRET}
            JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
            SESSION_SECRET: ${SESSION_SECRET}
            FRONTEND_URL: http://localhost:3000
        depends_on:
            - mongodb

    mongodb:
        image: mongo:7
        restart: unless-stopped
        volumes:
            - mongodb-data:/data/db
        environment:
            MONGO_INITDB_DATABASE: howl2go

volumes:
    mongodb-data:
```

Populate the referenced environment variables in your compose `.env` file.

---

## 6. Database Seeding (Optional)

If you need to load the fast-food dataset, run the seeding script inside the container after it starts:

```bash
docker exec -it howl2go-backend npm run import:fastfood
```

If you prefer a one-off container (without the API running), you can run:

```bash
docker run --rm \
  --env-file .env.docker \
  --entrypoint npm \
  howl2go-backend:latest \
  run import:fastfood
```

Make sure the required CSV/JSON assets referenced by the script are present in the image (they are copied by default from the repository).

---

## 7. Troubleshooting

-   **Container exits immediately:** check `docker logs howl2go-backend`; most startup issues are missing environment variables or MongoDB connectivity.
-   **Cannot reach MongoDB:** confirm the connection string is reachable from inside the container (`docker exec howl2go-backend ping mongodb` or `mongosh`).
-   **Health check failing:** verify the app actually listens on `PORT` (default 4000) and that the MongoDB connection succeeds.
-   **Need to change the port:** set `PORT` in your env file **and** update the host port mapping, e.g., `-p 8080:8080`.
-   **Updating dependencies:** rebuild with `docker build --no-cache ...` to prevent cached layer reuse.

---

## 8. Helpful Commands

```bash
docker ps                     # Ensure the container is running
docker logs -f howl2go-backend  # Tail logs
docker exec -it howl2go-backend sh  # Open a shell as the node user
docker rm -f howl2go-backend   # Remove the running container
docker rmi howl2go-backend:latest  # Delete the image
```

Happy shipping! The Docker image keeps the backend consistent across environments while letting you focus on building features.
