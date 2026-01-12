# EasyBooking

EasyBooking is a full-stack web application for booking rooms, developed as a university project. It features a React frontend and a Node.js/Express backend with MongoDB for data storage. The project is organized into two main folders: `client` (frontend) and `server` (backend).

## Features

-   **User Authentication**: Register and log in securely with JWT-based authentication.
-   **Room Management**: View available rooms and book them for specific time slots.
-   **Booking Management**: Users can view and manage their bookings.
-   **Role-based Access**: Only authenticated users can book rooms and view their bookings.
-   **RESTful API**: Backend exposes REST endpoints for authentication, room, and booking management.
-   **Modern UI**: Built with React and React Router for a smooth user experience (WIP).
-   **Testing**: Backend includes Jest-based unit tests for controllers, services, and middleware.

## Project Structure

```
EasyBooking/
├── client/      # React frontend
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth context and provider
│       ├── pages/        # Main app pages
│       └── api.js        # Axios instance for API calls
├── server/      # Node.js/Express backend
│   └── src/
│       ├── controller/   # Route controllers
│       ├── middleware/   # Auth and validation middleware
│       ├── models/       # Mongoose models
│       ├── routes/       # Express routes
│       ├── services/     # Logic
│       └── test/         # Jest unit tests
```

## Getting Started

### Prerequisites

-   Node.js (v18+ recommended)
-   npm or yarn
-   MongoDB (local or cloud)

### Backend Setup

1. Navigate to the `server` folder:
    ```bash
    cd server
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a `.env` file with your MongoDB URI and JWT secret:
    ```env
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    ```
4. Start the backend server:
    ```bash
    npm start
    ```

### Frontend Setup

1. Open a new terminal and navigate to the `client` folder:
    ```bash
    cd client
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the React development server:
    ```bash
    npm run dev
    ```

The frontend will run on [http://localhost:5173](http://localhost:5173) and the backend on [http://localhost:3000](http://localhost:3000) by default.

## Running Tests

From the `server` directory, run:

```bash
npm test
```

## API Endpoints (Backend)

-   `POST /api/auth/register` — Register a new user
-   `POST /api/auth/login` — Log in and receive a JWT
-   `GET /api/rooms` — List all rooms
-   `POST /api/bookings` — Create a new booking (auth required)
-   `GET /api/bookings` — List user bookings (auth required)
-   `DELETE /api/bookings/:bookingId` — Cancel a booking (auth required)

## Technologies Used

-   **Frontend**: React, Axios, React Router
-   **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Jest
