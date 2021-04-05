var express = require('express');
const route = express.Router();
const USER = require('../models/User');



route.get('/dashboard', (req, res, next) =>
{
    res.send('eaminer page')

})




function ensureAuth(req,res,next) {
  if(req.session.user)
  {
    next()
  }else
  {
    res.redirect('login');
  }
  
}

module.exports = route;
