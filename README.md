🛒 IntelliCart – AI-Powered E-commerce Platform
IntelliCart is a Walmart-style AI-driven e-commerce platform that delivers health-aware, budget-conscious product recommendations. Built with React, Node.js, MongoDB, and Gemini-Pro LLM, IntelliCart blends traditional shopping interfaces with smart AI-driven cart optimization.

🚀 Features
🛍️ Walmart-style frontend UI (React + Tailwind CSS)

🔍 AI-powered product recommendations using Gemini-Pro LLM

🧠 Health-aware filters (e.g., hypertension, diabetes support)

🧾 Nutrition & value scoring (Zod-validated schemas)

🧪 Harmful ingredient detection (e.g., MSG, caffeine, salt)

🛒 Smart Cart with real-time inventory and pricing feedback

👤 User authentication and personalized dashboards

📦 RESTful APIs with Express.js and MongoDB

🧱 Tech Stack
Frontend: React.js, Tailwind CSS, React Router

Backend: Node.js, Express.js

Database: MongoDB

AI Integration: Gemini-Pro LLM (via Google API)

Validation: Zod (strict schema validation, no regex/string match)

Tools: Axios, JWT, dotenv, concurrently

🖼️ UI Screens
Homepage with banners, trending, and offers

Product Listing Page (filters, sort, category views)

Product Detail Page (images, variants, nutrition tags)

Shopping Cart & Smart Recommendations

Checkout Page (billing, payment, order summary)

User Dashboard (orders, wishlist, settings)

📁 Project Structure
bash
Copy
Edit
/client              → React frontend
  /components        → Reusable UI components
  /pages             → Pages (Home, Product, Cart, Checkout)
  /assets            → Images and styling
  /services          → Axios API handlers

/server              → Express backend
  /controllers       → Logic (products, users, recommendations)
  /models            → MongoDB schemas
  /routes            → API endpoints
  /utils             → LLM prompt builder, validators
  /zodSchemas.js     → Zod validation schemas

/products.json       → Sample product data
.env                 → Config (API keys, DB URI, ports)
🔧 Running Locally
Clone the repository:

bash
Copy
Edit
git clone https://github.com/your-username/intellicart.git
cd intellicart
Install dependencies:

For backend:

bash
Copy
Edit
cd server
npm install
For frontend:

bash
Copy
Edit
cd ../client
npm install
Add .env files for backend:

ini
Copy
Edit
PORT=5000
MONGO_URI=your_mongodb_uri
GEMINI_API_KEY=your_google_gemini_api_key
Run both frontend and backend:

In root folder:

bash
Copy
Edit
npm run dev
Visit frontend: http://localhost:3000
API runs on: http://localhost:5000/api

📡 API Endpoints (Sample)
GET /api/products

GET /api/products/:id

POST /api/recommendations

POST /api/auth/login

POST /api/cart/add

✨ Highlights
LLM recommendations use product IDs only (no fuzzy matching).

Nutrition + harmful ingredient scoring powered by prompt engineering.

Fast, validated AI responses with caching and smart filtering.

📃 License
MIT License © 2025 Antan Roy
