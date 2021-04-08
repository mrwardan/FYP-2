var express = require('express');
const route = express.Router();
const USER = require('../models/User');
const STUDENT = require('../models/Student');
const SUPERVISOR = require('../models/Supervisor');



route.get('/dashboard', (req, res, next) =>
{
    res.render('Student/studentPage')
})
route.get('/getSV', async (req, res, next) =>
{
  try {
     const SV = await STUDENT.findById(req.session.user._id).lean().populate('supervisorId');
    // const SV = await SUPERVISOR.findById(req.session.user.supervisorId).lean();
    res.json(SV);
    
  } catch (error) {
    res.json(error);
    
    
  }
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
