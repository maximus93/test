const express = require ('express');
require ('express-async-errors');
const cors = require ('cors');
const app = express ();
const mongoose = require ('mongoose');
const bodyParser = require ('body-parser');

//database connection
require ('./config/db');

//Models
require ('./models/Voucher');
require ('./models/VoucherLog');
require ('./models/User');

//Middleware
/* URL PERSING */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Routes
app.use ('/api/user', require ('./controllers/User'));

//Not Found Route
app.use ((req, res, next) => {
  req.status = 404;
  const error = new Error ('404! Routes not found');
  next (error);
});

//error handler
if (app.get ('env') === 'production') {
  app.use ((error, req, res, next) => {
    res.status (req.status || 500).send ({
      message: error.message,
    });
  });
}

app.use ((error, req, res, next) => {
  res.status (req.status || 500).send ({
    message: error.message,
    stack: error.stack,
  });
});

var port = process.env.PORT || 8000;

app.listen (port , function () {
  console.log ('Server is runninggg on port: '+ port);
});
