'use strict';

const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');

//import models and sequelize from  the db folder
const { sequelize, models } = require('../db');
const { User, Course  } = models;

//import authentication and validation middleware for courses
const { authenticateUser, courseInputsValidator } = require('../authentications/auth');

router.use(express.json());

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
        next(error)
    }
  }
}


//----------------------------All Routes------------------------------

//Returns a list of courses (including the user that owns each course)
router.get('/', asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    //Use attributes property to only display specific properties to the api endpoint
    attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded', 'userId'],
    include: [{
      model: User,
      as: 'userCourse',
      attributes: ['id', 'firstName', 'lastName', 'emailAddress']

    }]
  })
  res.status(200).json(courses)
}));

//Returns a the course (including the user that owns the course) for the provided course ID
router.get('/:id', asyncHandler(async (req, res, next) => {

  const courses = await Course.findAll({
    attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded', 'userId'],
    include: [{
      model: User,
      as: 'userCourse',
      attributes: ['id', 'firstName', 'lastName', 'emailAddress']
    }]
  })

  const course = courses.find(course => course.id == req.params.id)

  if(course){
    res.status(200).json(course)
  } else {
    next();
  }

}));


//Creates a course, check for validation errors
router.post('/', authenticateUser, courseInputsValidator, asyncHandler(async (req, res) => {

  const errors = validationResult(req);

  if(!errors.isEmpty()){
    const errorMessages = errors.array().map(error => error.msg);
    res.status(400).json({ message: errorMessages })
  } else {
    const course = await Course.create({
      title: req.body.title,
      description: req.body.description,
      estimatedTime: req.body.estimatedTime,
      materialsNeeded: req.body.materialsNeeded,
      userId: req.body.userId
    })
    res.status(201).json(course)
  }
}));

//Updates a course
router.put('/:id', authenticateUser, courseInputsValidator, asyncHandler(async(req, res, next) => {

  //Used "express validator's" validationResult method to check for possible errors
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    const errorMessages = errors.array().map(error => error.msg);
    res.status(400).json({ message: errorMessages })
  } else {
    // const user = req.currentUser
    // console.log(user.id);
    // console.log(course.userId);
    // console.log(req.currentUser.id === course.userId);
    // res.status(401).json({ message: 'Access Denied'})

 // Retrieve the course and update the specified field, if there is a course with that ID
    const course = await Course.findByPk(req.params.id);

    if(course){
      if(req.currentUser.id === course.userId){
        await Course.update({
        //The validation middleware for course overrides the "||".  "||" / "OR" Allows to update just one property
          title: req.body.title || course.title,
          description: req.body.description || course.description,
          estimatedTime: req.body.estimatedTime || course.estimatedTime,
          materialsNeeded: req.body.materialsNeeded || course.materialsNeeded,
          userId: req.body.userId || course.userId
        },
        {
          where: {
            id: req.params.id
          }
        })
        res.status(204).end();
      } else {
        res.status(403).json({ message: 'Forbidden'})
      }
    } else {
      next();
    }
  }
}));

// Deletes a course
router.delete('/:id', authenticateUser, asyncHandler(async (req, res, next) => {
  const course = await Course.findByPk(req.params.id);
  if(course){
    if(req.currentUser.id === course.userId){
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({ message: 'Forbidden'})
    }
  } else {
    next();
  }
}));

module.exports = router;
