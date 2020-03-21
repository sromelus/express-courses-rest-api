'use strict';

const { sequelize, models } = require('./db');

const {  User, Course  } = models;

const express = require('express');
const morgan = require('morgan');

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// TODO setup your api routes here

// setup a friendly greeting for the root route
app.get('/', async (req, res) => {

  try {
    await sequelize.authenticate();
    console.log('Connection to the database successful!');
    const users = await User.findAll({
      include: [
        {
         model: Course,
         as: 'user'
       }
     ]
    })
    console.log(users.map(user => user.get({ plain: true })));

  } catch (error) {
    console.error('Error connecting to the database: ', error);
  }

  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
