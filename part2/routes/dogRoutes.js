const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET to obtain all the dog information - for home page display
router.get('/', async (req, res) => {
  try {
    // Query all the information of the dogs, including the names of the owners
    const [rows] = await db.query(`
      SELECT d.dog_id, d.name, d.size, u.username as owner_name
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
      ORDER BY d.name ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error in obtaining all dog information:', error);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

// GET obtains the list of dogs of the currently logged-in user
router.get('/my-dogs', async (req, res) => {
  // Check whether the user has logged in
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  // Check whether the user is the owner role
  if (req.session.user.role !== 'owner') {
    return res.status(403).json({ error: 'Only owners can access dog list' });
  }

  try {
    // Query all the dogs owned by the current user
    const [rows] = await db.query(`
      SELECT dog_id, name, size 
      FROM Dogs 
      WHERE owner_id = ?
      ORDER BY name ASC
    `, [req.session.user.user_id]);

    res.json(rows);
  } catch (error) {
    console.error('Error in obtaining the dog list:', error);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

module.exports = router;