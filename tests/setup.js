const mongoose = require('mongoose');
const config = require('../src/config');
const seeds = require('./mocks/seeds');
const User = require('../src/models/user');
const Area = require('../src/models/area');

async function populateDb() {
  const models = {
    users: User,
    areas: Area
  }

  const promises = [];
  for(let key in seeds) {
    seeds[key].forEach((info) => {
      const promise = models[key].create(info);
      promises.push(promise);
    });
  }
  return await Promise.all(promises);
}

async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  }
}

beforeAll(async() => {
  await mongoose.connect(config.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });
})

beforeEach(async () => {
  await removeAllCollections();
  await populateDb();
});

afterEach(async () => {
  await removeAllCollections();
});

afterAll(async () => {
  await mongoose.connection.close();
});
