'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const router = express.Router();

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
  try {
    await sequelize.authenticate();
    console.log('Connection to the database successful!');
  } catch (error) {
    console.error('Error connecting to the database: ', error);
  }

  let message = null;
  let isCredentialsNotEmpty = null;

  const credentials = auth(req);

  if(credentials){

    const users = await User.findAll()
    const user = users.find(user => user.emailAddress === credentials.name);

    if(user){
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



router.get('/', authenticateUser, async (req, res) => {
    const user = req.currentUser;
    res.json({
      name: `${user.firstName} ${user.lastName}`,
      email: `${user.emailAddress}`
    });
});

router.post('/', [
  check('firstName', 'Please provide a value for "First Name"')
    .exists(),
  check('lastName', 'Please provide a value for "Last Name"')
    .exists(),
  check('emailAddress', 'Please provide a value for "Email Address"')
    .isEmail(),
  check('password', 'Please provide a value for "Password"')
    .exists()
], asyncHandler(async(req, res) => {

  const errors = validationResult(req);

  if(!errors.isEmpty()){
    const errorMessages = errors.array().map(error => error.msg);
    res.status(400).json({message: errorMessages })
  } else {
    const user = req.body;
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