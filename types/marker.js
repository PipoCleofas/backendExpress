const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

let connection;

function setConnectionMarker(conn) {
  connection = conn;
}

function validateMarker(req, res, next) {
  const { latitude, longitude, title, description } = req.body;

  if (!latitude || !longitude || !title || !description) {
    return res.status(400).send('latitude, longitude, title, and description are required');
  }

  next();
}


router.post('/submit', validateMarker ,(req, res) => {
  const { latitude, longitude, title, description, UserID } = req.body;

  const query = 'INSERT INTO markerrr (latitude, longitude, title, description, UserID) VALUES (?, ?, ?, ?, ?)';

  connection.query(query, [latitude, longitude, title, description, UserID], (error, results) => {
    if (error) {
      console.error('Database error:', error.message);
      return res.status(500).send('Database error');
    }
    res.status(200).json({
       message: 'Data saved successfully',
       id: results.id 
    });
  });
});

router.get('/getMarker/:marker', (req, res) => {
  const marker = req.params.marker;

  if (!marker) {
    return res.status(400).send('Marker is required');
  }

  const query = `SELECT * FROM markerrr WHERE title = CONCAT(?, ' Assistance Request')`;

  connection.query(query, [marker], (error, results) => {
    if (error) {
      console.error('Database error:', error.message);
      return res.status(500).send('Database error');
    }

    return res.status(200).json(results);
  });
});

router.get('/getStation/:marker', (req, res) => {
  const marker = req.params.marker;

  if (!marker) {
    return res.status(400).send('Marker is required');
  }

  const query = `SELECT * FROM markerrr WHERE title = CONCAT(?, ' Station')`;

  connection.query(query, [marker], (error, results) => {
    if (error) {
      console.error('Database error:', error.message);
      return res.status(500).send('Database error');
    }

    return res.status(200).json(results);
  });
});

router.put('/updateMarkerDesc/:id', (req, res) => {
  const id = req.params.id;  
  const { newDesc } = req.body;  
  if (!newDesc) {
    return res.status(400).send('New description is required');
  }

  const query = `UPDATE markerrr SET description = ? WHERE UserID = ?`;
  const values = [newDesc, id]; 
  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Database error:', error.message);
      return res.status(500).send('Database error');
    }

    if (results.affectedRows === 0) {
      return res.status(404).send('Marker not found');
    }

    res.status(200).send('Marker title updated successfully');
  });
});


router.put('/updateMarkerTitle/:id', (req, res) => {
  const id = req.params.id;  
  const { newTitle } = req.body;  
  if (!newTitle) {
    return res.status(400).send('New title is required');
  }

  const query = `UPDATE markerrr SET title = ? WHERE UserID = ?`;
  const values = [newTitle, id]; 
  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Database error:', error.message);
      return res.status(500).send('Database error');
    }

    if (results.affectedRows === 0) {
      return res.status(404).send('Marker not found');
    }

    res.status(200).send('Marker title updated successfully');
  });
});

router.get('/getService/:service', (req, res) => {
  const service = req.params.service;

  if (!service) {
    return res.status(400).send('Service is required');
  }

  const query = 'SELECT * FROM markerrr WHERE title = ?';

  connection.query(query, [service], (error, results) => {
    if (error) {
      console.error('Database error:', error.message);
      return res.status(500).send('Database error');
    }

    return res.status(200).json(results);
  });
});



router.post('/:SPtype/submitMarkerSP', validateMarker, (req, res) => {
  const { latitude, longitude, description, UserID } = req.body;
  const title = req.params.SPtype;  // Using SPtype as title

  const checkQuery = 'SELECT * FROM markerrr WHERE title = ?';

  connection.query(checkQuery, [title], (error, results) => {
    if (error) {
      console.error('Database error:', error.message, error);
      return res.status(500).send('Database error');
    }

    if (results.length > 0) {
      const updateQuery = 'UPDATE markerrr SET latitude = ?, longitude = ?, description = ? WHERE title = ?';
      connection.query(updateQuery, [latitude, longitude, description, title], (error, updateResults) => {
        if (error) {
          console.error('Database error during update:', error.message, error);
          return res.status(500).send('Database error');
        }
        return res.status(200).json({
          message: 'Marker updated successfully',
          updatedRows: updateResults.affectedRows
        });
      });
    } else {
      const insertQuery = 'INSERT INTO markerrr (latitude, longitude, title, description, UserID) VALUES (?, ?, ?, ?, ?)';
      connection.query(insertQuery, [latitude, longitude, title, description, UserID], (error, insertResults) => {
        if (error) {
          console.error('Database error during insert:', error.message, error);
          return res.status(500).send('Database error');
        }
        res.status(201).json({
          message: 'Marker created successfully',
          id: insertResults.insertId
        });
      });
    }
  });
});


router.put('/updateMarker/:title', (req, res) => {
  const title = req.params.title;  
  const { newLatitude, newLongitude } = req.body;  

  if (newLatitude === undefined || newLongitude === undefined) {
    return res.status(400).send('Latitude and longitude are required');
  }

  const query = `UPDATE markerrr SET latitude = ?, longitude = ? WHERE title = ?`;
  const values = [newLatitude, newLongitude, title];  

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Database error:', error.message);
      return res.status(500).send('Database error');
    }

    if (results.affectedRows === 0) {
      return res.status(404).send('Marker not found');
    }

    res.status(200).send('Marker updated successfully');
  });
});


router.get('/checkMarkerTitleExists', (req, res) => {
  const { title } = req.query;  // Extract 'title' from the query parameters

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const checkQuery = 'SELECT * FROM markerrr WHERE title = ?';
  connection.query(checkQuery, [title], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).send('Database error');
    }

    if (results.length > 0) {
      return res.status(200).json({ 
        message: 'Marker with this title already exists',
        data: results 
      });
    } else {
      return res.status(404).json({ 
        message: 'No marker with this title exists', 
        data: null 
      });
    }
  });
});




module.exports = { router, setConnectionMarker };
