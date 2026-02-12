# Project: AI Personal Finance Assistant

## Resume Bullet Points
*   **Project Overview:** Developed a full-stack AI financial assistant tailored for Indian users to track expenses, plan budgets, and analyze investments.
*   **Tech Stack:** Built with React.js, Node.js, Express, and PostgreSQL, utilizing TailwindCSS for responsive design and framer-motion for animations.
*   **AI Integration:** Integrated Groq SDK (Llama-3) to provide sub-second financial advice, transaction categorization, and personalized investment strategies.
*   **Expense Analysis:** Implemented a CSV parsing engine using PapaParse to ingest bank statements and visualize spending trends via Recharts.
*   **Feature Implementation:** Designed "Goal Planner" and "Budget Planner" modules that use 50/30/20 rules to automate financial forecasting.
*   **Security & Auth:** Secured application using JWT-based authentication and Google OAuth 2.0 to protect sensitive user financial data.
*   **Data Persistence:** Architected a PostgreSQL database schema on Neon.tech to store user profiles, chat history, and context memory.
*   **Performance:** Optimized frontend performance with Vite and React hooks, ensuring 60fps rendering for complex data visualization charts.
*   **Deployment:** Deployed the full-stack application on Vercel using serverless functions for the backend to ensure high availability.

---

## Interview Questions & Answers

### Architecture & Tech Stack
**1. Why did you choose React and Node.js for this project?**
I chose React for its component-based architecture which makes managing complex UI states like charts and chat easy. Node.js was selected for the backend to share JavaScript logic across the stack and for its non-blocking I/O, which is ideal for handling concurrent API requests.

**2. Why use PostgreSQL over MongoDB for this application?**
Financial data is highly structured (users, transactions, budgets) and relational. PostgreSQL enforces schema integrity and relationships (e.g., linking memories to users), which ensures data consistency better than a NoSQL document store.

**3. What is the role of the Groq SDK in your project?**
Groq provides an extremely fast inference engine for LLMs (Llama-3). I used it to generate real-time financial advice and categorize transactions without the latency typical of other AI providers, ensuring a snappy user experience.

### Frontend Development (React)
**4. How did you manage state in your application?**
I used React's built-in `useState` and `useEffect` for local component state, and `useContext` (AuthContext) for global state like user authentication and tokens, avoiding the overhead of Redux for this scale.

**5. How did you implement the "Typewriter" effect in the AI chat?**
I didn't strictly need a typewriter effect because Groq is so fast, but I used `framer-motion` to animate message bubbles entering the screen (`initial={{ opacity: 0, y: 10 }}`) to make the chat feel organic and smooth.

**6. How do you handle data visualization in React?**
I used `Recharts` because it's a composable library built on top of SVG components. It allowed me to easily bind backend data (JSON) to Pie and Bar charts for the Expense Analyzer module.

**7. How did you optimize the frontend performance?**
I used Vite for fast bundling and HMR. I also implemented lazy loading for routes using React Router and ensured that expensive calculations (like parsing large CSVs) didn't block the main UI thread.

### Backend Development (Node.js/Express)
**8. How is the backend structured?**
It's a RESTful API built with Express. I separated concerns by having distinct routes for Auth (`/api/auth`), Memory (`/api/memory`), and Chat (`/api/chat`). The server uses a connection pool to talk to the PostgreSQL database efficiently.

**9. Explain the authentication flow.**
It uses JWT (JSON Web Tokens). When a user logs in (via email or Google), the server signs a token with a secret. The frontend stores this token and sends it in the `Authorization` header for protected requests. Middleware on the server verifies this token before granting access.

**10. How did you handle the Google OAuth integration?**
I used `@react-oauth/google` on the frontend to get an ID token and `google-auth-library` on the backend to verify that token with Google's servers. This prevents spoofing and securely creates a user session.

**11. What middleware did you implement?**
I wrote a `verifyToken` middleware. It intercepts requests to protected routes, checks for the Bearer token in the header, verifies it using `jsonwebtoken`, and attaches the `userId` to the request object for the route handlers to use.

### Database (PostgreSQL)
**12. How is the database schema designed?**
I have three main tables: `users` (credentials), `user_memory` (contextual data like "I want to buy a house"), and `messages` (chat history). Foreign keys link memories and messages to the specific `user_id` with `ON DELETE CASCADE` for cleanup.

**13. Why did you use `pg` (node-postgres) instead of an ORM like Sequelize?**
For this project, I wanted raw control over my SQL queries to ensure performance and to demonstrate my understanding of SQL. The `pg` library provides a lightweight connection pool without the abstraction overhead of an ORM.

### AI & Logic
**14. How do you ensure the AI gives relevant financial advice?**
I use a robust "System Prompt" that defines the AI's persona as an expert financial planner. I also inject the user's stored "Memory" (context) into the prompt so the AI knows their specific goals and income level before generating an answer.

**15. How do you handle the AI hallucinating or giving wrong math?**
I explicitly instruct the AI in the system prompt to be conservative and verify calculations. For critical features like the Budget Planner, I also perform validation logic on the client side to ensure the numbers add up (e.g., 50/30/20 split).

**16. What is "RAG" and did you use it?**
RAG (Retrieval-Augmented Generation) involves fetching relevant data to augment the AI's context. I implemented a lightweight version of this by retrieving stored "User Memories" from Postgres and prepending them to the chat context before sending the request to Groq.

### Deployment & DevOps
**17. How is the application deployed?**
I used Vercel. The frontend is deployed as a static site, and the Express backend is deployed as Serverless Functions (`/api/*` rewritten to `server/index.js`). This allows for automatic scaling without managing a VPS.

**18. How do you handle environment variables in production?**
Local variables are in `.env` (git-ignored). In Vercel, I configured the secrets (like `DATABASE_URL` and `JWT_SECRET`) in the Project Settings dashboard, which are then injected into the serverless environment at runtime.

**19. What happened with the `.env` file and Git?**
I accidentally committed the `.env` file initially. I fixed this by adding it to `.gitignore`, removing it from the cache using `git rm --cached`, and amending the commit to ensure the history remained clean and secrets weren't exposed.

### Problem Solving
**20. What was the most challenging bug you faced?**
I faced a "Backend Not Connected" error that persisted even when the server was running. It turned out to be a UX issue where unauthorized 401 errors were being caught by a generic catch block. I fixed it by distinguishing between network errors and auth errors in the UI.

**21. How did you handle the currency localization?**
The AI initially defaulted to USD. I updated the system prompt to enforce "Indian Context" and "Rupees (₹)", and I programmatically replaced symbols in the React components to ensuring consistent localization for Indian users.

**22. How does the CSV parsing work?**
I used `PapaParse` on the client side. The user drops a file, PapaParse converts the CSV text into a JSON array, and then I feed a summary of that data to the AI to generate spending insights, keeping the heavy processing off the server.

**23. How did you implement Chat History persistence?**
Initially, chat was ephemeral. I solved this by adding a `messages` table in Postgres. On component mount, I fetch the history from the API. When a message is sent, I optimistically update the UI and asynchronously save the message to the DB.

**24. How do you handle mobile responsiveness?**
I used TailwindCSS's responsive prefixes (e.g., `md:flex`, `hidden md:block`). I built a collapsible Sidebar for mobile screens and ensured all charts in `ExpenseAnalyzer` resize dynamically using `ResponsiveContainer`.

**25. Future improvements you would add?**
I would add PDF export for budget reports, push notifications for daily spending tips, and perhaps integrate a real banking API (like Plaid or Setu) instead of manual CSV uploads for real-time tracking.
