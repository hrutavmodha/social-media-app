# Social Media App

This is a full-stack social media application, designed to provide core functionalities expected in a modern social platform. Users can register, log in, create and interact with posts, follow other users, and receive notifications.

## Features

**Core Functionality:**
*   User Authentication (Register, Login, Logout)
*   Password Management (Forgot Password, Reset Password)
*   User Profiles (View own, view others, update profile)
*   Post Management (Create, Edit, Delete posts)
*   Post Interactions (Like/Unlike posts, Comment on posts)
*   User Following (Follow/Unfollow other users)
*   Search Functionality (Search for users and posts)
*   Notifications System (In-app notifications for follows, likes, comments)
*   Dynamic Widgets (Trending posts, Who to Follow suggestions)

**Technical & Quality Improvements:**
*   Comprehensive client-side form validation for critical forms (Login, Register, Create/Edit Post, Forgot/Reset Password).
*   Robust server-side input validation and consistent error handling across all controllers.
*   Ensured code quality through ESLint (client-side) and TypeScript type checking.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (LTS version recommended)
*   pnpm (Package manager: `npm install -g pnpm`)
*   PostgreSQL database

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/social-media-app.git
    cd social-media-app
    ```

2.  **Install dependencies:**
    This project uses `pnpm` workspaces. Run the following command from the project root:
    ```bash
    pnpm install
    ```

3.  **Database Setup:**
    *   Create a PostgreSQL database.
    *   Update the database connection details in `server/config/db.ts` (or preferably via environment variables).
    *   Run the schema found in `server/config/drop_tables.sql` (Note: this drops existing tables, use with caution for initial setup). You'll need to create the `posts`, `users`, `medias`, `comments`, `likes`, `followers`, and `notifications` tables. A proper schema migration tool would be used in a production setup.

4.  **Environment Variables:**
    Create a `.env` file in the `server/` directory and add the following:
    ```
    HOST=localhost
    PORT=3000
    FRONTEND_PORT=5173
    JWT_KEY=your_secret_jwt_key
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password
    DB_USER=your_db_user
    DB_HOST=your_db_host
    DB_DATABASE=your_db_name
    DB_PASSWORD=your_db_password
    DB_PORT=5432
    ```
    Adjust values as necessary.

### Running the Project

1.  **Start the server:**
    Open a terminal in the project root and navigate to the `server` directory:
    ```bash
    cd server
    pnpm start # Or 'node dist/server.js' if you have a build step
    ```

2.  **Start the client:**
    Open a new terminal in the project root and navigate to the `client` directory:
    ```bash
    cd client
    pnpm dev
    ```

3.  Open your browser to `http://localhost:5173` (or whatever `FRONTEND_PORT` you configured).

## Technologies Used

*   **Frontend:** React, TypeScript, Vite, React Router DOM, TailwindCSS, React Hot Toast
*   **Backend:** Node.js, Express.js, TypeScript, PostgreSQL, bcrypt, jsonwebtoken, multer, nodemailer
*   **Package Manager:** pnpm

## License

(To be added - e.g., MIT License)
