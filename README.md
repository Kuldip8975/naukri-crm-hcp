# Naukri CRM - HCP Module

An AI-First Customer Relationship Management (CRM) system focusing on Healthcare Professional (HCP) interactions for life science field representatives.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/Kuldip8975/naukri-crm-hcp)
[![Python](https://img.shields.io/badge/Python-3.11+-green)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.0.20-purple)](https://langchain-ai.github.io/langgraph/)
[![Groq](https://img.shields.io/badge/Groq-gemma2--9b--it-orange)](https://console.groq.com/)

---

## 🎯 Overview

This application enables field representatives to log and manage interactions with Healthcare Professionals using both traditional forms and AI-powered chat interfaces.

### Key Features

- **Dual Interaction Modes**: Structured form-based or conversational AI chat
- **AI-Powered Agent**: LangGraph-based agent with 7 intelligent tools
- **Intelligent Processing**: Entity extraction, summarization, and follow-up recommendations
- **Modern Tech Stack**: React + Redux frontend, FastAPI backend, PostgreSQL database
- **Groq LLM Integration**: Powered by gemma2-9b-it for fast, accurate responses

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  USER INTERFACE (React)                   │
│   Dashboard        HCP List        Log Interaction        │
│                         │                                  │
│                         ▼                                  │
│              Redux State Management                       │
└──────────────────────────────────────────────────────────┘
                          │ HTTP/REST API
                          ▼
┌──────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND                        │
│                                                             │
│  API ROUTERS: /auth /hcps /interactions /followups        │
│               /analytics /ai                               │
│                          │                                  │
│                   SERVICE LAYER                            │
│                          │                                  │
│               LANGGRAPH AI AGENT                           │
│                                                             │
│   User Input → Classify Intent → Route to Tool             │
│                                                             │
│   7 TOOLS:                                                  │
│   1. Log Interaction      2. Edit Interaction              │
│   3. View History         4. Search HCP                    │
│   5. Schedule Follow-up   6. Analyze Trends                │
│   7. Generic Response                                      │
│                                                             │
│   GROQ LLM (gemma2-9b-it)                                  │
│   - Intent Classification                                  │
│   - Entity Extraction                                      │
│   - Response Generation                                    │
│                          │                                  │
│                REPOSITORY LAYER                             │
└──────────────────────────────────────────────────────────┘
                          │ SQLAlchemy ORM
                          ▼
┌──────────────────────────────────────────────────────────┐
│                  POSTGRESQL DATABASE                        │
│   Users   HCPs   Interactions   FollowUps   AuditLogs      │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Tech Stack

### Frontend
- **React 18** with Vite
- **Redux Toolkit** for state management
- **React Router v6** for navigation
- **Axios** for API calls
- **Google Inter Font** for typography
- **Lucide React** for icons

### Backend
- **Python 3.12+**
- **FastAPI** for REST API
- **SQLAlchemy 2.x** (async) for ORM
- **Pydantic v2** for validation
- **LangGraph** for AI agent framework
- **Groq API** (gemma2-9b-it) for LLM
- **PostgreSQL 15+** for database

### AI Agent Tools
1. **Log Interaction** - Captures HCP interactions with entity extraction
2. **Edit Interaction** - Modifies existing interactions
3. **View History** - Retrieves interaction history
4. **Search HCP** - Searches HCPs by name/specialty
5. **Schedule Follow-up** - Schedules follow-up reminders
6. **Analyze Trends** - Provides analytics insights
7. **Generic Response** - Handles general queries

---

## 📋 Features

- ✅ **Authentication**: JWT-based secure login/register
- ✅ **Log Interactions**: Via form or AI chat
- ✅ **Edit Interactions**: Update existing records with AI assistance
- ✅ **View History**: Filter and search interactions
- ✅ **HCP Management**: Search and manage HCP profiles
- ✅ **Follow-up Scheduling**: Automated reminders
- ✅ **AI Chat**: Conversational interaction logging with LangGraph
- ✅ **Analytics**: Interaction trends and insights
- ✅ **7 AI Tools**: Log, Edit, View, Search, Schedule, Analyze, Generic

---

## 🔧 Installation

### Prerequisites
- Node.js 18+
- Python 3.12+
- PostgreSQL 15+
- Groq API Key

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
python -m alembic upgrade head

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Docker Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📡 API Documentation

Once the backend is running, access the API documentation at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🤖 LangGraph AI Agent

The AI agent uses LangGraph with 7 intelligent tools:

| Tool | Description |
|------|-------------|
| `LogInteractionTool` | Log new HCP interactions with entity extraction |
| `EditInteractionTool` | Edit existing interactions |
| `ViewHistoryTool` | View interaction history with filters |
| `SearchHCPTool` | Search HCPs by name, specialty, or location |
| `ScheduleFollowupTool` | Schedule follow-ups with smart reminders |
| `AnalyzeTrendsTool` | Analyze interaction patterns and engagement |
| `GenericResponseTool` | Handle general queries |

### Agent Workflow

```
User Input → Intent Classification → Tool Selection → 
Entity Extraction → Tool Execution → Validation → 
Response Generation → State Persistence
```


## 🧪 Testing

```bash
# Backend tests
cd backend
pytest -v

# Frontend tests
cd frontend
npm run test
```

---

## 📦 Project Structure

```
naukri-crm-hcp/
├── frontend/                    # React + Redux application
│   ├── src/
│   │   ├── api/                 # API client configuration
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── redux/               # Redux store and slices
│   │   ├── routes/               # Route definitions
│   │   ├── services/            # API services
│   │   ├── hooks/                # Custom hooks
│   │   └── utils/                # Utility functions
│   └── public/                  # Static assets
│
├── backend/                     # FastAPI + LangGraph application
│   ├── app/
│   │   ├── ai/                  # LangGraph AI agent
│   │   │   ├── clients/         # Groq client
│   │   │   ├── prompts/         # LLM prompts
│   │   │   └── langgraph_agent.py
│   │   ├── api/                  # FastAPI endpoints
│   │   ├── core/                 # Core utilities
│   │   ├── models/                # SQLAlchemy models
│   │   ├── repositories/          # Data access
│   │   ├── schemas/               # Pydantic schemas
│   │   └── services/              # Business logic
│   └── tests/                    # Test suite
│
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

## 🔒 Security

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on all endpoints
- CORS protection
- Input validation with Pydantic
- SQL injection prevention (ORM)
- Prompt injection protection in AI agent

---

## 📄 License

This project is proprietary and confidential.

---

## 👥 Author

**Kuldip** - [GitHub](https://github.com/Kuldip8975)

---

## 🙏 Acknowledgments

- LangGraph for AI agent framework
- Groq for LLM inference
- FastAPI for API framework
- React and Redux communities

---

## 📞 Support

For any issues or questions, please open an issue on GitHub or contact the author.

---

## 🎯 Assignment Requirements Checklist

| Requirement | Status |
|-------------|--------|
| LangGraph Framework | ✅ |
| Groq LLM (gemma2-9b-it) | ✅ |
| 5+ AI Tools | ✅ (7 Tools) |
| Log Interaction Tool | ✅ |
| Edit Interaction Tool | ✅ |
| React + Redux | ✅ |
| FastAPI Backend | ✅ |
| PostgreSQL Database | ✅ |
| Google Inter Font | ✅ |
| Form Mode | ✅ |
| AI Chat Mode | ✅ |
| Video Recording | ✅ |
| GitHub Repository | ✅ |

---
