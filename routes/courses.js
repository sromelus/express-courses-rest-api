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

const courseValidator = [
  check("title", 'Please provide a "title"').exists(),
  check("description", 'Please provide a "description"').exists(),
  check("estimatedTime", 'Please provide a "estimatedTime"').exists(),
  check("materialsNeeded", 'Please provide a "materialsNeeded"').exists(),
  check("userId", 'Please provide a "userId"').exists()
]

router.post('/', courseValidator, async (req, res) => {

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
})

router.put('/:id', async (req, res) => {
  const course = await Course.findByPk(req.params.id);

  if(course){
    await Course.update({
      title: req.body.title,
      description: req.body.description,
      estimatedTime: req.body.estimatedTime,
      materialsNeeded: req.body.materialsNeeded,
      userId: req.body.userId
    },
    {
      where: {
        id: req.params.id
      }
    })
    res.status(204).end();
  } else {
    res.status(404).json({'error': "Not Found"})
  }
})

router.delete('/:id', async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  await course.destroy();
  res.status(204).end();
})

module.exports = router;
