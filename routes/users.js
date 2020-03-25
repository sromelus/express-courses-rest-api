'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const router = express.Router();

const { sequelize, models } = require('../db');
const {  User, Course  } = models;

router.use(express.json());

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

const authenticateUser = async(req, res, next) => {
  let message = null;

  const credentials = auth(req);

  console.log(credentials);

  if(credentials){
    const users = await User.findAll()
    const user = users.find(user => user.emailAddress === credentials.name);
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


router.get('/', authenticateUser, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (e) {
    throw e
  }
});

router.post('/', authenticateUser, async(req, res) => {
  const users = await User.findAll();

});


// router.get('/', async (req, res) => {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection to the database successful!');
//     const users = await User.findAll({
//       include: [
//         {
//          model: Course,
//          as: 'userCourse'
//        }
//      ]
//     })
//     // console.log(users.map(user => user.get({ plain: true })));
//
//
//     const courses = await Course.findAll({
//       include: [
//         {
//          model: User,
//          as: 'userCourse'
//        }
//      ]
//     })
//     // console.log(courses.map(course => course.get({ plain: true })));
//
//     res.json({users, courses})
//     // console.log(users);
//
//   } catch (error) {
//     console.error('Error connecting to the database: ', error);
//   }
//
//   // res.json({
//   //   message: 'Welcome to the REST API project!',
//   // });
// });

module.exports = router;
