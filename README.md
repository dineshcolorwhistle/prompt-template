# Industry-Tested Prompt Template Platform

A curated marketplace for ready-to-use AI prompt templates. Users can browse, fill in variables, and copy high-quality prompt templates.

## 🚀 Core Concept

This platform serves as a library/marketplace for **industry-tested prompt templates**. 
*   **Structured Templates**: Each template has a fixed tone, output format, and structure.
*   **Variable Customization**: Users fill in predefined variables to generate the final prompt.
*   **No AI Execution**: The app **does NOT** run AI models. It is a management tool for prompts, not a chatbot.

## 🛠 Tech Stack

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS, Framer Motion
*   **State Management**: Zustand / Redux Toolkit
*   **Fetching**: React Query

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB Atlas
*   **Authentication**: JWT & bcrypt

## 📦 Project Structure

```
prompt-template/
├── client/          # Vite + React Frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/          # Node.js + Express Backend
│   ├── models/      # Mongoose Schemas
│   ├── controllers/ # Route Logic
│   ├── routes/      # API Routes
│   ├── middleware/  # Auth & Error Handling
│   ├── index.js     # Entry point
│   └── package.json
└── README.md
```

## 🏁 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas URI)

### 1. Setup Backend
1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    Create a `.env` file in `server/` with:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/prompt-template
    JWT_SECRET=your_jwt_secret_key
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```
    The server will run on `http://localhost:5000`.

### 2. Setup Frontend
1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will run on `http://localhost:5173`.

## 👥 User Roles

*   **Guest**: Browse templates, view ratings.
*   **Registered User**: Copy prompts, save templates, rate.
*   **Expert**: Submit & manage own templates.
*   **Admin**: Manage users, templates, and approvals.

## 📝 License

This project is licensed under the ISC License.
