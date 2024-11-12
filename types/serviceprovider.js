const express = require('express');
const router = express.Router();
const mysql = require('mysql2');


let connection;

function setConnectionServiceProvider(conn) {
  connection = conn;
}



function validateUserData(req, res, next) {
  const { providertype, uname, password, email, phonenum, address } = req.body;

  if (!providertype || !uname || !password || !email || !phonenum || !address) {
    return res.status(400).send('ProviderType, Username, Password, Email, PhoneNumber, and Address are required');
  }

  next(); 
}



router.get('/getServiceProvider', (req, res) => {
  const { username, password } = req.query;

  const verify = `SELECT * FROM ServiceProviderrrr WHERE username = ? AND password = ?`;
  connection.query(verify, [username, password], (error, results) => {
      if (error) {
          console.error('Database query error:', error.message);
          return res.status(500).send('Server error occurred.');
      }

      console.log('Query results:', results);
      if (results.length > 0 && results[0].ProviderID) {  // Check for ProviderID
          const userId = results[0].ProviderID;
          return res.status(200).json({ success: true, message: 'Login successful', userId });
      } else {
          return res.status(200).json({ success: false, message: 'Username or password is incorrect' });
      }
  });
});





module.exports = { router, setConnectionServiceProvider };
