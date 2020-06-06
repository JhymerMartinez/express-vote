const environment = process.env.NODE_ENV || 'development';
const shared = require('./shared');
const settings = require(`./${environment}`);

module.exports = {
  ...settings,
  ...shared,
  ENV: environment,
}
