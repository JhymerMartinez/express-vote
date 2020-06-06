const app = require('./server.js')
const config = require('./config');

app.listen(config.PORT, () => {
  console.log(`App listenign on Port: ${config.PORT}`);
})
