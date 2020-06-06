module.exports = {
  secrets: {
    SESSION: process.env.SESSION_SECRET || 'sdhnbg67trgf65erdfsh9ikh'
  },
  PORT: process.env.PORT || 7000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/express-vote-db',
}
