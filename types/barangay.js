const express = require('express');
const router = express.Router();
const mysql = require('mysql2');


let connection;

function setConnectionBarangay(conn) {
  connection = conn;
}



function validateUserData(req, res, next) {
  const { barangayname, sitio } = req.body;

  if (!barangayname || !sitio) {
    return res.status(400).send('BarangayName and Sitio are required');
  }

  next();
}

router.post('/getBarangays', validateUserData, (req, res) => {
  const { barangayname, sitio } = req.body;

  const query = 'INSERT INTO Barangay (BarangayName, Sitio) VALUES (?, ?)';

  connection.query(query, [barangayname, sitio], (error, results) => {
    if (error) {
      console.error('Database error:', error.message);
      return res.status(500).send('Database error');
    }
    res.status(201).send('Data saved successfully');
  });
});

router.get('/getBarangay', (req, res) => {
  const { username, password } = req.query;

  const verify = `SELECT * FROM Barangay WHERE BarangayName = ? AND Password = ?`;

  connection.query(verify, [username, password], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).send('Database error');
    }

    if (results.length > 0) {
      const user = results[0];
      return res.status(200).json({
        barangayname: user.BarangayName
      });
    } else {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  });
});

module.exports = { router, setConnectionBarangay };
