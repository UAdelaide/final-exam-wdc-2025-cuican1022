var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let db;

(async () => {
  try {
    db = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'DogWalkService'
    });
    console.log('Connected to DogWalkService database');
  } catch (err) {
    console.error('Error connecting to database:', err);
  }
})();


// API Route 1: /api/dogs - Return the list of dogs along with their sizes and the usernames of their owners
app.get('/api/dogs', async (req, res) => {
  try {
    const [dogs] = await db.execute(`
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
      ORDER BY d.dog_id
    `);
    res.json(dogs);
  } catch (err) {
    console.error('Error fetching dogs:', err);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

// API Route 2: /api/walkrequests/open - Return all dog-walking requests with the status of open
app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [requests] = await db.execute(`
      SELECT 
        wr.request_id,
        d.name AS dog_name,
        wr.requested_time,
        wr.duration_minutes,
        wr.location,
        u.username AS owner_username
      FROM WalkRequests wr
      JOIN Dogs d ON wr.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open'
      ORDER BY wr.requested_time
    `);
    res.json(requests);
  } catch (err) {
    console.error('Error fetching open walk requests:', err);
    res.status(500).json({ error: 'Failed to fetch open walk requests' });
  }
});

// API Route 3: /api/walkers/summary - Return the summary of the ratings for each dog walker
app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [walkers] = await db.execute(`
      SELECT 
        u.username AS walker_username,
        COUNT(wr.rating_id) AS total_ratings,
        CASE 
          WHEN COUNT(wr.rating_id) > 0 
          THEN ROUND(AVG(wr.rating), 1)
          ELSE NULL 
        END AS average_rating,
        COUNT(DISTINCT wa.request_id) AS completed_walks
      FROM Users u
      LEFT JOIN WalkApplications wa ON u.user_id = wa.walker_id AND wa.status = 'accepted'
      LEFT JOIN WalkRatings wr ON u.user_id = wr.walker_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id, u.username
      ORDER BY u.username
    `);
    res.json(walkers);
  } catch (err) {
    console.error('Error fetching walker summary:', err);
    res.status(500).json({ error: 'Failed to fetch walker summary' });
  }
});

// Default route
app.get('/', async (req, res) => {
  res.json({ 
    message: 'Dog Walk Service API',
    endpoints: [
      '/api/dogs',
      '/api/walkrequests/open', 
      '/api/walkers/summary'
    ]
  });
});

app.use(express.static(path.join(__dirname, 'public')));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Dog Walk Service API running on port ${PORT}`);
});

module.exports = app; 