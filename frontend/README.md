# FundingSense: Frontend (Client-Side)

This is the React-based frontend for **FundingSense**, built with high-performance aesthetics and deep multilingual support.

## 🚀 Key Technologies
- **Vite & React 18**: Ultra-fast development and optimized production builds.
- **TypeScript**: Type-safe development for complex state management.
- **Tailwind CSS**: Utility-first CSS for responsive, modern design.
- **Framer Motion**: Smooth micro-animations and page transitions (`motion/react`).
- **Shadcn UI**: Premium component library built on Radix UI.
- **Supabase**: Integrated authentication and user profile management.

## 🌍 Multilingual System
The frontend implements a custom `LanguageContext` that supports:
- **8 Indian Languages**: English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, and Kannada.
- **Dynamic AI Localizer**: Uses the backend's Gemini-powered translation engine to localize dynamic content like historical analysis summaries.

## 🛠️ Project Structure
- `src/contexts/`: Global state management for languages and themes.
- `src/components/`: Reusable UI components (buttons, cards, layout).
- `src/pages/`: Main application routes (Dashboard, Analyze, Evidence, Settings).
- `src/services/api.ts`: Centralized API client for communicating with the FastAPI backend.

## ⚙️ Development
To run the frontend locally:
```bash
npm install
npm run dev
```

For the full setup instructions, please refer to the [Root README](../README.md).
