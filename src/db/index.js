const config = require('../config');
const mongoose = require('mongoose');

module.exports = {
  connect() {
    return new Promise((resolve, reject) => {
      mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true  }, (error) => {
        if (error) {
          console.error('Please make sure Mongodb is installed and running!');
          return reject(error);
        }

      });

      mongoose.connection.once('open', () => {
        if (config.ENV !== 'test') {
          console.log('Mongodb: connection successful!!');
        }
        resolve();
      });
    });

  }
}
