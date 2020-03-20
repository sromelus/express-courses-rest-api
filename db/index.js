'use strict';
console.log('index');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

console.info('Instantiating and configuring the Sequelize object instance...');

const options = {
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db',
  // define: {
  //   // This option removes the `createdAt` and `updatedAt` columns from the tables
  //   // that Sequelize generates from our models. These columns are often useful
  //   // with production apps, so we'd typically leave them enabled, but for our
  //   // purposes let's keep things as simple as possible.
  //   timestamps: false,
  // },
};

const sequelize = new Sequelize(options);

const models = {};

// Import all of the models.
// fs
//   .readdirSync(path.join(__dirname, 'models'))
//   .forEach((file) => {
//     console.info(`Importing database model from file: ${file}`);
//     // console.log(path.join(__dirname, 'models', file));
//     // console.log(sequelize);
//     const model = sequelize.import(path.join(__dirname, 'models', file));
//     // console.log(model);
//     console.log(model);
//     models[model.name] = model;
//     console.log(models);
//   });

// If available, call method to create associations.
// Object.keys(models).forEach((modelName) => {
//   if (models[modelName].associate) {
//     console.info(`Configuring the associations for the ${modelName} model...`);
//     models[modelName].associate(models);
//   }
// });

// module.exports = {
//   sequelize,
//   Sequelize,
//   models,
// };


const db = {
  sequelize,
  Sequelize,
};

db.models = models
db.models.Course = require('./models/course.js')(sequelize);
db.models.User = require('./models/user.js')(sequelize);

// console.log(db.models.Course);

Object.keys(models).forEach((modelName) => {
  // console.log(models[modelName].associate);
  if (models[modelName].associate) {
    console.info(`Configuring the associations for the ${modelName} model...`);
    models[modelName].associate();
  }
});

// console.log(Object.keys(models));

module.exports = db;
