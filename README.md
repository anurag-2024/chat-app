# ChatApp

A real-time chat application built with **React**, **Node.js**, **Express**, and **Socket.IO**, styled with **TailwindCSS** and **Shadcn UI components**. This project allows users to register, log in, and communicate in real-time with other users.

## Features

- **User Authentication**: Secure registration and login system with JWT-based authentication.
- **Real-Time Messaging**: Chat functionality powered by Socket.IO for seamless real-time updates.
- **Responsive Design**: Clean and modern user interface using TailwindCSS and Shadcn components.
- **Typing Indicators**: Displays when a user is typing.
- **Online Status**: Shows online/offline status of users.

---

## Installation

### Prerequisites
Ensure you have the following installed:

- **Node.js** (v16 or later)
- **npm** or **yarn**

### Steps to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chatapp.git
   cd chatapp
   ```

2. Install dependencies:
   ```bash
   # For the backend
   cd server
   npm install

   # For the frontend
   cd ../client
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/chatapp
   JWT_SECRET=your_secret_key
   ```

4. Start the backend server:
   ```bash
   cd server
   npm start
   ```

5. Start the frontend:
   ```bash
   cd ../client
   npm start
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```