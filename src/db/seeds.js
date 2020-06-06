const config = require('../config');
const User = require('../models/user');
const Area = require('../models/area');
const db = require('../db');

const models = {
  users: User,
  areas: Area
}

const seeds = require(`./data/${config.ENV}.js`);

async function populateDb() {
  const promises = [];
  for(let key in seeds) {
    seeds[key].forEach((info) => {
      const promise = models[key].create(info);
      promises.push(promise);
    });
  }

  try {
    await Promise.all(promises);
    console.log('Seeds added successfully');
  } catch (error) {
    console.error(error);
  }
}

db.connect().then(async () => {
  await populateDb();
  process.exit(0);
});
