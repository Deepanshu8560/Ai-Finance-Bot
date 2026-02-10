# 💰 AI Personal Finance Bot

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-orange)
![Currency](https://img.shields.io/badge/currency-INR%20(%E2%82%B9)-blueviolet)

A powerful, intelligent personal finance assistant built with **React**, **Node.js**, and **Generative AI (Groq/Llama 3)**. This application helps users track expenses, plan budgets, set financial goals, and understand complex investment terms—all localized for the **Indian** context (Rupees, Lakhs, SIPs).

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#-usage)
- [Modules Overview](#-modules-overview)
- [Deployment](#-deployment)
- [Contribution](#-contribution)
- [License](#-license)

---

## ✨ Features

- **🤖 AI Financial Companion**: Chat with a context-aware AI that remembers your financial details and offers personalized advice.
- **📊 Expense Analyzer**: Upload your bank statement (CSV), and the AI will categorize transactions, detect risky spending, and visualize trends.
- **📉 Smart Budget Planner**: Generates a monthly budget based on the **50/30/20 rule**, adjusted for your income and fixed costs.
- **🎯 Goal-Based Planning**: Calculate required monthly savings (SIP) for goals like "Buy a Car" or "World Tour", with AI-suggested investment splits (Equity/Debt/Gold).
- **🧠 Investment Tutor**: "Explainer Mode" simplifies complex financial terms (e.g., "Mutual Fund", "Inflation") with simple definitions and clear examples.
- **🇮🇳 Localized for India**: Fully optimized for **Indian Rupees (₹)** and Indian investment instruments (FD, PPF, Nifty 50).
- **🔒 Secure Authentication**: Robust login system with **JWT** and **Google OAuth** support.
- **💾 Conversation Memory**: Remembers past conversations and user context using a PostgreSQL database.

---

## 🏗 Architecture & Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: TailwindCSS, Lucide React (Icons)
- **Charts**: Recharts (Data Visualization)
- **Animations**: Framer Motion
- **State Management**: React Hooks & Context API

### Backend
- **Server**: Node.js + Express
- **Database**: PostgreSQL (via Neon Tech)
- **Authentication**: `jsonwebtoken` (JWT), `bcryptjs`, `google-auth-library`
- **AI Engine**: Groq SDK (Llama-3-70b model)

### Deployment
- **Platform**: Vercel (Serverless Functions)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL Database** (We recommend [Neon](https://neon.tech))
- **Groq API Key** (Get it from [Groq Console](https://console.groq.com/))
- **Google Client ID** (For Google Login - Optional)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Deepanshu8560/Ai-Finance-Bot.git
    cd Ai-Finance-Bot
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Database**
    - Create a PostgreSQL database (e.g., on Neon).
    - The app will automatically create the necessary tables (`users`, `user_memory`) on the first run.

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# AI Configuration
VITE_GROQ_API_KEY=your_groq_api_key_here

# Authentication
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### Running Locally

You need to run both the Backend (API) and Frontend (UI).

1.  **Start the Backend Server**
    ```bash
    node server/index.js
    ```
    *Output: Backend running on http://localhost:3001*

2.  **Start the Frontend**
    ```bash
    npm run dev
    ```
    *Output: Local: http://localhost:5173*

3.  Open `http://localhost:5173` in your browser.

---

## 🎮 Usage

1.  **Sign Up / Login**: Create an account or sign in with Google.
2.  **Chat**: Go to the Chat tab and ask, *"How much should I save for a ₹5 Lakh car in 3 years?"*
3.  **Analyze Expenses**: Go to **Expense Analyzer**, drag & drop your bank CSV.
4.  **Plan Budget**: Enter your income in **Budget Planner** to get a 50/30/20 breakdown.
5.  **Set Goals**: Use **Goal Planner** to find out your required SIP for future goals.

---

## 📦 Modules Overview

| Module | Description | Key Tech |
| :--- | :--- | :--- |
| **Expense Analyzer** | Parses CSVs & categorizes spending | `papaparse`, AI |
| **Budget Planner** | 50/30/20 Rule Visualization | `recharts`, AI |
| **Goal Planner** | SIP/Savings Calculator | `recharts`, AI |
| **Memory System** | Stores user context (e.g., "I live in Mumbai") | `pg`, Express |

---

## ☁️ Deployment

This project is configured for **Vercel**.

1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Add the **Environment Variables** (from your `.env` file) in Vercel Project Settings.
4.  Vercel will automatically detect the `vercel.json` and deploy both the Frontend and Backend (as Serverless functions).

---

## 🤝 Contribution

Contributions are welcome!

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 🛡 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

**Deepanshu** - [GitHub](https://github.com/Deepanshu8560)

Project Link: [https://github.com/Deepanshu8560/Ai-Finance-Bot](https://github.com/Deepanshu8560/Ai-Finance-Bot)
