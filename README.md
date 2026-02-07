# Hotel Room Management System

A full-stack web application for managing hotel operations with a frontend (HTML, CSS, JavaScript) and backend (Node.js, Express) connected to a SQLite database.

Live Demo: https://hotel-room-management-system.vercel.app/

## Developers

**Prathamesh Barbole** - Lead Developer

**Tanish Patidar** - Developer

**Shreyash Nikam** - Developer

## Features

- Customer management
- Room management
- Booking system
- Payment tracking
- Staff management
- Dashboard with statistics
- Real-time data visualization
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the environment variables in the [.env](.env) file if needed (defaults will work for most setups)

4. Start the server:
   ```bash
   npm start
   ```
   or for development with auto-restart:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3003`

## Project Structure

```
hotel-management-system/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── .env
├── package.json
├── server.js
├── hotel.db (created automatically when you run the app)
└── README.md
```

## API Endpoints

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Add a new customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/available` - Get available rooms
- `POST /api/rooms` - Add a new room

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create a new booking

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Add a new payment

### Staff
- `GET /api/staff` - Get all staff members
- `POST /api/staff` - Add a new staff member

### Database Management
- `DELETE /api/drop-database` - Drop all database tables (use with caution)

## Database Schema

The application automatically creates the following tables in a SQLite database file named `hotel.db`:

1. **Customers** - Stores customer information (customer_id, name, phone, email, address)
2. **Rooms** - Stores room details and availability (room_id, room_type, price_per_night, is_available)
3. **Bookings** - Stores booking information (booking_id, customer_id, room_id, check_in_date, check_out_date, total_amount)
4. **Payments** - Stores payment records (payment_id, booking_id, payment_date, amount, payment_method)
5. **Staff** - Stores staff information (staff_id, name, role, phone, email)

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Database Driver**: sqlite3
- **CORS**: cors package for cross-origin requests
- **Environment Management**: dotenv

## Application Features

### Dashboard
- Real-time statistics cards showing key metrics
- Recent bookings display
- Database management controls

### Navigation
- Intuitive tab-based navigation system
- Responsive design that works on desktop and mobile devices

### Data Management
- Full CRUD operations for all entities
- Form validation and error handling
- Confirmation dialogs for destructive actions

### User Interface
- Modern gradient-based design
- Smooth animations and transitions
- Modal dialogs for data entry
- Responsive tables with hover effects

## Customization

You can modify the following files to customize the application:

- [public/index.html](public/index.html) - Main HTML structure
- [public/styles.css](public/styles.css) - Styling
- [public/script.js](public/script.js) - Frontend JavaScript functionality
- [server.js](server.js) - Backend API endpoints and database connections
- [.env](.env) - Environment variables and configuration

## Academic Information

This project was developed as a mini project for the Database Management Systems course at Dr. D.Y. Patil College of Engineering, Akurdi.

## Contributing

This project was developed by students as an academic assignment. For issues or suggestions, please contact the developer.

## License


This project is developed for educational purposes only.
