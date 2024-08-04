
# electroGeek

**electroGeek** is an e-commerce platform designed for general consumers to shop for electronic goods. Built using the MERN stack (MongoDB, Express.js, React, Node.js) and enhanced with TypeScript, this web application offers a robust and scalable solution for online shopping.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributors](#contributors)
- [License](#license)

## Introduction

electroGeek is a full-stack web application that provides a seamless shopping experience for electronics enthusiasts. Users can browse, search, and purchase electronic goods with ease. The platform integrates various modern web technologies to ensure a responsive and user-friendly interface, along with a reliable backend to manage data and processes efficiently.

## Features

- **User Authentication**: Secure login and registration system using Google Firebase.
- **Product Catalog**: Browse through a wide range of electronic products.
- **Shopping Cart**: Add items to the cart and proceed to checkout.
- **Search Functionality**: Search for products by name, category, or price.
- **Order Management**: Track your orders and view purchase history.
- **Admin Dashboard**: Manage products, orders, and users.

## Tech Stack

- **Frontend**:
  - React
  - TypeScript
  - Redux
  - Chrome DevTools (for debugging)
  
- **Backend**:
  - Node.js
  - Express.js
  - MongoDB
  - TypeScript
  - node-cache (for caching)
  - multer (for handling file uploads)
  - morgan (for logging)
  
- **Testing & API Development**:
  - Postman

- **Deployment**:
  - Vercel (Frontend)
  - Render (Backend)

## Installation

To run this project locally, follow these steps:

### Prerequisites

- Node.js (v14.x or higher)
- npm or yarn
- MongoDB (local instance or MongoDB Atlas)

### Clone the Repository
Note - To get the frontend files, refer this link -> https://github.com/hradaysadrani/electroGeekFront
\`\`\`bash
cd electroGeek
git clone https://github.com/your-username/electroGeek.git
cd ../electroGeekFront
git clone https://github.com/your-username/electroGeekFront.git

\`\`\`

### Install Dependencies

For both frontend and backend:

\`\`\`bash
# Install server dependencies
cd electroGeek
npm install

# Install client dependencies
cd ../electroGeekFront
npm install
\`\`\`

### Set Up Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

\`\`\`bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=your_cloudinary_url (Cloudinary will be added later to the project)
NODE_ENV=development
PORT=4000
\`\`\`

### Run the Application

\`\`\`bash
# Start the backend server
cd backend
npm run dev

# Start the frontend development server
cd ../frontend
npm start
\`\`\`

Visit `http://localhost:4000` to view the app.

## Usage

Once the application is up and running, users can:

- Browse products on the homepage.
- Register and log in to their accounts.
- Add products to the cart and checkout.
- View order history and manage their profile.

## Configuration

- **Database Configuration**: The app uses MongoDB as its database. Make sure to set up the `MONGO_URI` in your environment variables.
- **Environment Variables**: Sensitive information such as database URIs, API keys, and JWT secrets should be stored in the `.env` file as described in the installation section.
- **Caching**: `node-cache` is used to cache frequently accessed data to improve performance.

## API Documentation

The API endpoints can be tested and documented using Postman.

## Troubleshooting

- **Common Errors**:
  - *MongoDB connection errors*: Ensure your MongoDB server is running and the URI is correctly set.
  - *Frontend not connecting to backend*: Verify that both servers are running and the correct ports are being used.

- **Debugging Tips**:
  - Use Chrome DevTools for inspecting frontend issues.
  - Utilize `morgan` logs for backend request debugging.

## Contributors

- **Hraday Sadrani** - [hradaysadrani](https://github.com/hradaysadrani)

Feel free to contribute to this project by submitting issues or pull requests.
