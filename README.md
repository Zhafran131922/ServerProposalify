# Proposalify Backend

Proposalify is a website to build your own proposal which is built with Node.js, Express, and MongoDB. It allows users to submit, edit, delete, and send proposals to administrators. Administrators can view and manage submitted proposals. The Administrators will forward
the specified proposal to the lecturer.

## Features

- User authentication and authorization
- Create, edit, delete, and view proposals
- Send proposals to administrators
- Admin can view and manage user proposals
- Lecturer can review the proposal
- Email Notification

## Prerequisites

- Node.js
- MongoDB
- NPM (Node Package Manager)

## Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/Proposalify/Server.git
    cd Server
    ```

2. **Install dependencies**

    Run the following command to install the required dependencies:

    ```bash
    npm install
    ```

3. **Set up environment variables**

    Create a `.env` file in the root of the project with the following content:

    ```
    PORT=5000
    DB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    EMAIL=for_email_notifications
    PASSWORD=for_email_notifications
    ```

    Replace `your_mongodb_connection_string` with your MongoDB connection string and `your_jwt_secret_key` with a secret key for JWT.
     also replace your email and password with your own account

## Running the Application

1. **Start the MongoDB server**

    Make sure your MongoDB server is running.
    the messages will be like this (Connected to MongoDB)

2. **Run the application**

    ```bash
    npm start
    ```

    The server will start running on `http://localhost:5000`.

## API Endpoints
https://documenter.getpostman.com/view/30175213/2sA3kXEfh3


