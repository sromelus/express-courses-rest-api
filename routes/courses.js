'use strict';

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { sequelize, models } = require('../db');
const { User, Course  } = models;

router.use(express.json());

function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
        res.status(500).json({error});
    }
  }
}

router.get('/', async (req, res) => {
  const courses = await Course.findAll({
    include: [{
      model: User,
      as: 'userCourse'
    }]
  })
  res.status(200).json(courses)
})

router.get('/:id', async (req, res) => {
  const courses = await Course.findAll({
    include: [{
      model: User,
      as: 'userCourse'
    }]
  })
  const course = courses.find(course => course.id == req.params.id)
  res.status(200).json(course)
})

const courseValidaor = [
  check("title", 'Please provide a "title"').exists(),
  check("description", 'Please provide a "description"').exists(),
  check("estimatedTime", 'Please provide a "estimatedTime"').exists(),
  check("materialsNeeded", 'Please provide a "materialsNeeded"').exists(),
  check("userId", 'Please provide a "userId"').exists()
]

router.post('/', async (req, res) => {
  const course = await Course.create({
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded,
    userId: req.body.userId
  })
  res.status(201).json(course)
})


module.exports = router;


// GET /api/courses 200 - Returns a list of courses (including the user that owns each course)
// GET /api/courses/:id 200 - Returns a the course (including the user that owns the course) for the provided course ID
// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
// PUT /api/courses/:id 204 - Updates a course and returns no content
// DELETE /api/courses/:id 204 - Deletes a course and returns no content

// const courses = await Course.findAll({
//       include: [
//         {
//          model: User,
//          as: 'userCourse'
//        }
//      ]
//     })
