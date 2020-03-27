'use strict';

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');

//import models and sequelize from  the db folder
const { sequelize, models } = require('../db');
const {  User  } = models;

//import authentication and validation middleware for users
const { authenticateUser, userInputsValidator } = require('../authentications/auth');

// console.log();
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
