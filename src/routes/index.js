module.exports = (app) => {
  app.use('/', require('./root'));
  app.use('/votes', require('./vote'));
  app.use('/employees', require('./employee'));
  app.use('/areas', require('./area'));
  app.use('/users', require('./user'));
};
