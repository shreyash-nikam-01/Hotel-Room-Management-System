const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
const db = new sqlite3.Database('./hotel.db', (err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to SQLite database');
  
  // Create tables
  createTables();
});

// Create tables
function createTables() {
  const createCustomersTable = `
    CREATE TABLE IF NOT EXISTS Customers (
      customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT
    )
  `;
  
  const createRoomsTable = `
    CREATE TABLE IF NOT EXISTS Rooms (
      room_id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_type TEXT NOT NULL,
      price_per_night REAL NOT NULL,
      is_available INTEGER DEFAULT 1
    )
  `;
  
  const createBookingsTable = `
    CREATE TABLE IF NOT EXISTS Bookings (
      booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      check_in_date TEXT NOT NULL,
      check_out_date TEXT NOT NULL,
      total_amount REAL NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
      FOREIGN KEY (room_id) REFERENCES Rooms(room_id)
    )
  `;
  
  const createPaymentsTable = `
    CREATE TABLE IF NOT EXISTS Payments (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      payment_date TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
    )
  `;
  
  const createStaffTable = `
    CREATE TABLE IF NOT EXISTS Staff (
      staff_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT,
      email TEXT
    )
  `;
  
  db.run(createCustomersTable, (err) => {
    if (err) console.error('Error creating Customers table:', err);
  });
  
  db.run(createRoomsTable, (err) => {
    if (err) console.error('Error creating Rooms table:', err);
  });
  
  db.run(createBookingsTable, (err) => {
    if (err) console.error('Error creating Bookings table:', err);
  });
  
  db.run(createPaymentsTable, (err) => {
    if (err) console.error('Error creating Payments table:', err);
  });
  
  db.run(createStaffTable, (err) => {
    if (err) console.error('Error creating Staff table:', err);
  });
  
  console.log('Database tables initialized');
}

// Drop all database tables
app.delete('/api/drop-database', (req, res) => {
  const dropTables = [
    'DROP TABLE IF EXISTS Payments',
    'DROP TABLE IF EXISTS Bookings',
    'DROP TABLE IF EXISTS Staff',
    'DROP TABLE IF EXISTS Rooms',
    'DROP TABLE IF EXISTS Customers'
  ];
  
  let dropCount = 0;
  let errorOccurred = false;
  
  dropTables.forEach(query => {
    db.run(query, (err) => {
      dropCount++;
      
      if (err) {
        console.error(`Error dropping table: ${err}`);
        errorOccurred = true;
      }
      
      // When all tables have been processed
      if (dropCount === dropTables.length) {
        if (errorOccurred) {
          res.status(500).send({ message: 'Error dropping database tables' });
        } else {
          // Recreate tables
          createTables();
          res.json({ message: 'Database tables dropped and recreated successfully' });
        }
      }
    });
  });
});

// Routes

// Get all customers
app.get('/api/customers', (req, res) => {
  const query = 'SELECT * FROM Customers';
  db.all(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

// Add a new customer
app.post('/api/customers', (req, res) => {
  const { name, phone, email, address } = req.body;
  const query = 'INSERT INTO Customers (name, phone, email, address) VALUES (?, ?, ?, ?)';
  db.run(query, [name, phone, email, address], function(err) {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ id: this.lastID, name, phone, email, address });
  });
});

// Update a customer
app.put('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const { name, phone, email, address } = req.body;
  const query = 'UPDATE Customers SET name = ?, phone = ?, email = ?, address = ? WHERE customer_id = ?';
  db.run(query, [name, phone, email, address, customerId], function(err) {
    if (err) {
      res.status(500).send(err);
      return;
    }
    if (this.changes === 0) {
      res.status(404).send({ message: 'Customer not found' });
      return;
    }
    res.json({ id: customerId, name, phone, email, address });
  });
});

// Delete a customer
app.delete('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  
  // First check if customer has any bookings
  const checkBookingsQuery = 'SELECT COUNT(*) as count FROM Bookings WHERE customer_id = ?';
  db.get(checkBookingsQuery, [customerId], (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    
    if (result.count > 0) {
      // Customer has bookings, cannot delete
      res.status(400).send({ message: 'Cannot delete customer with existing bookings' });
      return;
    }
    
    // No bookings, safe to delete
    const deleteQuery = 'DELETE FROM Customers WHERE customer_id = ?';
    db.run(deleteQuery, [customerId], function(err) {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (this.changes === 0) {
        res.status(404).send({ message: 'Customer not found' });
        return;
      }
      res.json({ message: 'Customer deleted successfully' });
    });
  });
});

// Get all rooms
app.get('/api/rooms', (req, res) => {
  const query = 'SELECT * FROM Rooms';
  db.all(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

// Get available rooms
app.get('/api/rooms/available', (req, res) => {
  const query = 'SELECT * FROM Rooms WHERE is_available = 1';
  db.all(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

// Add a new room
app.post('/api/rooms', (req, res) => {
  const { room_type, price_per_night, is_available } = req.body;
  const query = 'INSERT INTO Rooms (room_type, price_per_night, is_available) VALUES (?, ?, ?)';
  db.run(query, [room_type, price_per_night, is_available ? 1 : 0], function(err) {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ id: this.lastID, room_type, price_per_night, is_available });
  });
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
  const query = `
    SELECT b.*, c.name as customer_name, r.room_type 
    FROM Bookings b 
    JOIN Customers c ON b.customer_id = c.customer_id
    JOIN Rooms r ON b.room_id = r.room_id
  `;
  db.all(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

// Create a new booking
app.post('/api/bookings', (req, res) => {
  const { customer_id, room_id, check_in_date, check_out_date, total_amount } = req.body;
  const query = 'INSERT INTO Bookings (customer_id, room_id, check_in_date, check_out_date, total_amount) VALUES (?, ?, ?, ?, ?)';
  db.run(query, [customer_id, room_id, check_in_date, check_out_date, total_amount], function(err) {
    if (err) {
      res.status(500).send(err);
      return;
    }
    
    // Update room availability
    const updateRoomQuery = 'UPDATE Rooms SET is_available = 0 WHERE room_id = ?';
    db.run(updateRoomQuery, [room_id], (err) => {
      if (err) {
        console.error('Error updating room availability:', err);
      }
    });
    
    res.json({ id: this.lastID, customer_id, room_id, check_in_date, check_out_date, total_amount });
  });
});

// Get all payments
app.get('/api/payments', (req, res) => {
  const query = `
    SELECT p.*, b.customer_id, c.name as customer_name
    FROM Payments p
    JOIN Bookings b ON p.booking_id = b.booking_id
    JOIN Customers c ON b.customer_id = c.customer_id
  `;
  db.all(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

// Add a payment
app.post('/api/payments', (req, res) => {
  const { booking_id, payment_date, amount, payment_method } = req.body;
  const query = 'INSERT INTO Payments (booking_id, payment_date, amount, payment_method) VALUES (?, ?, ?, ?)';
  db.run(query, [booking_id, payment_date, amount, payment_method], function(err) {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ id: this.lastID, booking_id, payment_date, amount, payment_method });
  });
});

// Get all staff
app.get('/api/staff', (req, res) => {
  const query = 'SELECT * FROM Staff';
  db.all(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

// Add staff member
app.post('/api/staff', (req, res) => {
  const { name, role, phone, email } = req.body;
  const query = 'INSERT INTO Staff (name, role, phone, email) VALUES (?, ?, ?, ?)';
  db.run(query, [name, role, phone, email], function(err) {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ id: this.lastID, name, role, phone, email });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});