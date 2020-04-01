'use strict';

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

const db = {
  sequelize,
  Sequelize,
};
//
db.models = models
db.models.Course = require('./models/course.js')(sequelize);
db.models.User = require('./models/user.js')(sequelize);


//implement model associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    console.info(`Configuring the associations for the ${modelName} model...`);
    models[modelName].associate(models);
  }
});

module.exports = db;
