// routes/healthcheck.js
const express = require('express');
const router = express.Router();
const pool = require('../lib/db');

router.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'not connected' });
  }
});

module.exports = router;
