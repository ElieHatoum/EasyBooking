# EasyBooking

EasyBooking is a full-stack web application for booking rooms, developed as a university project. It features a React frontend and a Node.js/Express backend with MongoDB for data storage. The project is organized into two main folders: `client` (frontend) and `server` (backend).

## Live Demo

| Service | URL | Status |
| :--- | :--- | :--- |
| **Frontend (Netlify)** | `https://easybookingfs.netlify.app/` | 🟢 Live |
| **Backend (Render)** | `https://easybooking-7zov.onrender.com/` | 🟢 Live |

> **⚠️ Note on API:** The backend is hosted on a free-tier service (Render) which spins down after periods of inactivity. **The first login or request may take up to 60 seconds** while the server "wakes up." Please be patient; subsequent requests will be fast.

## Features

-   **User Authentication**: Register and log in securely with JWT-based authentication.
-   **Room Management**: View available rooms and book them for specific time slots.
-   **Booking Management**: Users can view and manage their bookings.
-   **Role-based Access**: Only authenticated users can book rooms and view their bookings.
-   **RESTful API**: Backend exposes REST endpoints for authentication, room, and booking management.
-   **Modern UI**: Built with React and React Router for a smooth user experience (WIP).
-   **Backend Testing**: Jest+Supertest-based tests for controllers, services, and middleware.
-   **End-to-End Testing**: Cypress tests for comprehensive UI and user flow testing.

## Project Structure

```
EasyBooking/
├── client/      # React frontend
|   ├──cypress/
|   |   └──e2e/
|   |       └──/flow.cy.js # UI and user flow tests
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
│       └── test/         # Jest+Supertest tests
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
    node server.js
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

### Backend Unit Tests

From the `server` directory, run:

```bash
npm test
```

This executes Jest test suites for authentication, bookings, and rooms endpoints.

### Frontend End-to-End Tests

From the `client` directory, run Cypress tests:

```bash
npm run cypress:open
```

This opens the Cypress Test Runner where you can run and debug tests interactively. Alternatively, to run tests headlessly:

```bash
npm run cypress:run
```

The Cypress test suite includes end-to-end tests for user flows such as registration, login, and room booking.

### Continuous Integration

The project includes a CI pipeline that automatically runs all tests on code commits. The CI job:

-   Runs on pull requests and pushes to main branches
-   Executes both backend unit,integration and security tests (Jest) and frontend end-to-end tests (Cypress)
-   Ensures code quality and prevents regressions
-   Deploys automatically to Prod if the tests pass

## API Endpoints (Backend)

-   `POST /api/auth/register` — Register a new user
-   `POST /api/auth/login` — Log in and receive a JWT
-   `GET /api/rooms` — List all rooms
-   `POST /api/bookings` — Create a new booking (auth required)
-   `GET /api/bookings` — List user bookings (auth required)
-   `DELETE /api/bookings/:bookingId` — Cancel a booking (auth required)
-   `GET /api/healthz` — Check if server is UP and Running

## Technologies Used

-   **Frontend**: React, Axios, React Router
-   **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Jest
-   **Testing**: Jest + Supertest (unit, integration, security), Cypress (end-to-end tests)
-   **CI/CD**: GitHub Actions for automated testing and deployment
