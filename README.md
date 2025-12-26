# FundingSense: The Ultimate AI Venture Intelligence Suite

**FundingSense** is a state-of-the-art, evidence-backed decision intelligence platform designed to bridge the data gap between startups and investors. By combining a sophisticated **Reasoning & Safety Layer** with **Google Gemini 2.0 Flash**, it provides founders with deep, verifiable insights into their funding readiness, grounded in real-world policy, news, and market data.

---

## Vision & Purpose
In the fast-moving venture ecosystem, information asymmetry is a major hurdle. Founders often lack clarity on how they fit into a VC’s thesis, and traditional AI tools suffer from "hallucinations" or stale data. 

**FundingSense** solves this by:
1.  **Eliminating Hallucinations**: Every claim is strictly validated against retrieved evidence.
2.  **Bharat-First Localization**: Full support for English + 7 major Indian languages.
3.  **Real-Time Intelligence**: Live Google Search grounding ensures you see what's happening *today*, not two years ago.

---

## Core AI Innovations

### 1. The Reasoning & Safety Layer (Factual Integrity)
Unlike standard RAG apps, FundingSense implements a **tri-stage validation pipeline**:
-   **Step 1: Contextual Intent Detection**: The AI breaks down the user description into specific market, regulatory, and financial pillars.
-   **Step 2: Evidence-Backed Validation**: A dedicated `Validator` engine maps retrieved facts to specific claims. If a claim isn't supported by hard data, it's flagged as "Unsupported."
-   **Step 3: Grounded Explanation**: Gemini 2.0 generates the final report using *only* the validated evidence list.

### 2. Hybrid Retrieval Architecture
Our `Retriever` module uses three tiers of intelligence:
-   **Grounded Search**: Live web access via Gemini 2.0 Flash (v1beta) to crawl 2024-2025 news.
-   **Local Vector DB**: ChromaDB indexes proprietary investment thesis documents and datasets.
-   **High-Fidelity PDF/MD Ingestion**: Automated chunking and metadata extraction from policy whitepapers and news reports.

---

## Key Features

### 📊 Professional Funding Fit Analysis
*   **Fit Score & Confidence**: A proprietary blended score (0-100) based on investor alignment and evidence strength.
*   **Why This Fits/Doesn't Fit**: Detailed reasoning sections explaining the logical gap between the startup and current VC sentiment.
*   **Recommended Investors**: Direct matching with top-tier VCs like **Peak XV**, **Blume**, **Accel**, and **Elevation Capital**.

### 💬 Personal VC Lead (Chat Engine)
*   **Interactive Context**: Chat with the AI about your specific analysis. The AI remembers your startup profile and the evidence used.
*   **Translation-Aware Expansion**: Ask questions in Hindi or Bengali; the AI expands them into English venture-queries for global retrieval before answering in your native tongue.

### 📚 The Intelligence Vault & PDF Ingestion
*   **Full PDF Support**: Upload policy documents, research whitepapers, or market datasets.
*   **Source Traceability**: Every analysis includes an "Evidence Used" section with direct URLs and titles, ensuring full accountability.

### 🇮🇳 Multilingual Intelligence
Full UI and report support for:
-   **English**
-   **Hindi (हिंदी)**
-   **Bengali (বাংলা)**
-   **Tamil (தமிழ்)**
-   **Telugu (తెలుగు)**
-   **Marathi (मराठी)**
-   **Gujarati (ગુજરાતી)**
-   **Kannada (ಕನ್ನಡ)**

---

## Technical Architecture

### Tech Stack
-   **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion (premium aesthetics).
-   **Backend**: FastAPI (Async Python), Pydantic (Schema Enforcement), ChromaDB (Vector Search).
-   **AI**: Google Gemini 2.0 Flash (v1beta with Google Search Grounding).
-   **Auth**: Supabase Authentication.

### Project Structure
```bash
├── backend/
│   ├── app/
│   │   ├── core/           # Orchestration & Storage
│   │   ├── rag/            # Retrieval Engine (ChromaDB + Gemini Search)
│   │   ├── reasoning/      # Decision Validation Layer
│   │   ├── generation/     # Report & Chat Generation
│   │   └── data/           # Evidence Stores
│   └── ingest_to_db.py     # High-fidelity PDF/Markdown Ingestor
├── frontend/
│   ├── src/
│   │   ├── pages/          # Analysis, Results, Chat, Evidence Vault
│   │   ├── components/     # Shadcn-based UI Components
│   │   └── contexts/       # i18n & Global State Management
```

---

## Setup & Installation

### Prerequisites
-   Python 3.10+
-   Node.js 18+
-   Google GenAI API Key (Gemini 2.0 Flash)
-   Supabase Project URL/Key

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add your GOOGLE_API_KEY
uvicorn app.main:app --reload
```

### 2. Ingest Data (Optional)
Place your own PDFs or Markdown files in `backend/data/raw` and run:
```bash
python ingest_to_db.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  # Add Supabase & API URL
npm run dev
```
