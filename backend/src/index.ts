import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

// Initialize Express application
const app = express();

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),

  ssl: {
    rejectUnauthorized: false,
  },
});

// Simple test endpoint
app.get('/api/message', (req, res) => {
  // Returns a simple JSON response
  res.json({ text: 'Hello from the backend!' });
});

// Database interaction endpoint
app.get('/api/data', async (req, res) => {
  try {
    // Query the database
    const result = await pool.query('SELECT * FROM sample_data');

    // Return query results
    res.json(result.rows);
  } catch (err) {
    console.error("🔥 REAL DB ERROR:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : err
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Server configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});