const moment = require("moment");

//middleware that can be intercect with any request
const logger = (req,res, next) => {
    console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}: ${moment().format()}`);
    next();
  }

  module.exports = logger;