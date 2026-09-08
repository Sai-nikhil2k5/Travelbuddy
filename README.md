# 🎒 TravelBuddy — Cozy AI Trip Planner

**TravelBuddy** is a multi-agent AI travel planning application that helps you search flights, discover hotels, and generate complete travel itineraries. It features a cozy, character-driven web interface guided by your virtual travel companions: **Barnaby the Bear 🐻** (your budget and cozy vibe expert) and **Hazel the Bunny 🐰** (your detailed itinerary and transit planner).

### 🚀 Live Demo
Experience the application live here: **[https://travelbuddy-mi6t.onrender.com/](https://travelbuddy-mi6t.onrender.com/)**

---

## ✨ Features

- **Cozy & Aesthetic UI**: A warm, scrapbook-style travel journal interface with beautiful color palettes, micro-animations, and passport stamps.
- **Duo Persona Guides**: Choose to plan your trip with Hazel, Barnaby, or both for a balanced itinerary.
- **Interactive Boarding Passes**: Quick prompt templates styled as aesthetic flight tickets.
- **Smart Itinerary Generation**: Powered by LangGraph and Groq, combining flight search (AviationStack) and web search (Tavily) tools.
- **Travel Scrapbook Tabs**: View your trip organized into Itinerary, Interactive Packing Checklist, and Cozy Travel Tips.
- **Export to PDF**: Easily download your personalized travel journal as a formatted PDF.

---

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, Uvicorn
- **AI Agent Framework**: LangGraph, LangChain
- **LLM**: Groq API
- **Tools**: Tavily (Web Search), AviationStack (Flight Data)
- **Frontend**: HTML5, Vanilla JavaScript, CSS (with custom properties for theme tokens)
- **Deployment**: Docker, Render

---

## 💻 Local Setup & Development

Follow these steps to run TravelBuddy on your local machine.

### 1. Clone the repository
```bash
git clone https://github.com/Sai-nikhil2k5/Travelbuddy.git
cd Travelbuddy
```

### 2. Set up the Environment
Create a virtual environment and install the required dependencies:
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure API Keys
Create a `.env` file in the root directory. You can copy the template from `.env.example`:
```bash
cp .env.example .env
```
Fill in the `.env` file with your actual API keys:
- `GROQ_API_KEY`
- `TAVILY_API_KEY`
- `AVIATIONSTACK_API_KEY`
- *(Optional)* `LANGSMITH_API_KEY` for tracing.

### 4. Run the Application
Start the FastAPI server:
```bash
python app.py
```
*Alternatively, you can run it via uvicorn directly:*
```bash
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```
Open your browser and navigate to **`http://127.0.0.1:8000`**.

---

## 🐳 Docker Setup

You can also run TravelBuddy using Docker.

```bash
# Build the Docker image
docker build -t travelbuddy .

# Run the container
docker run -p 8000:8000 --env-file .env travelbuddy
```

---

*Crafted with care by Hazel 🐰 & Barnaby 🐻*