var express = require('express');
const route = express.Router();
var mongo = require('mongodb');
var assert = require('assert');
const USER = require('../models/User');




route.get('/signout', (req, res) => {

  req.session.destroy();
  res.redirect('login');

})



route.get('/login',   (req, res) => {
  res.render('login', { layout: false, fail: false });
})
route.get('/signup',  (req, res) => {
  res.render('Rform');
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
