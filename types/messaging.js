const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

let connection;

function setConnectionMessaging(conn) {
  connection = conn;
}

function validateUserData(req, res, next) {
  const { message } = req.body;
  if (!message) {
    return res.status(400).send('Message required');
  }
  next(); 
}

router.post('/submit', validateUserData, (req, res) => {
    const { message } = req.body;
  
    if (!connection) {
      return res.status(500).send('No database connection');
    }
  
    const query = 'INSERT INTO messaging (message) VALUES (?)';
  
    connection.query(query, [message], (error, results) => {
      if (error) {
        console.error('Database error:', error.message);
        return res.status(500).send('Database error');
      }
      
      res.status(201).json({results});
    });
  });

  router.put('/updateMessage', (req, res) => {
    const { id, status } = req.body; 
    if (!id) {
        return res.status(400).send('Message ID is required');
    }

    const query = `UPDATE messaging SET status = ? WHERE id = ?`;
    const values = [status || 'processed', id]; 

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Database error:', error.message);
            return res.status(500).send('Database error');
        }

        if (results.affectedRows === 0) {
            return res.status(404).send('Message not found');
        }

        res.status(200).send('Messaging status updated successfully');
    });
});


router.get('/getMessage', (req, res) => {
  const query = 'SELECT * FROM messaging';

  connection.query(query, (error, results) => {
      if (error) {
          console.error('Database error:', error);
          return res.status(500).send('Database error');
      }

      res.status(200).json(results.length > 0 ? results : []);
  });
});


module.exports = { router, setConnectionMessaging };