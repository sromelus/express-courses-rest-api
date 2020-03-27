'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const router = express.Router();
//import models and sequelize from  the db folder
const { sequelize, models } = require('../db');
const {  User  } = models;

router.use(express.json());

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
        res.status(500).json({error});
    }
  }
}

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

  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);

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

const userInputsValidator = [
  //Used "express validator's" check method to validate inputs
    check('firstName', 'Please provide a value for "First Name"').exists(),
    check('lastName', 'Please provide a value for "Last Name"').exists(),
    check('emailAddress', 'Please provide a value for "Email Address"').isEmail(),
    check('password', 'Please provide a value for "Password"').exists()
]


//----------------------------All Routes------------------------------

router.get('/', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.json({
      name: `${user.firstName} ${user.lastName}`,
      email: `${user.emailAddress}`
    });
}));


router.post('/', userInputsValidator, asyncHandler(async(req, res) => {

  //Used "express validator's" validationResult method to check for possible errors
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    const errorMessages = errors.array().map(error => error.msg);
    res.status(400).json({message: errorMessages })
  } else {
    const user = req.body;
    //Use bcrypt to hash user password when they sign up
    user.password = bcryptjs.hashSync(user.password);

      const newUser = await User.create({
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
        password: user.password
      });

   res.status(201).end()
  }
}));

module.exports = router;
