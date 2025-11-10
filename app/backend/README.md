# StyleVault Backend

This is the backend API for the StyleVault e-commerce application. It is built with Node.js, Express, and MongoDB (via Mongoose) and is responsible for handling order storage and related operations.

---

## Features

- Store customer orders in MongoDB
- RESTful API for order creation
- Easy integration with the StyleVault frontend
- CORS enabled for local development

---

## Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- dotenv
- CORS

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)

### Installation

1. **Clone the repository** (if not already done):

   ```sh
   git clone https://github.com/yourusername/stylevault-app.git
   cd stylevault-app/backend
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

### Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```env
MONGO_URI=mongodb://localhost:27017/stylevault
PORT=5000
```

- Adjust `MONGO_URI` if using a remote MongoDB instance.

### Running the Server

Start the backend server in development mode (with auto-reload):

```sh
npm run dev
```

Or in production mode:

```sh
npm start
```

The server will run on `http://localhost:5000` by default.

---

## API Endpoints

### Create Order

- **POST** `/api/orders`
- **Description:** Store a new order in the database.
- **Request Body Example:**

  ```json
  {
    "items": [
      {
        "id": "123",
        "name": "T-Shirt",
        "price": 19.99,
        "imageUrl": "/images/tshirt.jpg",
        "quantity": 2,
        "size": "M",
        "color": "Blue"
      }
    ],
    "total": 39.98,
    "shippingInfo": {
      "name": "John Doe",
      "address": "123 Main St",
      "city": "New York",
      "postalCode": "10001",
      "country": "USA"
    }
  }
  ```

- **Response Example:**

  ```json
  {
    "message": "Order saved",
    "orderId": "60f7c2b8e1b1c8a1b8e1b1c8"
  }
  ```

---

## Project Structure

```
backend/
│
├── models/
│   └── Order.js         # Mongoose schema/model for orders
├── routes/
│   └── orderRoutes.js   # Express routes for order endpoints
├── .env                 # Environment variables
├── package.json         # Node.js dependencies and scripts
├── server.js            # Entry point for the Express server
└── README.md            # Project documentation
```
---