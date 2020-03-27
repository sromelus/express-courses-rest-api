'use strict';

const { check, validationResult } = require('express-validator');
const { sequelize, models } = require('../db');
const {  User  } = models;
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');

//Middleware function to get the user credentials from the Authorization header set on the request.
const authenticateUser = async(req, res, next) => {
// Check the Database connection.
  try {
    await sequelize.authenticate();
    console.log('Connection to the database successful!');
  } catch (error) {
    console.error('Error connecting to the database: ', error);
  }

  let message = null;
  let isCredentialsNotEmpty = null;

  //Parse the user's credentials from the Authorization header.
  const credentials = auth(req);

  console.log(credentials);

  if(credentials){

    const users = await User.findAll()
    const user = users.find(user => user.emailAddress === credentials.name);

    if(user){
      // Check if the propective user's password match the user password in the database
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password);

      if (authenticated) {
        console.log(`Authentication succefull for user with email: ${credentials.name}`);
        req.currentUser = user;
      } else {
        message = `Authentication failure for user with email: ${credentials.name}`;
      }
    } else {
       message = `User not found for username: ${credentials.name}`;
    }

  } else {
    message = 'Auth header not found';
  }

  if(message){
    console.warn(message);
    res.status(401).json({ message: 'Access Denied'})
  } else {
    next();
  }
};

const courseInputsValidator = [
  //Used "express validator's" check method to validate inputs
  check("title", 'Please provide a "title"').exists(),
  check("description", 'Please provide a "description"').exists(),
  check("estimatedTime", 'Please provide a "estimatedTime"').exists(),
  check("materialsNeeded", 'Please provide a "materialsNeeded"').exists(),
  check("userId", 'Please provide a "userId"').exists()
]

const userInputsValidator = [
  //Used "express validator's" check method to validate inputs
    check('firstName', 'Please provide a value for "First Name"').exists(),
    check('lastName', 'Please provide a value for "Last Name"').exists(),
    check('emailAddress', 'Please provide a value for "Email Address"').isEmail(),
    check('password', 'Please provide a value for "Password"').exists()
]

const authentication = {}
authentication.authenticateUser = authenticateUser;
authentication.courseInputsValidator = courseInputsValidator;
authentication.userInputsValidator = userInputsValidator;


module.exports = authentication;
