# VeggIO - Healthy Food Ordering Platform

VeggIO is a comprehensive MERN stack-based food ordering website focused on healthy eating. The platform includes features like food ordering, calorie tracking, expense tracking, and an intelligent chatbot assistant (ChefBot).

## Features

- **User Authentication**: Secure registration and login system
- **Food Ordering**: Browse menu, add items to cart, and place orders
- **ChefBot**: AI-powered chatbot for food recommendations and assistance
- **Calorie Tracker**: Monitor daily calorie intake with detailed nutritional information
- **Expense Tracker**: Track food expenses and manage budget
- **Order Tracking**: Real-time updates on order status
- **Responsive Design**: Material UI-based interface that works on all devices

## Tech Stack

### Frontend

- React.js
- Material UI
- React Router
- Recharts (for data visualization)
- Axios
- Socket.io Client

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.io

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/veggio.git
cd veggio
```

2. Install server dependencies

```bash
cd server
npm install
```

3. Install client dependencies

```bash
cd ../client
npm install
```

4. Configure environment variables

   - Create a `.env` file in the server directory based on the `.env.example` file
   - Set your MongoDB URI, JWT secret, and other configuration options

5. Run the development server

```bash
# In the server directory
npm run dev

# In the client directory (in a separate terminal)
npm start
```

6. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
veggio/
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── components/     # Reusable components
│       ├── context/        # Context providers
│       ├── pages/          # Page components
│       └── utils/          # Utility functions
│
└── server/                 # Node.js backend
    ├── controllers/        # Route controllers
    ├── middleware/         # Custom middleware
    ├── models/             # Mongoose models
    ├── routes/             # API routes
    ├── services/           # Business logic
    └── utils/              # Utility functions
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Food Items

- `GET /api/food` - Get all food items
- `GET /api/food/:id` - Get food item by ID
- `POST /api/food` - Create a food item (admin)
- `PUT /api/food/:id` - Update a food item (admin)
- `DELETE /api/food/:id` - Delete a food item (admin)
- `POST /api/food/:id/reviews` - Add a review to a food item
- `GET /api/food/recommendations` - Get food recommendations

### Cart

- `GET /api/users/cart` - Get user's cart
- `POST /api/users/cart` - Add item to cart
- `PUT /api/users/cart/:itemId` - Update cart item quantity
- `DELETE /api/users/cart/:itemId` - Remove item from cart
- `DELETE /api/users/cart` - Clear cart

### Orders

- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (admin)
- `PUT /api/orders/:id/cancel` - Cancel order
- `PUT /api/orders/:id/feedback` - Add order feedback

### Calorie Tracker

- `GET /api/users/calorie-tracker/date/:date` - Get calorie tracker for a specific date
- `GET /api/users/calorie-tracker/range` - Get calorie tracker for a date range
- `GET /api/users/calorie-tracker/summary` - Get calorie summary
- `PUT /api/users/calorie-tracker/goal` - Update calorie goal

### Expense Tracker

- `GET /api/users/expense-tracker/month/:year/:month` - Get expense tracker for a specific month
- `GET /api/users/expense-tracker/range` - Get expense tracker for a date range
- `GET /api/users/expense-tracker/summary` - Get expense summary
- `PUT /api/users/expense-tracker/budget` - Update budget

### ChefBot

- `GET /api/chatbot/history` - Get chat history
- `POST /api/chatbot/message` - Send message to chatbot
- `DELETE /api/chatbot/history` - Clear chat history

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Material UI for the beautiful components
- Unsplash for the food images
- MongoDB for the database
- Express.js for the server framework
- React.js for the frontend library
