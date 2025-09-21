# Offers Mini App

This is a simple web application built with Angular and Node.js that demonstrates user authentication.

## Prerequisites

- Node.js and npm installed on your machine.

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the application:**

   You need to run the Angular front-end and the Node.js back-end in separate terminals.

   **Terminal 1 (for Angular front-end):**

   ```bash
   npm start
   ```

   **Terminal 2 (for Node.js back-end):**

   ```bash
   npm run serve:api
   ```

4. **Open the application in your browser:**

   The Angular application will be available at `http://localhost:4200`.

## Test Users

You can use the following credentials to log in:

- **Username:** `user1`
- **Password:** `password123`

- **Username:** `admin`
- **Password:** `adminpassword`

## Project Structure

- `server.js`: The Node.js Express server that handles authentication.
- `src/app/app.component.ts`: The main Angular component that contains the UI and front-end logic.
- `angular.json`: The Angular project configuration file.
- `package.json`: The project dependencies and scripts.

## Available Scripts

- `npm start`: Starts the Angular development server.
- `npm run build`: Builds the Angular application for production.
- `npm run serve:api`: Starts the Node.js back-end server.
- `npm test`: Runs the Angular unit tests.
# angular-app
