# AI DSA Assessment Platform

An intelligent, full-stack Data Structures and Algorithms assessment platform featuring real-time AI guidance, automated code evaluation, time/space complexity analysis, and interactive code execution.

---

## 🚀 Architecture Overview

The system is structured into multi-tier microservices orchestrated via Docker Compose:

```
AI_Assistance_coding_Platform/
└── ai-dsa-assessment-platform/
    ├── frontend/               # React + Vite + TypeScript + Monaco Editor + TailwindCSS
    ├── backend/                # Express + TypeScript + MongoDB + Redis
    ├── ai-service/             # FastAPI (Python) + LLM Service for AI hints & evaluation
    ├── execution-service/      # Sandbox code execution runner
    └── docker-compose.yml      # Container orchestration
```

### Key Services

1. **Frontend (`/frontend`)**:
   - Modern, responsive IDE interface powered by Monaco Editor.
   - Code submissions, test runner console, and live assessment timers.
   - Instructor and Admin dashboards for analytics, user management, and problem curation.
   - Built with React 18, TypeScript, Tailwind CSS, Lucide icons, and Recharts.

2. **Backend (`/backend`)**:
   - RESTful API built with Express and TypeScript.
   - Secure authentication with JWT access and refresh tokens.
   - MongoDB database with Mongoose schemas for Users, Problems, Submissions, and AI Interactions.
   - Redis caching and rate limiting for optimized performance.
   - Automated grading and code submission routing.

3. **AI Service (`/ai-service`)**:
   - Python FastAPI microservice integrating Hugging Face / LLM APIs.
   - Provides intelligent hinting, step-by-step approach reviews, complexity analysis, and dry-run explanations without giving away direct answers.

4. **Execution Service (`/execution-service`)**:
   - Sandbox runner supporting multi-language test case evaluation.

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)
- [Docker](https://www.docker.com/) & Docker Compose
- [MongoDB](https://www.mongodb.com/) and [Redis](https://redis.io/) (if running locally without Docker)

### Environment Setup
Copy the example environment files and populate them with your secrets:
```bash
cp ai-dsa-assessment-platform/.env.example ai-dsa-assessment-platform/.env
cp ai-dsa-assessment-platform/ai-service/.env.example ai-dsa-assessment-platform/ai-service/.env
```

### Running with Docker Compose
```bash
cd ai-dsa-assessment-platform
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- AI Service: http://localhost:8001

---

## 📄 License
MIT License